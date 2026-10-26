
@echo off
setlocal

REM my Project path
cd /d "C:\Users\Admin\Desktop\SolaarSense"

if errorlevel 1 exit /b 1

REM Verify that this is a Git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 exit /b 1

REM Stage all changes
git add -A
if errorlevel 1 exit /b 1

REM Stop if there are no staged changes
git diff --cached --quiet
if errorlevel 2 exit /b 1
if not errorlevel 1 exit /b 0

REM Commit and push changes
git commit -m "Auto backup: %date% %time%"
if errorlevel 1 exit /b 1

git push
if errorlevel 1 exit /b 1

exit /b 0
