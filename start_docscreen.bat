@echo off
title DocScreen - Automated Launcher
echo ========================================================
echo         DocScreen AI Document Verification System
echo ========================================================
echo.

:: Step 1: Start Backend
if exist "%~dp0backend\.venv\Scripts\uvicorn.exe" (
    echo [1/3] Starting Backend API on http://localhost:8000 ...
    start "DocScreen Backend" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\uvicorn.exe app.main:app --reload --port 8000"
) else (
    echo [!] Backend .venv not found.
)

:: Step 2: Start Frontend
echo [2/3] Starting Frontend Server on http://localhost:3000 ...
start "DocScreen Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

:: Step 3: Wait and open browser automatically
echo [3/3] Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo Opening DocScreen in your default browser...
start http://localhost:3000

echo.
echo ========================================================
echo  All services triggered!
echo  Frontend: http://localhost:3000
echo  API Docs: http://localhost:8000/docs
echo ========================================================
