<p align="center">
  <strong>简体中文</strong> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <img src="web/icon.png" width="128" height="128" alt="FTL Transfer 图标">
</p>

<h1 align="center">FTL Transfer</h1>

<p align="center">
  简单、快速、无需登录的局域网文件传输工具。
  <br>
  让手机、电脑和平板在同一 Wi-Fi 下互相发送文件。
</p>

<p align="center">
  <a href="https://github.com/zzxn/ftl-transfer/releases/latest"><strong>下载最新版本</strong></a>
  ·
  <a href="#常见问题">常见问题</a>
</p>

## 为什么选择 FTL？

- **无需安装客户端**：只需一台电脑运行 FTL，其他设备用浏览器打开连接地址
- **自动发现设备**：进入同一个页面的设备会自动出现在列表中
- **不经过互联网**：文件只在当前局域网内传输，不上传到云端
- **跨平台使用**：支持 Windows、macOS、Linux、Android 和 iPhone/iPad
- **简单直观**：选择设备，拖入文件，对方点击接收即可
- **自动清理**：传输文件会定时删除，关闭程序时立即全部清除

## 下载

前往 [Releases](https://github.com/zzxn/ftl-transfer/releases/latest)，根据电脑选择对应版本：

| 电脑 | 下载文件 |
| --- | --- |
| 常见的 Windows 电脑 | `windows-amd64.zip` |
| Windows ARM 电脑 | `windows-arm64.zip` |
| Apple 芯片 Mac（M1/M2/M3/M4 等） | `darwin-arm64.tar.gz` |
| Intel 芯片 Mac | `darwin-amd64.tar.gz` |
| 常见的 64 位 Linux 电脑 | `linux-amd64.tar.gz` |
| ARM64 Linux 设备 | `linux-arm64.tar.gz` |

不知道选哪个？绝大多数 Windows 电脑请选择 **windows-amd64**；近年的 Apple 芯片 Mac 请选择 **darwin-arm64**。

## 使用方法

### 1. 在一台电脑上启动 FTL

**Windows**

解压下载的 ZIP，双击 `ftl-transfer-...exe`。如果 Windows 防火墙询问是否允许访问，请勾选 **专用网络** 并允许。

**macOS**

解压下载的文件，将 `FTL Transfer.app` 拖入“应用程序”后打开。由于应用暂未进行 Apple 开发者签名，首次启动可能需要右键点击应用并选择 **打开**。

**Linux**

解压后在终端运行：

```bash
./ftl-transfer-版本-linux-amd64
```

### 2. 让其他设备加入

启动后，页面右上角会显示类似下面的连接地址：

```text
http://192.168.1.10:53142
```

让手机、平板和其他电脑连接同一个 Wi-Fi，然后在浏览器中打开这个地址。也可以点击页面右上角的地址进行复制。

> 只需要在一台电脑上运行 FTL。所有设备必须打开这台电脑提供的同一个地址，不要在每台设备上分别运行程序。

### 3. 发送文件

1. 在设备列表中选择接收设备
2. 点击文件区域选择文件，或直接把文件拖进去
3. 接收方点击 **接收**
4. 浏览器开始下载文件

支持连续发送多个文件，默认单文件最大 2 GB。

## 隐私与安全

FTL 不需要账号，也不会把文件上传到互联网。文件会暂存在运行 FTL 的电脑上，用于让接收设备下载：

- 未完成的文件最多保留 2 小时
- 已完成或拒绝的文件会更快清理
- 关闭 FTL 后，所有临时文件立即删除

请仅在你信任的家庭、办公或个人热点网络中使用，不建议在公共 Wi-Fi 中运行。

## 常见问题

### 其他设备打不开连接地址

请依次检查：

- 两台设备是否连接了同一个 Wi-Fi
- Windows 防火墙是否允许 FTL 访问“专用网络”
- 是否误用了访客 Wi-Fi
- 路由器是否开启了 AP 隔离或客户端隔离
- 运行 FTL 的窗口是否仍然打开
- 浏览器中是否输入了完整的 `http://IP:端口`

### 页面一直显示“正在获取连接地址”

请确认使用的是最新版本，然后按 `Ctrl + F5` 强制刷新页面。旧版本在部分 Windows Edge 环境中可能无法初始化设备信息。

### 设备列表中看不到另一台设备

确认两台设备打开的是完全相同的连接地址，并让页面保持打开。设备通常会在 4 秒内出现。

### Windows 提示“未知发布者”

目前程序没有商业代码签名，因此 Windows SmartScreen 可能显示提醒。确认文件来自本仓库的
[Releases](https://github.com/zzxn/ftl-transfer/releases/latest) 后，可以选择“更多信息”并继续运行。
发布页提供 `checksums.txt`，可用于校验下载文件的 SHA-256。

<details>
<summary><strong>开发与源码运行</strong></summary>

### 环境要求

- Go 1.23 或更高版本
- GNU Make（仅构建发布包时需要）

### 从源码启动

```bash
go run .
```

可以固定端口或修改单文件大小上限：

```bash
PORT=8080 MAX_FILE_MB=4096 go run .
```

### 构建

```bash
# 构建所有平台
make VERSION=1.0.0

# 构建 GitHub Release 压缩包
make package VERSION=1.0.0

# 仅构建当前平台
make build

# 清理产物
make clean
```

推送 `v*` 格式的 Git Tag 会触发 GitHub Actions，自动测试、构建并发布压缩包。

</details>

---

<p align="center">Made by zzxn with ♥</p>
