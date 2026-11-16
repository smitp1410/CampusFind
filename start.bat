@echo off
title CampusFind Launch System
echo ===================================================
echo     CAMPUSFIND - Premium University Lost & Found
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting CampusFind FastAPI Backend on port 8000...
start "CampusFind Backend" cmd /k "cd backend && .venv\Scripts\python.exe run.py"

echo [2/2] Starting CampusFind Vite Frontend on port 5173...
start "CampusFind Frontend" cmd /k "cd frontend && set PATH=%LOCALAPPDATA%\Programs\nodejs;%%PATH%% && npm run dev"

echo.
echo ===================================================
echo   CampusFind is booting up!
echo   Frontend: http://localhost:5173
echo   Backend Docs: http://localhost:8000/docs
echo ===================================================
echo.
pause
