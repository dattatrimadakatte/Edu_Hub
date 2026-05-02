@echo off
echo Starting EduHub Application...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd /d Backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo Starting Frontend Development Server...
start "Frontend" cmd /k "cd /d Frontend\client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause