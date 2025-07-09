#!/bin/bash

# SenseCanvas Server Startup Script
# Starts both the FastAPI backend and SvelteKit frontend servers

set -e

echo "🚀 Starting SenseCanvas Development Servers..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    
    # Kill all background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    # Kill any remaining processes on the ports
    lsof -ti:8000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:5173 | xargs -r kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Check if virtual environment exists
if [ ! -d "venv_linux" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python3 -m venv venv_linux
    echo -e "${GREEN}✅ Virtual environment created${NC}"
fi

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🐍 Starting FastAPI backend server...${NC}"
    
    cd backend/fastapi
    
    # Activate virtual environment
    source ../../venv_linux/bin/activate
    
    # Install dependencies if needed
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip install -r requirements.txt > /dev/null 2>&1
    
    # Start the FastAPI server
    echo -e "${GREEN}✅ Backend server starting on http://localhost:8000${NC}"
    python main.py &
    BACKEND_PID=$!
    
    cd ../..
    
    # Wait a moment for the server to start
    sleep 2
    
    # Check if backend is running
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${RED}❌ Backend server failed to start${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Backend server is running${NC}"
    return 0
}

# Function to start frontend server
start_frontend() {
    echo -e "${BLUE}⚡ Starting SvelteKit frontend server...${NC}"
    
    # Install Node.js dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
        npm install > /dev/null 2>&1
    fi
    
    # Start the SvelteKit dev server
    echo -e "${GREEN}✅ Frontend server starting on http://localhost:5173${NC}"
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait a moment for the server to start
    sleep 3
    
    # Check if frontend is running
    if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${RED}❌ Frontend server failed to start${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Frontend server is running${NC}"
    return 0
}

# Function to check if ports are available
check_ports() {
    echo -e "${BLUE}🔍 Checking if ports are available...${NC}"
    
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port 8000 is already in use${NC}"
        echo -e "${YELLOW}💡 Kill the process using: lsof -ti:8000 | xargs kill -9${NC}"
        return 1
    fi
    
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port 5173 is already in use${NC}"
        echo -e "${YELLOW}💡 Kill the process using: lsof -ti:5173 | xargs kill -9${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Ports 8000 and 5173 are available${NC}"
    return 0
}

# Function to show server status
show_status() {
    echo -e "\n${BLUE}📊 Server Status:${NC}"
    echo -e "${GREEN}🔗 Frontend: http://localhost:5173${NC}"
    echo -e "${GREEN}🔗 Backend:  http://localhost:8000${NC}"
    echo -e "${GREEN}🔗 API Docs: http://localhost:8000/docs${NC}"
    echo -e "\n${YELLOW}💡 Press Ctrl+C to stop both servers${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🔧 SenseCanvas Development Environment${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    # Check if required tools are installed
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 is not installed${NC}"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    # Check ports
    if ! check_ports; then
        exit 1
    fi
    
    # Start servers
    if ! start_backend; then
        echo -e "${RED}❌ Failed to start backend server${NC}"
        exit 1
    fi
    
    if ! start_frontend; then
        echo -e "${RED}❌ Failed to start frontend server${NC}"
        cleanup
        exit 1
    fi
    
    # Show status
    show_status
    
    # Wait for user to stop servers
    echo -e "\n${GREEN}✅ Both servers are running!${NC}"
    echo -e "${BLUE}📱 You can now access the SenseCanvas dashboard${NC}"
    
    # Keep the script running
    while true; do
        sleep 1
    done
}

# Check if script is run directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi