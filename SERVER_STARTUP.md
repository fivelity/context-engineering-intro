# SenseCanvas Server Startup Guide

This guide explains how to start both the FastAPI backend and SvelteKit frontend servers for the SenseCanvas project.

## Quick Start

### First Time Setup (Required)

**Download Hardware Monitoring DLL:**
```bash
# Linux/macOS
./download-dll.sh

# Windows
download-dll.bat

# Using npm (any platform)
npm run setup:dll

# Complete setup (DLL + dependencies)
npm run setup:all
```

### Option 1: Using the startup script (Recommended)

**Linux/macOS:**
```bash
./start-servers.sh
```

**Windows:**
```cmd
start-servers.bat
```

**Using npm:**
```bash
npm start
```

### Option 2: Manual startup

**Start Backend (Terminal 1):**
```bash
cd backend/fastapi
source ../../venv_linux/bin/activate  # Linux/macOS
# or
../../venv_linux/Scripts/activate.bat  # Windows
pip install -r requirements.txt
python main.py
```

**Start Frontend (Terminal 2):**
```bash
npm install  # First time only
npm run dev
```

## Server URLs

- **Frontend (SvelteKit)**: http://localhost:5173
- **Backend (FastAPI)**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

## Features of the Startup Script

### 🔧 Automatic Setup
- Creates Python virtual environment if missing
- Installs dependencies automatically
- Checks port availability before starting

### 🔍 Health Checks
- Verifies both servers start successfully
- Provides clear error messages if startup fails
- Checks for port conflicts

### 🛑 Graceful Shutdown
- Handles Ctrl+C properly
- Kills all background processes
- Frees up ports on exit

### 📊 Status Monitoring
- Shows server status and URLs
- Provides helpful debugging information
- Color-coded output for easy reading

## Requirements

### System Requirements
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (for version control)

### Linux/macOS Additional Requirements
- `curl` (for health checks)
- `lsof` (for port checking)
- `bash` shell

### Windows Additional Requirements
- `netstat` (built-in)
- Command Prompt or PowerShell

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

**Linux/macOS:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Windows:**
```cmd
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Virtual Environment Issues
If the Python virtual environment has issues:

```bash
# Remove and recreate
rm -rf venv_linux  # Linux/macOS
rmdir /s venv_linux  # Windows

# The script will recreate it automatically
```

### Backend Server Won't Start
Common issues and solutions:

1. **Missing LibreHardwareMonitorLib.dll**:
   - Ensure the DLL is in the `backend/fastapi/` directory
   - Download from LibreHardwareMonitor releases if missing

2. **Admin privileges required**:
   - Some hardware sensors require administrator access
   - Run the script as admin/sudo if needed

3. **Python dependencies**:
   - Activate virtual environment and run: `pip install -r requirements.txt`

### Frontend Server Won't Start
Common issues and solutions:

1. **Node modules missing**:
   - Delete `node_modules` folder and run `npm install`

2. **Port 5173 in use**:
   - Kill the process or change port in `vite.config.js`

3. **TypeScript errors**:
   - Run `npm run check` to identify issues

## Development Workflow

1. **Start servers**: `./start-servers.sh` or `npm start`
2. **Open browser**: Navigate to http://localhost:5173
3. **Make changes**: Edit files and see hot-reload in action
4. **Test API**: Use http://localhost:8000/docs for API testing
5. **Stop servers**: Press Ctrl+C in the terminal

## Environment Variables

Create a `.env` file in the project root for configuration:

```env
# Backend configuration
BACKEND_HOST=localhost
BACKEND_PORT=8000
FASTAPI_ENV=development

# Frontend configuration
FRONTEND_HOST=localhost
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:8000

# Hardware monitoring
SENSOR_UPDATE_INTERVAL=1000
ENABLE_HARDWARE_MONITORING=true
```

## Production Deployment

For production deployment, use:

```bash
# Build frontend
npm run build

# Start production servers
npm run preview  # Frontend
python backend/fastapi/main.py --host 0.0.0.0 --port 8000  # Backend
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm start` | Start both servers using the startup script |
| `npm run dev` | Start only the frontend development server |
| `npm run start:backend` | Start only the backend server |
| `npm run start:frontend` | Start only the frontend server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |
| `npm run test` | Run the test suite |
| `npm run lint` | Run linting checks |
| `npm run format` | Format code using Prettier |

## Getting Help

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review the console output for error messages
3. Ensure all requirements are installed
4. Try restarting the servers
5. Check the project's issue tracker for known problems

## Contributing

When contributing to the server startup scripts:

1. Test on multiple platforms (Linux, macOS, Windows)
2. Ensure backward compatibility
3. Add appropriate error handling
4. Update this documentation
5. Test with different Node.js and Python versions