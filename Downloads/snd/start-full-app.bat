@echo off
echo Starting Campus Connect with Activity Tracker...
echo.

echo Starting Python Backend (Activity Tracker)...
start "Activity Tracker Backend" cmd /k "cd /d %~dp0backend && python run_tracker.py"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Next.js Frontend...
start "Campus Connect Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Both services are starting...
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://127.0.0.1:5000
echo.
echo Press any key to close this window...
pause > nul
