@echo off
:: SenseCanvas Server Startup Script (Windows)
:: Starts both the FastAPI backend and SvelteKit frontend servers

setlocal enabledelayedexpansion

echo 🚀 Starting SenseCanvas Development Servers...

:: Check if virtual environment exists
if not exist "venv_linux" (
    echo ⚠️  Virtual environment not found. Creating...
    python -m venv venv_linux
    echo ✅ Virtual environment created
)

:: Function to check if ports are available
echo 🔍 Checking if ports are available...
netstat -an | findstr :8000 >nul 2>&1
if !errorlevel! equ 0 (
    echo ❌ Port 8000 is already in use
    echo 💡 Kill the process using: netstat -ano | findstr :8000
    pause
    exit /b 1
)

netstat -an | findstr :5173 >nul 2>&1
if !errorlevel! equ 0 (
    echo ❌ Port 5173 is already in use
    echo 💡 Kill the process using: netstat -ano | findstr :5173
    pause
    exit /b 1
)

echo ✅ Ports 8000 and 5173 are available

:: Start backend server
echo 🐍 Starting FastAPI backend server...
cd backend\fastapi
call ..\..\venv_linux\Scripts\activate.bat
echo 📦 Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1
echo ✅ Backend server starting on http://localhost:8000
start /b python main.py
cd ..\..

:: Wait for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend server
echo ⚡ Starting SvelteKit frontend server...
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install >nul 2>&1
)
echo ✅ Frontend server starting on http://localhost:5173
start /b npm run dev

:: Wait for frontend to start
timeout /t 3 /nobreak >nul

:: Show server status
echo.
echo 📊 Server Status:
echo 🔗 Frontend: http://localhost:5173
echo 🔗 Backend:  http://localhost:8000
echo 🔗 API Docs: http://localhost:8000/docs
echo.
echo 💡 Press Ctrl+C to stop both servers
echo ✅ Both servers are running!
echo 📱 You can now access the SenseCanvas dashboard

:: Keep the script running
pause

:: Cleanup on exit
echo 🛑 Shutting down servers...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ Servers stopped