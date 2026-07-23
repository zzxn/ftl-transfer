package main

import (
	"archive/tar"
	"archive/zip"
	"bytes"
	"compress/gzip"
	"crypto/sha256"
	"encoding/binary"
	"flag"
	"fmt"
	"html"
	"image"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

func main() {
	dist := flag.String("dist", "dist", "directory containing release binaries")
	icon := flag.String("icon", "web/icon.png", "application icon PNG")
	version := flag.String("version", "dev", "application version")
	flag.Parse()

	files, err := filepath.Glob(filepath.Join(*dist, "ftl-transfer-*"))
	check(err)
	releaseDir := filepath.Join(*dist, "release")
	check(os.MkdirAll(releaseDir, 0o755))

	var archives []string
	for _, path := range files {
		info, err := os.Stat(path)
		check(err)
		if info.IsDir() {
			continue
		}
		name := filepath.Base(path)
		if strings.HasSuffix(name, ".exe") {
			archive := filepath.Join(releaseDir, strings.TrimSuffix(name, ".exe")+".zip")
			check(writeZIP(archive, path, name))
			archives = append(archives, archive)
			continue
		}
		if strings.Contains(name, "-darwin-") {
			archive := filepath.Join(releaseDir, name+".tar.gz")
			check(writeMacAppTar(archive, path, *icon, *version))
			archives = append(archives, archive)
			continue
		}
		archive := filepath.Join(releaseDir, name+".tar.gz")
		check(writeTarGz(archive, path, name))
		archives = append(archives, archive)
	}
	if len(archives) == 0 {
		check(fmt.Errorf("no binaries found in %s", *dist))
	}
	sort.Strings(archives)
	check(writeChecksums(filepath.Join(releaseDir, "checksums.txt"), archives))
}

func writeMacAppTar(destination, binaryPath, iconPath, version string) error {
	iconFile, err := os.Open(iconPath)
	if err != nil {
		return err
	}
	sourceImage, _, err := image.Decode(iconFile)
	closeErr := iconFile.Close()
	if err != nil {
		return err
	}
	if closeErr != nil {
		return closeErr
	}
	icns, err := makeICNS(sourceImage)
	if err != nil {
		return err
	}
	binary, err := os.ReadFile(binaryPath)
	if err != nil {
		return err
	}
	safeVersion := html.EscapeString(version)
	plist := []byte(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>FTL Transfer</string>
  <key>CFBundleDisplayName</key><string>FTL Transfer</string>
  <key>CFBundleIdentifier</key><string>dev.zzxn.ftl-transfer</string>
  <key>CFBundleVersion</key><string>` + safeVersion + `</string>
  <key>CFBundleShortVersionString</key><string>` + safeVersion + `</string>
  <key>CFBundleExecutable</key><string>launcher</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>LSMinimumSystemVersion</key><string>10.13</string>
</dict>
</plist>
`)
	launcher := []byte(`#!/bin/sh
CONTENTS="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
OPEN_BROWSER=1 exec "$CONTENTS/MacOS/ftl-transfer"
`)

	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	gz := gzip.NewWriter(out)
	tw := tar.NewWriter(gz)
	entries := []struct {
		name string
		mode int64
		data []byte
	}{
		{"FTL Transfer.app/Contents/Info.plist", 0o644, plist},
		{"FTL Transfer.app/Contents/MacOS/launcher", 0o755, launcher},
		{"FTL Transfer.app/Contents/MacOS/ftl-transfer", 0o755, binary},
		{"FTL Transfer.app/Contents/Resources/AppIcon.icns", 0o644, icns},
	}
	for _, entry := range entries {
		if err = tw.WriteHeader(&tar.Header{Name: entry.name, Mode: entry.mode, Size: int64(len(entry.data))}); err != nil {
			break
		}
		if _, err = tw.Write(entry.data); err != nil {
			break
		}
	}
	if closeErr := tw.Close(); err == nil {
		err = closeErr
	}
	if closeErr := gz.Close(); err == nil {
		err = closeErr
	}
	if closeErr := out.Close(); err == nil {
		err = closeErr
	}
	return err
}

func makeICNS(source image.Image) ([]byte, error) {
	types := []struct {
		name string
		size int
	}{
		{"ic07", 128},
		{"ic08", 256},
		{"ic09", 512},
		{"ic10", 1024},
	}
	var chunks bytes.Buffer
	for _, item := range types {
		var encoded bytes.Buffer
		if err := png.Encode(&encoded, resizeNearest(source, item.size)); err != nil {
			return nil, err
		}
		chunks.WriteString(item.name)
		_ = binary.Write(&chunks, binary.BigEndian, uint32(encoded.Len()+8))
		chunks.Write(encoded.Bytes())
	}
	var result bytes.Buffer
	result.WriteString("icns")
	_ = binary.Write(&result, binary.BigEndian, uint32(chunks.Len()+8))
	result.Write(chunks.Bytes())
	return result.Bytes(), nil
}

func resizeNearest(source image.Image, size int) image.Image {
	bounds := source.Bounds()
	out := image.NewNRGBA(image.Rect(0, 0, size, size))
	for y := 0; y < size; y++ {
		sourceY := bounds.Min.Y + y*bounds.Dy()/size
		for x := 0; x < size; x++ {
			sourceX := bounds.Min.X + x*bounds.Dx()/size
			out.Set(x, y, source.At(sourceX, sourceY))
		}
	}
	return out
}

func writeZIP(destination, source, name string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	zw := zip.NewWriter(out)
	header := &zip.FileHeader{Name: name, Method: zip.Deflate}
	header.SetMode(0o755)
	entry, err := zw.CreateHeader(header)
	if err == nil {
		err = copyFile(entry, source)
	}
	if closeErr := zw.Close(); err == nil {
		err = closeErr
	}
	if closeErr := out.Close(); err == nil {
		err = closeErr
	}
	return err
}

func writeTarGz(destination, source, name string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	gz := gzip.NewWriter(out)
	tw := tar.NewWriter(gz)
	info, err := os.Stat(source)
	if err == nil {
		err = tw.WriteHeader(&tar.Header{Name: name, Mode: 0o755, Size: info.Size()})
	}
	if err == nil {
		err = copyFile(tw, source)
	}
	if closeErr := tw.Close(); err == nil {
		err = closeErr
	}
	if closeErr := gz.Close(); err == nil {
		err = closeErr
	}
	if closeErr := out.Close(); err == nil {
		err = closeErr
	}
	return err
}

func writeChecksums(destination string, archives []string) error {
	out, err := os.Create(destination)
	if err != nil {
		return err
	}
	defer out.Close()
	for _, path := range archives {
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		hash := sha256.New()
		_, copyErr := io.Copy(hash, file)
		closeErr := file.Close()
		if copyErr != nil {
			return copyErr
		}
		if closeErr != nil {
			return closeErr
		}
		if _, err := fmt.Fprintf(out, "%x  %s\n", hash.Sum(nil), filepath.Base(path)); err != nil {
			return err
		}
	}
	return nil
}

func copyFile(destination io.Writer, source string) error {
	file, err := os.Open(source)
	if err != nil {
		return err
	}
	defer file.Close()
	_, err = io.Copy(destination, file)
	return err
}

func check(err error) {
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
