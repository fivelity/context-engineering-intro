"""
HardwareMonitorService - PyHardwareMonitor integration for detailed sensor access
Windows-specific service using LibreHardwareMonitorLib.dll
"""

import asyncio
import logging
import platform
from datetime import datetime
from typing import Dict, List, Optional, Any
import json

from models.sensor_models import (
    SensorData, SensorReading, SensorType, SystemInfo,
    CPUData, GPUData, MemoryData, StorageData, FanData, PowerData
)
from utils.config import get_settings

logger = logging.getLogger(__name__)


class HardwareMonitorService:
    """
    PyHardwareMonitor integration service
    Provides detailed hardware sensor access on Windows with admin privileges
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.computer = None
        self.is_initialized = False
        self.initialization_error: Optional[str] = None
        self.last_update: Optional[datetime] = None
        self.sensor_cache: Dict[str, SensorReading] = {}
        self.hardware_info: Dict[str, Any] = {}
        
    async def initialize(self) -> bool:
        """Initialize PyHardwareMonitor"""
        if platform.system().lower() != "windows":
            self.initialization_error = "PyHardwareMonitor only available on Windows"
            logger.warning(self.initialization_error)
            return False
        
        try:
            logger.info("Initializing PyHardwareMonitor...")
            
            # Import PyHardwareMonitor (requires LibreHardwareMonitorLib.dll)
            try:
                import clr
                import sys
                import os
                
                # Add LibreHardwareMonitorLib.dll to path
                dll_path = os.path.join(os.path.dirname(__file__), "..", "lib", "LibreHardwareMonitorLib.dll")
                if not os.path.exists(dll_path):
                    # Try alternative locations
                    alt_paths = [
                        "LibreHardwareMonitorLib.dll",
                        os.path.join(os.getcwd(), "LibreHardwareMonitorLib.dll"),
                        os.path.join(os.path.dirname(__file__), "LibreHardwareMonitorLib.dll")
                    ]
                    
                    for path in alt_paths:
                        if os.path.exists(path):
                            dll_path = path
                            break
                    else:
                        self.initialization_error = "LibreHardwareMonitorLib.dll not found"
                        logger.error(self.initialization_error)
                        return False
                
                # Load the .NET assembly
                clr.AddReference(dll_path)
                from LibreHardwareMonitor.Hardware import Computer
                
                logger.info(f"Loaded LibreHardwareMonitorLib from: {dll_path}")
                
            except ImportError as e:
                self.initialization_error = f"Failed to import pythonnet/clr: {e}"
                logger.error(self.initialization_error)
                return False
            except Exception as e:
                self.initialization_error = f"Failed to load LibreHardwareMonitorLib: {e}"
                logger.error(self.initialization_error)
                return False
            
            # Initialize computer object with all hardware enabled
            self.computer = Computer()
            self.computer.IsCpuEnabled = True
            self.computer.IsGpuEnabled = True
            self.computer.IsMemoryEnabled = True
            self.computer.IsMotherboardEnabled = True
            self.computer.IsControllerEnabled = True
            self.computer.IsNetworkEnabled = True
            self.computer.IsStorageEnabled = True
            
            # Open hardware monitoring
            self.computer.Open()
            
            # Test sensor access
            sensor_count = 0
            for hardware in self.computer.Hardware:
                hardware.Update()
                for sensor in hardware.Sensors:
                    sensor_count += 1
                
                # Update sub-hardware (GPU sub-components, etc.)
                for subhardware in hardware.SubHardware:
                    subhardware.Update()
                    for sensor in subhardware.Sensors:
                        sensor_count += 1
            
            if sensor_count == 0:
                self.initialization_error = "No sensors detected - admin privileges may be required"
                logger.warning(self.initialization_error)
                return False
            
            self.is_initialized = True
            logger.info(f"PyHardwareMonitor initialized successfully with {sensor_count} sensors")
            
            # Cache hardware information
            await self._cache_hardware_info()
            
            return True
            
        except Exception as e:
            self.initialization_error = f"PyHardwareMonitor initialization failed: {str(e)}"
            logger.error(self.initialization_error, exc_info=True)
            return False
    
    async def cleanup(self):
        """Cleanup PyHardwareMonitor resources"""
        logger.info("Cleaning up PyHardwareMonitor...")
        
        try:
            if self.computer:
                self.computer.Close()
                self.computer = None
        except Exception as e:
            logger.error(f"Error during PyHardwareMonitor cleanup: {e}")
        
        self.is_initialized = False
        self.sensor_cache.clear()
        logger.info("PyHardwareMonitor cleanup complete")
    
    async def get_sensor_data(self) -> Optional[SensorData]:
        """Get comprehensive sensor data from all hardware components"""
        if not self.is_initialized or not self.computer:
            return None
        
        start_time = datetime.utcnow()
        
        try:
            # Update all hardware sensors
            for hardware in self.computer.Hardware:
                hardware.Update()
                for subhardware in hardware.SubHardware:
                    subhardware.Update()
            
            # Collect sensor readings
            raw_sensors = {}
            cpu_data = CPUData()
            gpu_data = GPUData()
            memory_data = MemoryData()
            storage_data = StorageData()
            fan_data = FanData()
            power_data = PowerData()
            
            for hardware in self.computer.Hardware:
                await self._process_hardware(hardware, raw_sensors, cpu_data, gpu_data, 
                                           memory_data, storage_data, fan_data, power_data)
                
                # Process sub-hardware (GPU components, etc.)
                for subhardware in hardware.SubHardware:
                    await self._process_hardware(subhardware, raw_sensors, cpu_data, gpu_data,
                                               memory_data, storage_data, fan_data, power_data)
            
            # Calculate collection time
            collection_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Create comprehensive sensor data
            sensor_data = SensorData(
                timestamp=start_time,
                cpu=cpu_data if cpu_data.temperature or cpu_data.load else None,
                gpu=gpu_data if gpu_data.temperature or gpu_data.load else None,
                memory=memory_data if memory_data.used is not None else None,
                storage=storage_data if storage_data.temperature or storage_data.usage else None,
                fans=fan_data if fan_data.cpu_fans or fan_data.case_fans else None,
                power=power_data if power_data.cpu_power or power_data.gpu_power else None,
                raw_sensors=raw_sensors,
                source="hardware_monitor",
                collection_time_ms=collection_time,
                sensor_count=len(raw_sensors)
            )
            
            # Cache the data
            self.sensor_cache = raw_sensors
            self.last_update = start_time
            
            return sensor_data
            
        except Exception as e:
            logger.error(f"Error collecting sensor data: {e}")
            return None
    
    async def _process_hardware(self, hardware, raw_sensors: Dict, cpu_data: CPUData, 
                              gpu_data: GPUData, memory_data: MemoryData, 
                              storage_data: StorageData, fan_data: FanData, 
                              power_data: PowerData):
        """Process sensors from a hardware component"""
        hardware_type = str(hardware.HardwareType).lower()
        hardware_name = str(hardware.Name)
        
        for sensor in hardware.Sensors:
            if sensor.Value is None:
                continue
            
            sensor_type_str = str(sensor.SensorType).lower()
            sensor_name = str(sensor.Name)
            sensor_value = float(sensor.Value)
            sensor_path = f"{hardware_name}/{sensor_name}"
            
            # Map sensor types
            sensor_type = self._map_sensor_type(sensor_type_str)
            unit = self._get_sensor_unit(sensor_type_str, sensor_type)
            
            # Create sensor reading
            reading = SensorReading(
                name=sensor_name,
                value=sensor_value,
                unit=unit,
                sensor_type=sensor_type,
                path=sensor_path,
                timestamp=datetime.utcnow()
            )
            
            raw_sensors[sensor_path] = reading
            
            # Categorize sensor data by hardware type and sensor type
            if "cpu" in hardware_type:
                self._categorize_cpu_sensor(sensor_type_str, sensor_name, sensor_value, cpu_data)
            elif "gpu" in hardware_type or "nvidia" in hardware_type.lower() or "amd" in hardware_type.lower():
                self._categorize_gpu_sensor(sensor_type_str, sensor_name, sensor_value, gpu_data)
            elif "memory" in hardware_type:
                self._categorize_memory_sensor(sensor_type_str, sensor_name, sensor_value, memory_data)
            elif "storage" in hardware_type or "hdd" in hardware_type or "ssd" in hardware_type:
                self._categorize_storage_sensor(sensor_type_str, sensor_name, sensor_value, storage_data)
            
            # Fan sensors can come from various hardware types
            if sensor_type == SensorType.FAN:
                self._categorize_fan_sensor(hardware_type, sensor_name, sensor_value, fan_data)
            
            # Power sensors
            if sensor_type == SensorType.POWER:
                self._categorize_power_sensor(hardware_type, sensor_name, sensor_value, power_data)
    
    def _map_sensor_type(self, sensor_type_str: str) -> SensorType:
        """Map LibreHardwareMonitor sensor types to our enum"""
        mapping = {
            "temperature": SensorType.TEMPERATURE,
            "load": SensorType.LOAD,
            "fan": SensorType.FAN,
            "voltage": SensorType.VOLTAGE,
            "clock": SensorType.CLOCK,
            "power": SensorType.POWER,
            "data": SensorType.DATA,
            "factor": SensorType.FACTOR,
            "flow": SensorType.FLOW,
            "control": SensorType.CONTROL,
            "level": SensorType.LEVEL,
            "throughput": SensorType.THROUGHPUT
        }
        return mapping.get(sensor_type_str, SensorType.DATA)
    
    def _get_sensor_unit(self, sensor_type_str: str, sensor_type: SensorType) -> str:
        """Get appropriate unit for sensor type"""
        unit_mapping = {
            "temperature": "°C",
            "load": "%",
            "fan": "RPM",
            "voltage": "V",
            "clock": "MHz",
            "power": "W",
            "data": "GB",
            "throughput": "MB/s",
            "flow": "L/h"
        }
        return unit_mapping.get(sensor_type_str, "")
    
    def _categorize_cpu_sensor(self, sensor_type: str, name: str, value: float, cpu_data: CPUData):
        """Categorize CPU sensor data"""
        if sensor_type == "temperature":
            cpu_data.temperature[name] = value
            if cpu_data.average_temperature is None:
                cpu_data.average_temperature = value
            else:
                cpu_data.average_temperature = (cpu_data.average_temperature + value) / 2
            
            if cpu_data.max_temperature is None or value > cpu_data.max_temperature:
                cpu_data.max_temperature = value
        
        elif sensor_type == "load":
            cpu_data.load[name] = value
            if "total" in name.lower():
                cpu_data.total_load = value
        
        elif sensor_type == "clock":
            cpu_data.clock[name] = value
            if "base" in name.lower():
                cpu_data.base_clock = value
            elif "boost" in name.lower() or "turbo" in name.lower():
                cpu_data.boost_clock = value
        
        elif sensor_type == "voltage":
            cpu_data.voltage[name] = value
        
        elif sensor_type == "power":
            cpu_data.power[name] = value
    
    def _categorize_gpu_sensor(self, sensor_type: str, name: str, value: float, gpu_data: GPUData):
        """Categorize GPU sensor data"""
        if sensor_type == "temperature":
            gpu_data.temperature[name] = value
            if "core" in name.lower():
                gpu_data.core_temperature = value
        
        elif sensor_type == "load":
            gpu_data.load[name] = value
            if "core" in name.lower() or "gpu" in name.lower():
                gpu_data.total_load = value
        
        elif sensor_type == "clock":
            gpu_data.clock[name] = value
            if "core" in name.lower():
                gpu_data.core_clock = value
            elif "memory" in name.lower():
                gpu_data.memory_clock = value
        
        elif sensor_type == "fan":
            gpu_data.fan[name] = value
        
        elif sensor_type == "data":
            gpu_data.memory[name] = value
            if "used" in name.lower():
                gpu_data.memory_used = value
            elif "total" in name.lower():
                gpu_data.memory_total = value
        
        elif sensor_type == "power":
            gpu_data.power[name] = value
    
    def _categorize_memory_sensor(self, sensor_type: str, name: str, value: float, memory_data: MemoryData):
        """Categorize memory sensor data"""
        if sensor_type == "load":
            memory_data.load = value
        elif sensor_type == "data":
            if "used" in name.lower():
                memory_data.used = value * 1024  # Convert to MB
            elif "available" in name.lower():
                memory_data.available = value * 1024
            elif "total" in name.lower():
                memory_data.total = value * 1024
    
    def _categorize_storage_sensor(self, sensor_type: str, name: str, value: float, storage_data: StorageData):
        """Categorize storage sensor data"""
        if sensor_type == "temperature":
            storage_data.temperature[name] = value
        elif sensor_type == "load":
            storage_data.load[name] = value
        elif sensor_type == "throughput":
            storage_data.throughput[name] = value
    
    def _categorize_fan_sensor(self, hardware_type: str, name: str, value: float, fan_data: FanData):
        """Categorize fan sensor data"""
        if "cpu" in hardware_type.lower() or "cpu" in name.lower():
            fan_data.cpu_fans[name] = value
        elif "gpu" in hardware_type.lower() or "gpu" in name.lower():
            fan_data.gpu_fans[name] = value
        elif "case" in name.lower() or "chassis" in name.lower():
            fan_data.case_fans[name] = value
        else:
            fan_data.other_fans[name] = value
    
    def _categorize_power_sensor(self, hardware_type: str, name: str, value: float, power_data: PowerData):
        """Categorize power sensor data"""
        if "cpu" in hardware_type.lower():
            power_data.cpu_power = value
        elif "gpu" in hardware_type.lower():
            power_data.gpu_power = value
        elif "total" in name.lower():
            power_data.total_power = value
    
    async def _cache_hardware_info(self):
        """Cache hardware information for system info"""
        if not self.computer:
            return
        
        self.hardware_info = {
            "cpu_info": [],
            "gpu_info": [],
            "memory_info": {},
            "storage_info": []
        }
        
        try:
            for hardware in self.computer.Hardware:
                hardware_type = str(hardware.HardwareType).lower()
                hardware_name = str(hardware.Name)
                
                if "cpu" in hardware_type:
                    self.hardware_info["cpu_info"].append({
                        "name": hardware_name,
                        "type": hardware_type
                    })
                elif "gpu" in hardware_type:
                    self.hardware_info["gpu_info"].append({
                        "name": hardware_name,
                        "type": hardware_type
                    })
                elif "memory" in hardware_type:
                    self.hardware_info["memory_info"]["name"] = hardware_name
                elif "storage" in hardware_type:
                    self.hardware_info["storage_info"].append({
                        "name": hardware_name,
                        "type": hardware_type
                    })
        except Exception as e:
            logger.error(f"Error caching hardware info: {e}")
    
    async def get_sensor_by_path(self, sensor_path: str) -> Optional[SensorReading]:
        """Get specific sensor reading by path"""
        return self.sensor_cache.get(sensor_path)
    
    async def get_available_sensors(self) -> List[str]:
        """Get list of available sensor paths"""
        return list(self.sensor_cache.keys())
    
    async def get_system_info(self) -> Dict[str, Any]:
        """Get system information from hardware monitor"""
        return {
            "hardware_monitor_version": "LibreHardwareMonitor",
            "admin_privileges": True,  # Required for PyHardwareMonitor
            "detailed_sensors": True,
            **self.hardware_info
        }
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get health status of hardware monitor service"""
        return {
            "status": "healthy" if self.is_initialized else "error",
            "initialized": self.is_initialized,
            "last_update": self.last_update.isoformat() if self.last_update else None,
            "sensor_count": len(self.sensor_cache),
            "initialization_error": self.initialization_error
        }
    
    async def refresh_sensors(self):
        """Manually refresh sensor data"""
        if not self.is_initialized:
            raise RuntimeError("Hardware monitor not initialized")
        
        # Force update all hardware
        for hardware in self.computer.Hardware:
            hardware.Update()
            for subhardware in hardware.SubHardware:
                subhardware.Update()