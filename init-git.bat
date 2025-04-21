@echo off
echo Windsurf - Gitリポジトリ初期化
echo ================================

:: Gitがインストールされているか確認
where git >nul 2>nul
if %errorlevel% neq 0 (
  echo エラー: Gitがインストールされていません。
  echo Gitをインストールしてください: https://git-scm.com/downloads
  pause
  exit /b 1
)

:: Gitリポジトリの初期化
echo Gitリポジトリを初期化しています...
git init

:: 最初のコミット
echo .gitignoreを追加しています...
git add .gitignore
git add README.md
git add package.json tsconfig.json tsconfig.node.json vite.config.ts
git add tailwind.config.js postcss.config.js
git add index.html
git add -A src/
git add start.bat

echo 最初のコミットを作成しています...
git commit -m "Initial commit: Windsurf web application setup"

echo.
echo Gitリポジトリが初期化されました。
echo リモートリポジトリを追加するには:
echo git remote add origin https://github.com/yourusername/windsurf.git
echo git push -u origin main
echo.

pause
