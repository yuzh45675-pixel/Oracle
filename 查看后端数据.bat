@echo off
chcp 65001 >nul
set "ROOT=%~dp0"
set "DATA=%ROOT%data"

if not exist "%DATA%" (
    echo 正在初始化 data 目录...
    cd /d "%ROOT%"
    node -e "require('./server/store').ensureDataDir()"
)

if not exist "%DATA%\users.json" (
    echo 尚未有 users.json，请先注册一个账号并确保 npm run server 已运行过。
    pause
    exit /b 1
)

echo 打开文件夹: %DATA%
explorer "%DATA%"

echo 用记事本打开 users.json 和 orders.json ...
start "" notepad "%DATA%\users.json"
start "" notepad "%DATA%\orders.json"

echo.
echo 若在 Cursor 里查看：按 Ctrl+P，输入 data/users.json 回车
echo.
pause
