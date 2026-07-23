<p align="center">
  <a href="README.md">简体中文</a> · <a href="README.en.md">English</a> · <strong>日本語</strong>
</p>

<p align="center"><img src="web/icon.png" width="128" height="128" alt="FTL Transfer アイコン"></p>
<h1 align="center">FTL Transfer</h1>
<p align="center">
  シンプルで高速、アカウント不要のLANファイル転送ツール。<br>
  同じWi-Fi上のパソコン、スマートフォン、タブレット間でファイルを送信できます。
</p>
<p align="center">
  <a href="https://github.com/zzxn/ftl-transfer/releases/latest"><strong>最新版をダウンロード</strong></a>
  · <a href="#トラブルシューティング">トラブルシューティング</a>
</p>

## FTLを選ぶ理由

- **クライアントのインストール不要：** 1台のパソコンでFTLを実行し、他のデバイスはブラウザから参加
- **デバイスを自動検出：** 同じページを開いたデバイスが自動的に表示
- **クラウド不使用：** ファイルはローカルネットワーク内だけで転送
- **クロスプラットフォーム：** Windows、macOS、Linux、Android、iPhone/iPadに対応
- **かんたん操作：** デバイスを選び、ファイルをドロップして、相手が受信するだけ
- **自動クリーンアップ：** 一時ファイルを定期的に削除し、FTL終了時にすべて消去

## ダウンロード

[Releases](https://github.com/zzxn/ftl-transfer/releases/latest) を開き、お使いのパソコンに合うファイルを選択してください。

| パソコン | ダウンロード |
| --- | --- |
| 一般的なWindows PC | `windows-amd64.zip` |
| Windows ARM PC | `windows-arm64.zip` |
| Appleシリコン搭載Mac（M1/M2/M3/M4など） | `darwin-arm64.tar.gz` |
| Intel Mac | `darwin-amd64.tar.gz` |
| 一般的な64ビットLinux PC | `linux-amd64.tar.gz` |
| ARM64 Linuxデバイス | `linux-arm64.tar.gz` |

迷った場合、ほとんどのWindows PCは **windows-amd64**、新しいAppleシリコンMacは **darwin-arm64** です。

## 使い方

### 1. 1台のパソコンでFTLを起動

**Windows：** ZIPを展開して `.exe` をダブルクリックします。Windowsファイアウォールが表示されたら、**プライベートネットワーク**でのアクセスを許可してください。

**macOS：** アーカイブを展開し、`FTL Transfer.app`を「アプリケーション」に移動して開きます。現在Apple Developer署名がないため、初回はアプリを右クリックして **開く** を選ぶ必要があります。

**Linux：** アーカイブを展開し、ターミナルで実行します。

```bash
./ftl-transfer-version-linux-amd64
```

### 2. 他のデバイスから参加

FTLの右上に次のような接続アドレスが表示されます。

```text
http://192.168.1.10:53142
```

他のデバイスを同じWi-Fiに接続し、ブラウザでこのアドレスを開きます。アドレスをクリックするとコピーできます。

> FTLを実行するパソコンは1台だけです。すべてのデバイスで、そのパソコンが表示する同じアドレスを開いてください。

### 3. ファイルを送信

1. 受信するデバイスを選択
2. ファイルを選ぶかドロップエリアにドラッグ
3. 受信側が **受信** をクリック
4. ブラウザがファイルをダウンロード

複数ファイルに対応しています。デフォルトでは1ファイル最大2GBです。

## プライバシーとセキュリティ

アカウントは不要で、ファイルをインターネットへアップロードしません。ファイルはFTLを実行しているパソコンに一時保存されます。

- 未完了ファイルは最大2時間保持
- 完了または拒否されたファイルは早めに削除
- FTL終了時にすべての一時ファイルを削除

信頼できる家庭、オフィス、または個人用ホットスポットでのみ使用してください。

## トラブルシューティング

### 他のデバイスから接続できない

- 両方のデバイスが同じWi-Fiに接続されているか確認
- Windowsファイアウォールでプライベートネットワークを許可
- ゲストWi-Fiを使用しない
- ルーターのAP／クライアント分離を無効化
- FTLを起動したままにする
- 完全な `http://IP:ポート` を入力

### デバイスが表示されない

両方のデバイスで完全に同じアドレスを開き、ページを開いたままにしてください。通常は4秒以内に表示されます。

### Windowsで「不明な発行元」と表示される

現在商用コード署名がないため、Windows SmartScreenが警告を表示する場合があります。このリポジトリの
[Releases](https://github.com/zzxn/ftl-transfer/releases/latest) からのみダウンロードしてください。SHA-256確認用の`checksums.txt`も含まれます。

<details>
<summary><strong>開発者向け</strong></summary>

Go 1.23以降が必要です。

```bash
# ソースから実行
go run .

# 全プラットフォームをビルド
make VERSION=1.0.0

# Release用アーカイブを作成
make package VERSION=1.0.0
```

オプション設定：

```bash
PORT=8080 MAX_FILE_MB=4096 go run .
```

`v*`形式のGit Tagをプッシュすると、GitHub Actionsが自動的にテスト、ビルド、リリースを行います。

</details>

---

<p align="center">Made by zzxn with ♥</p>
