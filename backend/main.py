"""
FastAPI backend for SenseCanvas
Real-time PC sensor monitoring with PyHardwareMonitor integration
"""

import asyncio
import json
import logging
import platform
import sys
from datetime import datetime
from typing import Dict, List, Optional, Union
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import sensor monitoring modules
from core.sensor_manager import SensorManager
from core.websocket_manager import WebSocketManager
from models.sensor_models import SensorData, SensorReading, SystemInfo
from services.hardware_monitor import HardwareMonitorService
from utils.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global instances
sensor_manager: Optional[SensorManager] = None
websocket_manager: Optional[WebSocketManager] = None
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown tasks"""
    global sensor_manager, websocket_manager
    
    logger.info("Starting SenseCanvas backend...")
    
    # Initialize services
    try:
        sensor_manager = SensorManager()
        websocket_manager = WebSocketManager()
        
        # Initialize hardware monitoring
        await sensor_manager.initialize()
        
        # Start background monitoring task
        monitoring_task = asyncio.create_task(background_monitoring())
        
        logger.info("SenseCanvas backend started successfully")
        
        yield
        
    except Exception as e:
        logger.error(f"Failed to start backend: {e}")
        raise
    finally:
        # Cleanup
        logger.info("Shutting down SenseCanvas backend...")
        
        if sensor_manager:
            await sensor_manager.cleanup()
        
        if websocket_manager:
            await websocket_manager.cleanup()
        
        # Cancel monitoring task
        if 'monitoring_task' in locals():
            monitoring_task.cancel()
            try:
                await monitoring_task
            except asyncio.CancelledError:
                pass
        
        logger.info("SenseCanvas backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="SenseCanvas API",
    description="Real-time PC sensor monitoring backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def background_monitoring():
    """Background task for continuous sensor monitoring"""
    logger.info("Starting background sensor monitoring...")
    
    while True:
        try:
            if sensor_manager and websocket_manager:
                # Get latest sensor data
                sensor_data = await sensor_manager.get_sensor_data()
                
                if sensor_data and websocket_manager.has_connections():
                    # Broadcast to all connected WebSocket clients
                    message = {
                        "type": "sensor_update",
                        "timestamp": datetime.utcnow().isoformat(),
                        "data": sensor_data.dict()
                    }
                    await websocket_manager.broadcast(json.dumps(message))
            
            # Wait before next update (configurable interval)
            await asyncio.sleep(settings.update_interval)
            
        except asyncio.CancelledError:
            logger.info("Background monitoring cancelled")
            break
        except Exception as e:
            logger.error(f"Error in background monitoring: {e}")
            await asyncio.sleep(5)  # Wait longer on error


# API Routes

@app.get("/", response_model=dict)
async def root():
    """API root endpoint with basic info"""
    return {
        "name": "SenseCanvas API",
        "version": "1.0.0",
        "status": "running",
        "platform": platform.system(),
        "python_version": sys.version,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", response_model=dict)
async def health_check():
    """Health check endpoint"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    health_status = await sensor_manager.get_health_status()
    
    return {
        "status": "healthy" if health_status.get("all_systems_ok") else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "details": health_status
    }


@app.get("/system-info", response_model=SystemInfo)
async def get_system_info():
    """Get system information and capabilities"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    return await sensor_manager.get_system_info()


@app.get("/sensors", response_model=SensorData)
async def get_sensors():
    """Get current sensor readings"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    sensor_data = await sensor_manager.get_sensor_data()
    if not sensor_data:
        raise HTTPException(status_code=503, detail="Unable to retrieve sensor data")
    
    return sensor_data


@app.get("/sensors/available", response_model=List[str])
async def get_available_sensors():
    """Get list of available sensor paths"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    return await sensor_manager.get_available_sensors()


@app.get("/sensors/{sensor_path:path}", response_model=Union[SensorReading, dict])
async def get_sensor_by_path(sensor_path: str):
    """Get specific sensor reading by path"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    reading = await sensor_manager.get_sensor_by_path(sensor_path)
    if not reading:
        raise HTTPException(status_code=404, detail=f"Sensor not found: {sensor_path}")
    
    return reading


@app.post("/sensors/refresh")
async def refresh_sensors():
    """Manually refresh sensor data"""
    if not sensor_manager:
        raise HTTPException(status_code=503, detail="Sensor manager not initialized")
    
    try:
        await sensor_manager.refresh_sensors()
        return {"status": "success", "message": "Sensors refreshed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh sensors: {str(e)}")


# WebSocket endpoint for real-time sensor data
@app.websocket("/ws/sensors")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time sensor data streaming"""
    if not websocket_manager:
        await websocket.close(code=1011, reason="WebSocket manager not initialized")
        return
    
    await websocket_manager.connect(websocket)
    
    try:
        # Send initial sensor data
        if sensor_manager:
            initial_data = await sensor_manager.get_sensor_data()
            if initial_data:
                message = {
                    "type": "initial_data",
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": initial_data.dict()
                }
                await websocket.send_text(json.dumps(message))
        
        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for client messages (ping, config changes, etc.)
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat()
                    }))
                
                elif message.get("type") == "get_sensors":
                    # Send current sensor data
                    if sensor_manager:
                        sensor_data = await sensor_manager.get_sensor_data()
                        if sensor_data:
                            response = {
                                "type": "sensor_data",
                                "timestamp": datetime.utcnow().isoformat(),
                                "data": sensor_data.dict()
                            }
                            await websocket.send_text(json.dumps(response))
                
            except asyncio.TimeoutError:
                # Send periodic ping to keep connection alive
                await websocket.send_text(json.dumps({
                    "type": "ping",
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket_manager.disconnect(websocket)


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


if __name__ == "__main__":
    # Development server configuration
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning",
        access_log=settings.debug
    )