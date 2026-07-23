# FTL Transfer

一个轻量的局域网文件传输 Web App。同一 Wi-Fi / 局域网内的设备打开同一个地址，即可自动发现彼此并发送文件。

## 启动

```bash
go run .
```

默认会由系统随机选择一个当前可用端口。终端和页面右上角都会显示局域网地址，例如
`http://192.168.1.10:53142`；点击页面中的地址可以复制。在其他设备的浏览器中打开该地址即可。

可选配置：

```bash
PORT=9000 MAX_FILE_MB=4096 go run .
```

设置 `PORT` 可以固定端口；不设置时每次启动可能使用不同端口。

如果其他设备无法连接，建议先固定端口并保持启动终端处于运行状态：

```bash
PORT=8080 go run .
```

设备需要处于同一普通 Wi-Fi（非访客网络），且路由器未开启 AP／客户端隔离。

## 构建二进制文件

构建 Windows、macOS 和 Linux 的 amd64／arm64 版本：

```bash
make
```

产物会写入 `dist/`。可以通过 `VERSION` 设置文件名中的版本号：

```bash
make VERSION=1.0.0
```

仅构建当前平台，或清理构建产物：

```bash
make build
make clean
```

也可以覆盖目标平台列表：

```bash
make release PLATFORMS="linux/amd64 freebsd/amd64 windows/amd64"
```

文件只暂存在运行服务的电脑上：普通文件保留最多 2 小时，已完成或拒绝的文件会更快清理；服务退出时全部删除。
