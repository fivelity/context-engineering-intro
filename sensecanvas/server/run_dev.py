#!/usr/bin/env python3
"""
SenseCanvas Development Server Runner
Quick startup script for development with proper logging and error handling.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

import uvicorn

# Add the src directory to Python path
server_root = Path(__file__).parent
src_path = server_root / "src"
sys.path.insert(0, str(src_path))

# Configure logging for development
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(server_root / "logs" / "sensecanvas.log", mode='a')
    ]
)

logger = logging.getLogger(__name__)


def create_log_dir():
    """Create logs directory if it doesn't exist."""
    log_dir = server_root / "logs"
    log_dir.mkdir(exist_ok=True)


def check_dependencies():
    """Check if required dependencies are available."""
    try:
        import fastapi
        import uvicorn
        import pydantic
        import psutil
        logger.info("✅ Core dependencies verified")
        
        # Check for LibreHardwareMonitor DLL (Windows only)
        dll_path = server_root / "LibreHardwareMonitorLib.dll"
        if os.name == 'nt' and not dll_path.exists():
            logger.warning("⚠️ LibreHardwareMonitorLib.dll not found - Windows monitoring will use psutil fallback")
        
        return True
    except ImportError as e:
        logger.error(f"❌ Missing dependency: {e}")
        logger.info("Run: pip install -r requirements.txt")
        return False


def main():
    """Main development server entry point."""
    print("🚀 SenseCanvas Development Server")
    print("="*50)
    
    # Setup
    create_log_dir()
    
    if not check_dependencies():
        sys.exit(1)
    
    # Server configuration
    config = {
        "app": "main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": True,
        "log_level": "info",
        "access_log": True,
        "reload_dirs": [str(src_path)],
        "reload_includes": ["*.py"],
    }
    
    logger.info("Starting SenseCanvas server...")
    logger.info(f"Server will be available at: http://localhost:8000")
    logger.info(f"API documentation: http://localhost:8000/docs")
    logger.info(f"WebSocket endpoint: ws://localhost:8000/ws")
    
    try:
        uvicorn.run(**config)
    except KeyboardInterrupt:
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()