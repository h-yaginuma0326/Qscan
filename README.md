# Windsurf - 問診票OCR整形アプリ

![Windsurf Logo](./src/assets/favicon.svg)

## 概要

Windsurfは医療問診票を自動的にOCR処理し、個人情報を保護しながら、電子カルテに貼り付け可能なフォーマットに整形するウェブアプリケーションです。

## 特徴

- 問診票の画像アップロード（ドラッグ＆ドロップまたはカメラ撮影）
- 個人情報の自動検出・マスキング
- Azure Document Intelligence によるOCR処理
- LLMによるテキスト整形
- カルテ貼付用テンプレートのワンクリックコピー

## 技術スタック

- フロントエンド: React, TypeScript, Vite, Tailwind CSS
- OCR: Azure Document Intelligence
- テキスト整形: Azure OpenAI Service (GPT-4o)／ローカルLLM (Ollama)
- 画像処理: Canvas API, ブラウザネイティブ機能
- データ保存: IndexedDB

## セットアップ手順

### 前提条件

- Node.js (バージョン 18.0.0 以上)
- npm (バージョン 9.0.0 以上)
- Azure アカウント (Document Intelligence サービス用)
- Azure OpenAI Service または Ollama (ローカルLLM用)

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/windsurf.git
cd windsurf

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

または、Windowsユーザーは `start.bat` ファイルを実行するだけです。

### ビルド & デプロイ

```bash
# 本番ビルドの作成
npm run build

# ビルドプレビュー
npm run preview
```

Netlifyへのデプロイ:

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# デプロイ
netlify deploy
```

## 使用方法

1. 設定画面でAzure Document IntelligenceとLLMの設定を行う
2. 問診票画像をアップロードまたはカメラで撮影
3. 個人情報領域を確認・調整
4. OCR処理を実行
5. 生成されたテンプレートを確認・編集
6. クリップボードにコピーして電子カルテに貼り付け

## システム要件

- デスクトップ: Chrome, Firefox, Safari
- iPad: Safari, Chrome

## セキュリティ

個人情報はクラウドに送信されません。すべての個人情報はブラウザ上でマスキングされます。
APIキーなどの認証情報は、ブラウザのIndexedDBに保存され、サーバーに送信されることはありません。

## 将来の拡張予定

- FHIR API連携による電子カルテ直接書き込み
- 多言語対応
- 音声入力機能

## ライセンス

プライベートプロジェクト - たかぎ内科クリニック用

## 作者

たかぎ内科クリニック IT部門
