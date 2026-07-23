package main

import (
	"crypto/rand"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed web/*
var webFS embed.FS

type device struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	LastSeen time.Time `json:"-"`
}

type transfer struct {
	ID        string    `json:"id"`
	From      string    `json:"from"`
	FromName  string    `json:"fromName"`
	To        string    `json:"to"`
	Name      string    `json:"name"`
	Size      int64     `json:"size"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	Path      string    `json:"-"`
}

type app struct {
	mu        sync.RWMutex
	devices   map[string]device
	transfers map[string]*transfer
	tempDir   string
	maxSize   int64
}

func main() {
	port := env("PORT", "0")
	maxMB, _ := strconv.ParseInt(env("MAX_FILE_MB", "2048"), 10, 64)
	tempDir, err := os.MkdirTemp("", "ftl-transfer-*")
	if err != nil {
		log.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	a := &app{
		devices:   make(map[string]device),
		transfers: make(map[string]*transfer),
		tempDir:   tempDir,
		maxSize:   maxMB * 1024 * 1024,
	}
	go a.cleanup()

	mux := http.NewServeMux()
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatal(err)
	}
	actualPort := strconv.Itoa(listener.Addr().(*net.TCPAddr).Port)
	addresses := localURLs(actualPort)
	mux.HandleFunc("GET /api/info", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, map[string]any{"port": actualPort, "addresses": addresses})
	})
	mux.HandleFunc("POST /api/heartbeat", a.heartbeat)
	mux.HandleFunc("GET /api/devices", a.listDevices)
	mux.HandleFunc("POST /api/transfers", a.upload)
	mux.HandleFunc("GET /api/transfers", a.listTransfers)
	mux.HandleFunc("POST /api/transfers/{id}/accept", a.setStatus("accepted"))
	mux.HandleFunc("POST /api/transfers/{id}/reject", a.setStatus("rejected"))
	mux.HandleFunc("POST /api/transfers/{id}/complete", a.setStatus("completed"))
	mux.HandleFunc("GET /api/transfers/{id}/download", a.download)
	mux.Handle("/", http.FileServer(http.FS(mustSub(webFS, "web"))))

	log.Printf("FTL Transfer 已启动")
	log.Printf("本机访问: http://localhost:%s", actualPort)
	for _, address := range addresses {
		log.Printf("局域网访问: %s", address)
	}
	if os.Getenv("OPEN_BROWSER") == "1" {
		go openBrowser("http://localhost:" + actualPort)
	}
	log.Fatal(http.Serve(listener, securityHeaders(mux)))
}

func (a *app) heartbeat(w http.ResponseWriter, r *http.Request) {
	var in struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	}
	if json.NewDecoder(r.Body).Decode(&in) != nil || in.ID == "" {
		fail(w, r, "设备信息无效", 400)
		return
	}
	in.ID = cleanID(in.ID)
	in.Name = strings.TrimSpace(in.Name)
	if in.Name == "" {
		in.Name = "未命名设备"
	}
	if len(in.Name) > 40 {
		in.Name = in.Name[:40]
	}
	a.mu.Lock()
	a.devices[in.ID] = device{ID: in.ID, Name: in.Name, LastSeen: time.Now()}
	a.mu.Unlock()
	writeJSON(w, map[string]any{"ok": true})
}

func (a *app) listDevices(w http.ResponseWriter, r *http.Request) {
	self := r.URL.Query().Get("self")
	cutoff := time.Now().Add(-15 * time.Second)
	out := make([]device, 0)
	a.mu.RLock()
	for _, d := range a.devices {
		if d.ID != self && d.LastSeen.After(cutoff) {
			out = append(out, d)
		}
	}
	a.mu.RUnlock()
	writeJSON(w, out)
}

func (a *app) upload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, a.maxSize+(2<<20))
	if err := r.ParseMultipartForm(2 << 20); err != nil {
		fail(w, r, fmt.Sprintf("文件过大或上传失败（上限 %d MB）", a.maxSize/(1024*1024)), 413)
		return
	}
	from, to := cleanID(r.FormValue("from")), cleanID(r.FormValue("to"))
	if from == "" || to == "" || from == to {
		fail(w, r, "发送方或接收方无效", 400)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		fail(w, r, "没有选择文件", 400)
		return
	}
	defer file.Close()
	id := randomID()
	path := filepath.Join(a.tempDir, id)
	dst, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0600)
	if err != nil {
		fail(w, r, "无法保存文件", 500)
		return
	}
	size, copyErr := io.Copy(dst, file)
	closeErr := dst.Close()
	if copyErr != nil || closeErr != nil {
		os.Remove(path)
		fail(w, r, "文件上传中断", 500)
		return
	}
	name := filepath.Base(strings.ReplaceAll(header.Filename, "\\", "/"))
	if name == "." || name == "" {
		name = "未命名文件"
	}
	a.mu.Lock()
	fromName := "未知设备"
	if d, ok := a.devices[from]; ok {
		fromName = d.Name
	}
	t := &transfer{ID: id, From: from, FromName: fromName, To: to, Name: name, Size: size, Status: "pending", CreatedAt: time.Now(), Path: path}
	a.transfers[id] = t
	a.mu.Unlock()
	writeJSON(w, t)
}

func (a *app) listTransfers(w http.ResponseWriter, r *http.Request) {
	id := cleanID(r.URL.Query().Get("device"))
	out := make([]*transfer, 0)
	a.mu.RLock()
	for _, t := range a.transfers {
		if t.From == id || t.To == id {
			cp := *t
			out = append(out, &cp)
		}
	}
	a.mu.RUnlock()
	writeJSON(w, out)
}

func (a *app) setStatus(status string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		deviceID := cleanID(r.URL.Query().Get("device"))
		id := r.PathValue("id")
		a.mu.Lock()
		t, ok := a.transfers[id]
		if !ok || (t.From != deviceID && t.To != deviceID) {
			a.mu.Unlock()
			fail(w, r, "传输不存在", 404)
			return
		}
		if status == "accepted" && t.To != deviceID {
			a.mu.Unlock()
			fail(w, r, "只有接收方可以接受文件", 403)
			return
		}
		if status == "rejected" && t.To != deviceID {
			a.mu.Unlock()
			fail(w, r, "只有接收方可以拒绝文件", 403)
			return
		}
		t.Status = status
		a.mu.Unlock()
		writeJSON(w, map[string]any{"ok": true})
	}
}

func (a *app) download(w http.ResponseWriter, r *http.Request) {
	deviceID := cleanID(r.URL.Query().Get("device"))
	a.mu.RLock()
	t, ok := a.transfers[r.PathValue("id")]
	if ok {
		cp := *t
		t = &cp
	}
	a.mu.RUnlock()
	if !ok || t.To != deviceID || (t.Status != "accepted" && t.Status != "completed") {
		fail(w, r, "文件不可下载", 403)
		return
	}
	w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": t.Name}))
	w.Header().Set("Content-Type", "application/octet-stream")
	http.ServeFile(w, r, t.Path)
}

func (a *app) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		var remove []string
		a.mu.Lock()
		for id, d := range a.devices {
			if now.Sub(d.LastSeen) > time.Minute {
				delete(a.devices, id)
			}
		}
		for id, t := range a.transfers {
			age := now.Sub(t.CreatedAt)
			if age > 2*time.Hour || ((t.Status == "completed" || t.Status == "rejected") && age > 10*time.Minute) {
				remove = append(remove, t.Path)
				delete(a.transfers, id)
			}
		}
		a.mu.Unlock()
		for _, path := range remove {
			os.Remove(path)
		}
	}
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

func cleanID(s string) string {
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}
	if b.Len() > 64 {
		return b.String()[:64]
	}
	return b.String()
}

func randomID() string {
	b := make([]byte, 12)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(v)
}

func fail(w http.ResponseWriter, r *http.Request, msg string, status int) {
	language := r.Header.Get("X-FTL-Language")
	if language == "" {
		language = r.Header.Get("Accept-Language")
	}
	msg = translateError(msg, language)
	w.WriteHeader(status)
	writeJSON(w, map[string]string{"error": msg})
}

func translateError(message, acceptLanguage string) string {
	language := "en"
	header := strings.ToLower(acceptLanguage)
	if strings.HasPrefix(header, "zh") {
		return message
	}
	if strings.HasPrefix(header, "ja") {
		language = "ja"
	}
	sizePrefix := "文件过大或上传失败（上限 "
	if strings.HasPrefix(message, sizePrefix) {
		limit := strings.TrimSuffix(strings.TrimPrefix(message, sizePrefix), "）")
		if language == "ja" {
			return "ファイルが大きすぎるか、アップロードに失敗しました（上限 " + limit + "）"
		}
		return "The file is too large or the upload failed (limit: " + limit + ")"
	}
	translations := map[string][2]string{
		"设备信息无效":      {"Invalid device information", "デバイス情報が無効です"},
		"发送方或接收方无效":   {"Invalid sender or receiver", "送信元または受信先が無効です"},
		"没有选择文件":      {"No file selected", "ファイルが選択されていません"},
		"无法保存文件":      {"Unable to save the file", "ファイルを保存できません"},
		"文件上传中断":      {"The upload was interrupted", "アップロードが中断されました"},
		"传输不存在":       {"Transfer not found", "転送が見つかりません"},
		"只有接收方可以接受文件": {"Only the receiver can accept the file", "受信側のみファイルを受け取れます"},
		"只有接收方可以拒绝文件": {"Only the receiver can reject the file", "受信側のみファイルを拒否できます"},
		"文件不可下载":      {"The file is not available for download", "ファイルをダウンロードできません"},
	}
	if translated, ok := translations[message]; ok {
		if language == "ja" {
			return translated[1]
		}
		return translated[0]
	}
	return message
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func mustSub(fsys embed.FS, dir string) fs.FS {
	sub, err := fs.Sub(fsys, dir)
	if err != nil {
		panic(err)
	}
	return sub
}

func localIPs() []string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return nil
	}
	var out []string
	seen := make(map[string]bool)
	for _, iface := range interfaces {
		// Some development environments assign private-looking addresses to the
		// loopback interface. Checking the interface flags prevents those
		// unreachable addresses from being advertised to other devices.
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			ip = ip.To4()
			if ip == nil || ip.IsLoopback() || ip.IsUnspecified() {
				continue
			}
			value := ip.String()
			if !seen[value] {
				seen[value] = true
				out = append(out, value)
			}
		}
	}
	return out
}

func localURLs(port string) []string {
	var out []string
	for _, ip := range localIPs() {
		out = append(out, "http://"+net.JoinHostPort(ip, port))
	}
	return out
}

func openBrowser(url string) {
	time.Sleep(300 * time.Millisecond)
	var command *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		command = exec.Command("open", url)
	case "windows":
		command = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		command = exec.Command("xdg-open", url)
	}
	_ = command.Start()
}
