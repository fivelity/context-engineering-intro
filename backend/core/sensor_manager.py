"""
SensorManager - Core sensor data management and coordination
Handles PyHardwareMonitor integration with cross-platform fallback
"""

import asyncio
import logging
import platform
from datetime import datetime
from typing import Dict, List, Optional, Any

from models.sensor_models import SensorData, SensorReading, SystemInfo
from services.hardware_monitor import HardwareMonitorService
from services.psutil_monitor import PsutilMonitorService
from utils.config import get_settings

logger = logging.getLogger(__name__)


class SensorManager:
    """
    Manages sensor data collection from multiple sources
    Primary: PyHardwareMonitor (Windows with admin rights)
    Fallback: psutil (cross-platform basic monitoring)
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.hardware_service: Optional[HardwareMonitorService] = None
        self.psutil_service: Optional[PsutilMonitorService] = None
        self.current_service: Optional[Any] = None
        self.service_type: str = "none"
        self.last_update: Optional[datetime] = None
        self.cached_data: Optional[SensorData] = None
        self.initialization_error: Optional[str] = None
        
    async def initialize(self) -> bool:
        """Initialize sensor monitoring services"""
        logger.info("Initializing sensor manager...")
        
        # Try to initialize PyHardwareMonitor first (Windows only)
        if platform.system().lower() == "windows":
            try:
                logger.info("Attempting to initialize PyHardwareMonitor...")
                self.hardware_service = HardwareMonitorService()
                
                if await self.hardware_service.initialize():
                    self.current_service = self.hardware_service
                    self.service_type = "hardware_monitor"
                    logger.info("PyHardwareMonitor initialized successfully")
                    return True
                else:
                    logger.warning("PyHardwareMonitor initialization failed, falling back to psutil")
                    
            except Exception as e:
                logger.warning(f"PyHardwareMonitor error: {e}, falling back to psutil")
                self.initialization_error = str(e)
        
        # Fallback to psutil for cross-platform basic monitoring
        try:
            logger.info("Initializing psutil fallback service...")
            self.psutil_service = PsutilMonitorService()
            
            if await self.psutil_service.initialize():
                self.current_service = self.psutil_service
                self.service_type = "psutil"
                logger.info("Psutil service initialized successfully")
                return True
            else:
                logger.error("Failed to initialize any monitoring service")
                self.initialization_error = "All monitoring services failed to initialize"
                return False
                
        except Exception as e:
            logger.error(f"Psutil initialization error: {e}")
            self.initialization_error = str(e)
            return False
    
    async def cleanup(self):
        """Cleanup sensor monitoring services"""
        logger.info("Cleaning up sensor manager...")
        
        if self.hardware_service:
            try:
                await self.hardware_service.cleanup()
            except Exception as e:
                logger.error(f"Error cleaning up hardware service: {e}")
        
        if self.psutil_service:
            try:
                await self.psutil_service.cleanup()
            except Exception as e:
                logger.error(f"Error cleaning up psutil service: {e}")
        
        self.current_service = None
        self.service_type = "none"
        logger.info("Sensor manager cleanup complete")
    
    async def get_sensor_data(self) -> Optional[SensorData]:
        """Get current sensor data from active service"""
        if not self.current_service:
            logger.warning("No active sensor service available")
            return self.cached_data
        
        try:
            sensor_data = await self.current_service.get_sensor_data()
            if sensor_data:
                self.cached_data = sensor_data
                self.last_update = datetime.utcnow()
                return sensor_data
            else:
                logger.warning("No sensor data returned from service")
                return self.cached_data
                
        except Exception as e:
            logger.error(f"Error getting sensor data: {e}")
            return self.cached_data
    
    async def get_sensor_by_path(self, sensor_path: str) -> Optional[SensorReading]:
        """Get specific sensor reading by path"""
        if not self.current_service:
            return None
        
        try:
            return await self.current_service.get_sensor_by_path(sensor_path)
        except Exception as e:
            logger.error(f"Error getting sensor by path {sensor_path}: {e}")
            return None
    
    async def get_available_sensors(self) -> List[str]:
        """Get list of available sensor paths"""
        if not self.current_service:
            return []
        
        try:
            return await self.current_service.get_available_sensors()
        except Exception as e:
            logger.error(f"Error getting available sensors: {e}")
            return []
    
    async def get_system_info(self) -> SystemInfo:
        """Get system information and monitoring capabilities"""
        capabilities = {
            "hardware_monitor_available": self.hardware_service is not None,
            "psutil_available": self.psutil_service is not None,
            "current_service": self.service_type,
            "admin_required": platform.system().lower() == "windows" and self.service_type != "hardware_monitor",
            "detailed_sensors": self.service_type == "hardware_monitor",
            "initialization_error": self.initialization_error
        }
        
        if self.current_service:
            try:
                service_info = await self.current_service.get_system_info()
                capabilities.update(service_info)
            except Exception as e:
                logger.error(f"Error getting system info from service: {e}")
        
        return SystemInfo(
            platform=platform.system(),
            platform_version=platform.version(),
            architecture=platform.architecture()[0],
            processor=platform.processor(),
            python_version=platform.python_version(),
            monitoring_service=self.service_type,
            capabilities=capabilities,
            last_update=self.last_update.isoformat() if self.last_update else None
        )
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get health status of monitoring services"""
        status = {
            "all_systems_ok": False,
            "service_type": self.service_type,
            "last_update": self.last_update.isoformat() if self.last_update else None,
            "initialization_error": self.initialization_error,
            "services": {}
        }
        
        # Check hardware monitor service
        if self.hardware_service:
            try:
                hw_status = await self.hardware_service.get_health_status()
                status["services"]["hardware_monitor"] = hw_status
            except Exception as e:
                status["services"]["hardware_monitor"] = {"status": "error", "error": str(e)}
        
        # Check psutil service
        if self.psutil_service:
            try:
                psutil_status = await self.psutil_service.get_health_status()
                status["services"]["psutil"] = psutil_status
            except Exception as e:
                status["services"]["psutil"] = {"status": "error", "error": str(e)}
        
        # Overall health check
        if self.current_service and self.last_update:
            time_since_update = (datetime.utcnow() - self.last_update).total_seconds()
            status["all_systems_ok"] = time_since_update < self.settings.max_update_age
            status["time_since_last_update"] = time_since_update
        
        return status
    
    async def refresh_sensors(self):
        """Manually refresh sensor data"""
        if not self.current_service:
            raise RuntimeError("No active sensor service")
        
        try:
            await self.current_service.refresh_sensors()
            logger.info("Sensors refreshed successfully")
        except Exception as e:
            logger.error(f"Error refreshing sensors: {e}")
            raise
    
    def get_service_capabilities(self) -> Dict[str, bool]:
        """Get current service capabilities"""
        if not self.current_service:
            return {
                "temperature_sensors": False,
                "fan_sensors": False,
                "voltage_sensors": False,
                "clock_sensors": False,
                "load_sensors": False,
                "detailed_gpu_info": False,
                "detailed_cpu_info": False,
                "memory_details": False,
                "storage_details": False
            }
        
        if self.service_type == "hardware_monitor":
            return {
                "temperature_sensors": True,
                "fan_sensors": True,
                "voltage_sensors": True,
                "clock_sensors": True,
                "load_sensors": True,
                "detailed_gpu_info": True,
                "detailed_cpu_info": True,
                "memory_details": True,
                "storage_details": True
            }
        else:  # psutil
            return {
                "temperature_sensors": True,  # Limited
                "fan_sensors": False,
                "voltage_sensors": False,
                "clock_sensors": False,
                "load_sensors": True,
                "detailed_gpu_info": False,
                "detailed_cpu_info": True,
                "memory_details": True,
                "storage_details": True
            }