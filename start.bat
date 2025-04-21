@echo off
echo Windsurf - 問診票OCR整形アプリ
echo =================================
echo 開発サーバーを起動しています...

:: npm がインストールされているか確認
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo エラー: npmがインストールされていません。
  echo Node.jsをインストールしてください: https://nodejs.org/
  pause
  exit /b 1
)

:: 依存関係がインストールされているか確認
if not exist node_modules (
  echo 初回起動: 依存関係をインストールしています...
  npm install
  if %errorlevel% neq 0 (
    echo エラー: 依存関係のインストールに失敗しました。
    pause
    exit /b 1
  )
)

:: 開発サーバー起動
echo ブラウザを開いています...
start http://localhost:3000
npm run dev

exit /b 0
