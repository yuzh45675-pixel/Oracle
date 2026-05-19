@echo off
chcp 65001 >nul
echo 正在用 Cursor 打开项目...
echo 路径: %~dp0

where cursor >nul 2>&1
if %errorlevel% equ 0 (
    cursor "%~dp0"
    exit /b 0
)

where code >nul 2>&1
if %errorlevel% equ 0 (
    code "%~dp0"
    exit /b 0
)

echo.
echo 未找到 cursor 命令，请手动操作：
echo 1. 打开 Cursor
echo 2. 菜单 File - Open Folder
echo 3. 选择此文件夹：
echo    %~dp0
echo.
explorer "%~dp0"
pause
