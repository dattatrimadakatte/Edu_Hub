@echo off
echo ========================================
echo    EduHub Complete Setup and Startup
echo ========================================
echo.

echo [1/4] Checking Python and dependencies...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Python dependencies...
cd Backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo [3/4] Initializing database with all tables and sample data...
python init_complete_database.py
if %errorlevel% neq 0 (
    echo ERROR: Database initialization failed
    echo Please check your PostgreSQL connection settings in database.py
    pause
    exit /b 1
)

echo.
echo [4/4] Starting FastAPI backend server...
echo Backend will be available at: http://localhost:8000
echo API documentation at: http://localhost:8000/docs
echo.
echo Starting server in 3 seconds...
timeout /t 3 /nobreak > nul

start "EduHub Backend" python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

echo.
echo ========================================
echo    EduHub Backend Started Successfully!
echo ========================================
echo.
echo Backend Server: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.
echo Login Credentials:
echo   Admin: admin@eduhub.com / admin123
echo   Instructor: instructor@eduhub.com / instructor123
echo   Student: student@eduhub.com / student123
echo.
echo Press any key to open frontend setup...
pause

echo.
echo ========================================
echo    Setting up Frontend (React)
echo ========================================
cd ..\Frontend\client

echo Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    echo Please make sure Node.js is installed
    pause
    exit /b 1
)

echo.
echo Starting React development server...
echo Frontend will be available at: http://localhost:5173
echo.
start "EduHub Frontend" npm run dev

echo.
echo ========================================
echo    EduHub Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
echo.
echo Both servers are now running!
echo Close this window to stop the servers.
pause