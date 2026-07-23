<p align="center">
  <a href="README.zh-CN.md">简体中文</a> · <strong>繁體中文</strong> · <a href="README.md">English</a> · <a href="README.ja.md">日本語</a>
</p>

<p align="center"><img src="web/icon.png" width="128" height="128" alt="FTL Transfer 圖示"></p>
<h1 align="center">FTL Transfer</h1>
<p align="center">
  簡單、快速、無需帳號的區域網路檔案傳輸工具。<br>
  讓電腦、手機和平板在同一個 Wi-Fi 中互相傳送檔案。
</p>
<p align="center">
  <a href="https://github.com/zzxn/ftl-transfer/releases/latest"><strong>下載最新版本</strong></a>
  · <a href="#常見問題">常見問題</a>
</p>

## 為什麼選擇 FTL？

- **無需安裝用戶端：** 只需一台電腦執行 FTL，其他裝置透過瀏覽器加入
- **自動探索裝置：** 開啟相同頁面的裝置會自動出現在清單中
- **不經過雲端：** 檔案只在目前的區域網路內傳輸
- **跨平台：** 支援 Windows、macOS、Linux、Android、iPhone 和 iPad
- **操作簡單：** 選擇裝置、拖入檔案，對方點擊接收即可
- **自動清理：** 暫存檔案會定期刪除，關閉 FTL 時立即全部清除

## 下載

前往 [Releases](https://github.com/zzxn/ftl-transfer/releases/latest)，依照電腦選擇版本：

| 電腦 | 下載檔案 |
| --- | --- |
| 一般 Windows 電腦 | `windows-amd64.zip` |
| Windows ARM 電腦 | `windows-arm64.zip` |
| Apple 晶片 Mac（M1/M2/M3/M4 等） | `darwin-arm64.tar.gz` |
| Intel 晶片 Mac | `darwin-amd64.tar.gz` |
| 一般 64 位元 Linux 電腦 | `linux-amd64.tar.gz` |
| ARM64 Linux 裝置 | `linux-arm64.tar.gz` |

不確定該選哪個？多數 Windows 電腦請選 **windows-amd64**；近年的 Apple 晶片 Mac 請選 **darwin-arm64**。

## 使用方式

### 1. 在一台電腦上啟動 FTL

**Windows：** 解壓縮 ZIP，連按兩下 `.exe`。若 Windows 防火牆詢問是否允許存取，請勾選 **私人網路** 並允許。

**macOS：** 解壓縮後將 `FTL Transfer.app` 拖入「應用程式」並開啟。由於應用程式目前尚未經 Apple 開發者簽署，首次啟動可能需要按右鍵並選擇 **打開**。

**Linux：** 解壓縮後在終端機執行：

```bash
./ftl-transfer-version-linux-amd64
```

### 2. 讓其他裝置加入

FTL 右上角會顯示類似以下的連線位址：

```text
http://192.168.1.10:53142
```

讓其他裝置連接相同 Wi-Fi，然後在瀏覽器中開啟此位址。點擊位址即可複製。

> 只需要在一台電腦上執行 FTL。所有裝置都必須開啟該電腦提供的相同位址。

### 3. 傳送檔案

1. 選擇接收裝置
2. 選取檔案，或將檔案拖入傳送區域
3. 接收方點擊 **接收**
4. 瀏覽器開始下載檔案

支援一次傳送多個檔案，預設單一檔案最大 2 GB。

## 隱私與安全

FTL 不需要帳號，也不會將檔案上傳至網際網路。檔案會暫存在執行 FTL 的電腦上：

- 未完成的檔案最多保留 2 小時
- 已完成或拒絕的檔案會更快清理
- 關閉 FTL 後，所有暫存檔案立即刪除

請僅在可信任的家庭、辦公室或個人熱點網路中使用。

## 常見問題

### 其他裝置無法開啟連線位址

- 確認兩台裝置連接相同 Wi-Fi
- 在 Windows 防火牆中允許 FTL 存取私人網路
- 不要使用訪客 Wi-Fi
- 關閉路由器的 AP／用戶端隔離
- 保持 FTL 程式執行
- 輸入完整的 `http://IP:連接埠`

### 清單中看不到其他裝置

確認兩台裝置開啟完全相同的位址，並保持頁面開啟。裝置通常會在 4 秒內出現。

### Windows 顯示「未知的發行者」

FTL 目前尚未進行商業程式碼簽署，因此 Windows SmartScreen 可能顯示警告。請只從本專案的
[Releases](https://github.com/zzxn/ftl-transfer/releases/latest) 下載。發布內容包含可供 SHA-256 驗證的 `checksums.txt`。

<details>
<summary><strong>開發者資訊</strong></summary>

需要 Go 1.23 或更新版本。

```bash
# 從原始碼執行
go run .

# 建置所有平台
make VERSION=1.0.0

# 建置發布壓縮檔
make package VERSION=1.0.0
```

可選設定：

```bash
PORT=8080 MAX_FILE_MB=4096 go run .
```

推送 `v*` 格式的 Git Tag 後，GitHub Actions 會自動測試、建置並發布。

</details>

---

<p align="center">Made by zzxn with ♥</p>
