#!/usr/bin/env python3
"""
SenseCanvas FastAPI Backend
Real-time hardware sensor monitoring using PyHardwareMonitor
"""

import asyncio
import json
import logging
import os
import sys
import time
from typing import Dict, List, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import hardware monitoring
from sensors import HardwareMonitor, SensorReading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global hardware monitor instance
hardware_monitor: HardwareMonitor = None


class ConnectionManager:
    """Manages WebSocket connections for real-time sensor streaming"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending message to client: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)


# Response models
class HealthResponse(BaseModel):
    status: str
    timestamp: float
    hardware_available: bool
    total_sensors: int
    active_connections: int


class SensorDataResponse(BaseModel):
    timestamp: float
    hardware: List[Dict[str, Any]]
    total_sensors: int


# Global connection manager
manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global hardware_monitor
    
    # Startup
    logger.info("Starting SenseCanvas FastAPI backend...")
    
    try:
        # Initialize hardware monitor
        hardware_monitor = HardwareMonitor()
        logger.info("Hardware monitor initialized successfully")
        
        # Start background sensor streaming task
        task = asyncio.create_task(stream_sensor_data())
        
        yield
        
        # Shutdown
        logger.info("Shutting down SenseCanvas backend...")
        task.cancel()
        
        if hardware_monitor:
            hardware_monitor.close()
            
    except Exception as e:
        logger.error(f"Error during application lifecycle: {e}")
        yield


# Create FastAPI app
app = FastAPI(
    title="SenseCanvas API",
    description="Real-time PC hardware sensor monitoring API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def stream_sensor_data():
    """Background task to stream sensor data to connected clients"""
    logger.info("Starting sensor data streaming task")
    
    while True:
        try:
            if hardware_monitor and len(manager.active_connections) > 0:
                # Get fresh sensor data
                sensor_data = hardware_monitor.get_sensor_data()
                
                if sensor_data:
                    # Convert to JSON and broadcast
                    message = json.dumps(sensor_data, default=str)
                    await manager.broadcast(message)
            
            # Wait before next update (1 second refresh rate)
            await asyncio.sleep(1.0)
            
        except asyncio.CancelledError:
            logger.info("Sensor streaming task cancelled")
            break
        except Exception as e:
            logger.error(f"Error in sensor streaming: {e}")
            await asyncio.sleep(5.0)  # Wait longer on error


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "SenseCanvas API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    total_sensors = 0
    hardware_available = False
    
    if hardware_monitor:
        try:
            sensor_data = hardware_monitor.get_sensor_data()
            hardware_available = True
            total_sensors = sum(len(hw.get('sensors', [])) for hw in sensor_data)
        except Exception as e:
            logger.error(f"Error getting sensor data for health check: {e}")
    
    return HealthResponse(
        status="healthy" if hardware_available else "degraded",
        timestamp=time.time(),
        hardware_available=hardware_available,
        total_sensors=total_sensors,
        active_connections=len(manager.active_connections)
    )


@app.get("/sensors", response_model=SensorDataResponse)
async def get_sensors():
    """Get current sensor data via REST API"""
    if not hardware_monitor:
        raise HTTPException(status_code=503, detail="Hardware monitor not available")
    
    try:
        sensor_data = hardware_monitor.get_sensor_data()
        total_sensors = sum(len(hw.get('sensors', [])) for hw in sensor_data)
        
        return SensorDataResponse(
            timestamp=time.time(),
            hardware=sensor_data,
            total_sensors=total_sensors
        )
    except Exception as e:
        logger.error(f"Error getting sensor data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/sensors")
async def websocket_sensors(websocket: WebSocket):
    """WebSocket endpoint for real-time sensor data streaming"""
    await manager.connect(websocket)
    
    try:
        # Send initial sensor data immediately
        if hardware_monitor:
            try:
                sensor_data = hardware_monitor.get_sensor_data()
                message = json.dumps(sensor_data, default=str)
                await websocket.send_text(message)
            except Exception as e:
                logger.error(f"Error sending initial sensor data: {e}")
        
        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for client messages (like ping/pong)
                data = await websocket.receive_text()
                
                if data == "ping":
                    await websocket.send_text("pong")
                elif data == "disconnect":
                    break
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket connection error: {e}")
    finally:
        manager.disconnect(websocket)


@app.get("/sensors/{hardware_type}")
async def get_sensors_by_type(hardware_type: str):
    """Get sensors for a specific hardware type (cpu, gpu, memory, etc.)"""
    if not hardware_monitor:
        raise HTTPException(status_code=503, detail="Hardware monitor not available")
    
    try:
        sensor_data = hardware_monitor.get_sensor_data()
        
        # Filter by hardware type
        filtered_data = [
            hw for hw in sensor_data 
            if hw.get('hardwareType', '').lower() == hardware_type.lower()
        ]
        
        if not filtered_data:
            raise HTTPException(status_code=404, detail=f"No sensors found for hardware type: {hardware_type}")
        
        return {
            "timestamp": time.time(),
            "hardware_type": hardware_type,
            "hardware": filtered_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting sensors by type: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/sensors/refresh")
async def refresh_sensors():
    """Manually refresh sensor data"""
    if not hardware_monitor:
        raise HTTPException(status_code=503, detail="Hardware monitor not available")
    
    try:
        hardware_monitor.update()
        return {"message": "Sensors refreshed successfully", "timestamp": time.time()}
    except Exception as e:
        logger.error(f"Error refreshing sensors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    # Check if running as admin (Windows)
    import platform
    if platform.system() == "Windows":
        import ctypes
        if not ctypes.windll.shell32.IsUserAnAdmin():
            logger.warning("Warning: Not running as administrator. Some sensors may not be accessible.")
    
    # Start server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload in production
        log_level="info",
        access_log=True
    )