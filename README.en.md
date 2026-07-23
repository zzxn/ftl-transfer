<p align="center">
  <a href="README.md">简体中文</a> · <strong>English</strong> · <a href="README.ja.md">日本語</a>
</p>

<p align="center"><img src="web/icon.png" width="128" height="128" alt="FTL Transfer icon"></p>
<h1 align="center">FTL Transfer</h1>
<p align="center">
  Simple, fast, account-free file transfer over your local network.<br>
  Send files between computers, phones, and tablets on the same Wi-Fi.
</p>
<p align="center">
  <a href="https://github.com/zzxn/ftl-transfer/releases/latest"><strong>Download the latest release</strong></a>
  · <a href="#troubleshooting">Troubleshooting</a>
</p>

## Why FTL?

- **No client installation:** run FTL on one computer; every other device joins from a browser
- **Automatic discovery:** devices on the same page appear automatically
- **No cloud:** files stay within your local network
- **Cross-platform:** works with Windows, macOS, Linux, Android, iPhone, and iPad
- **Easy to use:** choose a device, drop a file, and let the recipient accept it
- **Automatic cleanup:** temporary files are deleted on a schedule and removed when FTL exits

## Download

Open [Releases](https://github.com/zzxn/ftl-transfer/releases/latest) and choose the file for your computer:

| Computer | Download |
| --- | --- |
| Most Windows PCs | `windows-amd64.zip` |
| Windows on ARM | `windows-arm64.zip` |
| Apple silicon Mac (M1/M2/M3/M4, etc.) | `darwin-arm64.tar.gz` |
| Intel Mac | `darwin-amd64.tar.gz` |
| Most 64-bit Linux PCs | `linux-amd64.tar.gz` |
| ARM64 Linux device | `linux-arm64.tar.gz` |

If you are unsure, most Windows users need **windows-amd64**, while modern Macs with Apple silicon need **darwin-arm64**.

## How to use

### 1. Start FTL on one computer

**Windows:** Extract the ZIP and double-click the `.exe`. If Windows Firewall asks for access, allow it on **Private networks**.

**macOS:** Extract the archive, move `FTL Transfer.app` to Applications, and open it. The app is not currently signed by an Apple Developer certificate, so you may need to right-click it and choose **Open** the first time.

**Linux:** Extract the archive and run:

```bash
./ftl-transfer-version-linux-amd64
```

### 2. Join from other devices

FTL displays a connection address in the top-right corner:

```text
http://192.168.1.10:53142
```

Connect the other devices to the same Wi-Fi and open that address in their browsers. You can click the address to copy it.

> Run FTL on only one computer. Every device must open the exact same address provided by that computer.

### 3. Send a file

1. Select the receiving device
2. Choose files or drag them into the drop area
3. The recipient clicks **Accept**
4. The browser downloads the file

Multiple files are supported. The default maximum size is 2 GB per file.

## Privacy and security

FTL needs no account and does not upload files to the internet. Files are temporarily stored on the computer running FTL:

- Pending files are kept for no more than two hours
- Completed or rejected files are removed sooner
- All temporary files are deleted when FTL exits

Use FTL only on a trusted home, office, or personal hotspot network.

## Troubleshooting

### Another device cannot open the address

- Make sure both devices use the same Wi-Fi
- Allow FTL through Windows Firewall on Private networks
- Do not use a guest Wi-Fi network
- Disable AP/client isolation on the router
- Keep the FTL process running
- Enter the full `http://IP:port` address

### A device does not appear

Make sure both devices opened the exact same address and keep both pages open. Discovery normally takes up to four seconds.

### Windows says “Unknown publisher”

FTL is not commercially code-signed yet, so Windows SmartScreen may display a warning. Only download it from this repository's
[Releases](https://github.com/zzxn/ftl-transfer/releases/latest). Each release includes `checksums.txt` for SHA-256 verification.

<details>
<summary><strong>Development</strong></summary>

Requires Go 1.23 or newer.

```bash
# Run from source
go run .

# Build every platform
make VERSION=1.0.0

# Build release archives
make package VERSION=1.0.0
```

Optional settings:

```bash
PORT=8080 MAX_FILE_MB=4096 go run .
```

Pushing a `v*` Git tag triggers GitHub Actions to test, build, and publish a release automatically.

</details>

---

<p align="center">Made by zzxn with ♥</p>
