@echo off
title MoTA SETU - Tribal Scholarship Scrutiny Engine
echo ===================================================================
echo   MoTA SETU: Automated Tribal Scholarship Scrutiny & Reconciliation
echo   Ministry of Tribal Affairs, Government of India (SIH26239)
echo ===================================================================
echo.
echo Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
echo.

cd /d "%~dp0backend"
start "MoTA SETU Backend Server" "%~dp0backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

timeout /t 2 /nobreak >nul

echo Opening MoTA SETU Portal in your default browser...
start http://127.0.0.1:8000/

echo.
echo MoTA SETU is LIVE!
echo Press any key to stop or close this window when done.
pause
