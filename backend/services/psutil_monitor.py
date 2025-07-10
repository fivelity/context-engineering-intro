"""
PsutilMonitorService - Cross-platform sensor monitoring using psutil
Fallback service when PyHardwareMonitor is not available
"""

import asyncio
import logging
import platform
import shutil
from datetime import datetime
from typing import Dict, List, Optional, Any

import psutil

from models.sensor_models import (
    SensorData, SensorReading, SensorType, SystemInfo,
    CPUData, GPUData, MemoryData, StorageData, NetworkData
)
from utils.config import get_settings

logger = logging.getLogger(__name__)


class PsutilMonitorService:
    """
    Cross-platform sensor monitoring using psutil
    Provides basic system monitoring when detailed hardware access is not available
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.is_initialized = False
        self.initialization_error: Optional[str] = None
        self.last_update: Optional[datetime] = None
        self.sensor_cache: Dict[str, SensorReading] = {}
        self.system_info: Dict[str, Any] = {}
        self.baseline_measurements: Dict[str, Any] = {}
        
    async def initialize(self) -> bool:
        """Initialize psutil monitoring service"""
        try:
            logger.info("Initializing psutil monitoring service...")
            
            # Test psutil functionality
            try:
                # Basic CPU test
                cpu_percent = psutil.cpu_percent(interval=0.1)
                cpu_count = psutil.cpu_count()
                
                # Memory test
                memory = psutil.virtual_memory()
                
                # Disk test
                disk_usage = psutil.disk_usage('/')
                
                logger.info(f"Psutil test successful - CPU: {cpu_percent}%, Memory: {memory.percent}%")
                
            except Exception as e:
                self.initialization_error = f"Psutil functionality test failed: {e}"
                logger.error(self.initialization_error)
                return False
            
            # Collect system information
            await self._collect_system_info()
            
            # Get baseline measurements
            await self._collect_baseline_measurements()
            
            self.is_initialized = True
            logger.info("Psutil monitoring service initialized successfully")
            return True
            
        except Exception as e:
            self.initialization_error = f"Psutil initialization failed: {e}"
            logger.error(self.initialization_error, exc_info=True)
            return False
    
    async def cleanup(self):
        """Cleanup psutil monitoring service"""
        logger.info("Cleaning up psutil monitoring service...")
        self.is_initialized = False
        self.sensor_cache.clear()
        logger.info("Psutil monitoring service cleanup complete")
    
    async def get_sensor_data(self) -> Optional[SensorData]:
        """Get sensor data using psutil"""
        if not self.is_initialized:
            return None
        
        start_time = datetime.utcnow()
        
        try:
            # Collect all sensor data
            raw_sensors = {}
            
            # CPU data
            cpu_data = await self._collect_cpu_data(raw_sensors)
            
            # Memory data  
            memory_data = await self._collect_memory_data(raw_sensors)
            
            # Storage data
            storage_data = await self._collect_storage_data(raw_sensors)
            
            # Network data
            network_data = await self._collect_network_data(raw_sensors)
            
            # GPU data (limited)
            gpu_data = await self._collect_gpu_data(raw_sensors)
            
            # Calculate collection time
            collection_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Create sensor data object
            sensor_data = SensorData(
                timestamp=start_time,
                cpu=cpu_data,
                memory=memory_data,
                storage=storage_data,
                network=network_data,
                gpu=gpu_data if gpu_data.load else None,
                raw_sensors=raw_sensors,
                source="psutil",
                collection_time_ms=collection_time,
                sensor_count=len(raw_sensors)
            )
            
            # Cache the data
            self.sensor_cache = raw_sensors
            self.last_update = start_time
            
            return sensor_data
            
        except Exception as e:
            logger.error(f"Error collecting psutil sensor data: {e}")
            return None
    
    async def _collect_cpu_data(self, raw_sensors: Dict) -> CPUData:
        """Collect CPU sensor data"""
        cpu_data = CPUData()
        
        try:
            # CPU percentage (per core and total)
            cpu_percentages = psutil.cpu_percent(interval=0.1, percpu=True)
            total_cpu = psutil.cpu_percent(interval=0.1)
            
            # Store per-core loads
            for i, percent in enumerate(cpu_percentages):
                core_name = f"Core {i}"
                cpu_data.load[core_name] = percent
                
                # Create sensor reading
                reading = SensorReading(
                    name=f"CPU {core_name} Load",
                    value=percent,
                    unit="%",
                    sensor_type=SensorType.LOAD,
                    path=f"CPU/Load/{core_name}",
                    timestamp=datetime.utcnow()
                )
                raw_sensors[reading.path] = reading
            
            # Total CPU load
            cpu_data.total_load = total_cpu
            reading = SensorReading(
                name="CPU Total Load",
                value=total_cpu,
                unit="%",
                sensor_type=SensorType.LOAD,
                path="CPU/Load/Total",
                timestamp=datetime.utcnow()
            )
            raw_sensors[reading.path] = reading
            
            # CPU frequency
            try:
                cpu_freq = psutil.cpu_freq()
                if cpu_freq:
                    cpu_data.base_clock = cpu_freq.current
                    
                    reading = SensorReading(
                        name="CPU Frequency",
                        value=cpu_freq.current,
                        unit="MHz",
                        sensor_type=SensorType.CLOCK,
                        path="CPU/Clock/Current",
                        timestamp=datetime.utcnow()
                    )
                    raw_sensors[reading.path] = reading
                    
                    if cpu_freq.max:
                        reading = SensorReading(
                            name="CPU Max Frequency",
                            value=cpu_freq.max,
                            unit="MHz",
                            sensor_type=SensorType.CLOCK,
                            path="CPU/Clock/Max",
                            timestamp=datetime.utcnow()
                        )
                        raw_sensors[reading.path] = reading
                        
            except Exception as e:
                logger.debug(f"CPU frequency not available: {e}")
            
            # CPU temperature (if available)
            try:
                temps = psutil.sensors_temperatures()
                if temps:
                    for name, entries in temps.items():
                        if 'cpu' in name.lower() or 'core' in name.lower():
                            for i, entry in enumerate(entries):
                                temp_name = f"{name}_{i}" if len(entries) > 1 else name
                                cpu_data.temperature[temp_name] = entry.current
                                
                                reading = SensorReading(
                                    name=f"CPU {temp_name} Temperature",
                                    value=entry.current,
                                    unit="°C",
                                    sensor_type=SensorType.TEMPERATURE,
                                    path=f"CPU/Temperature/{temp_name}",
                                    timestamp=datetime.utcnow()
                                )
                                raw_sensors[reading.path] = reading
                                
                                # Calculate average temperature
                                if cpu_data.average_temperature is None:
                                    cpu_data.average_temperature = entry.current
                                else:
                                    cpu_data.average_temperature = (cpu_data.average_temperature + entry.current) / 2
                                
                                # Track max temperature
                                if cpu_data.max_temperature is None or entry.current > cpu_data.max_temperature:
                                    cpu_data.max_temperature = entry.current
                                    
            except Exception as e:
                logger.debug(f"CPU temperature not available: {e}")
                
        except Exception as e:
            logger.error(f"Error collecting CPU data: {e}")
        
        return cpu_data
    
    async def _collect_memory_data(self, raw_sensors: Dict) -> MemoryData:
        """Collect memory sensor data"""
        memory_data = MemoryData()
        
        try:
            # Virtual memory
            vmem = psutil.virtual_memory()
            
            memory_data.total = vmem.total / (1024 * 1024)  # Convert to MB
            memory_data.used = vmem.used / (1024 * 1024)
            memory_data.available = vmem.available / (1024 * 1024)
            memory_data.load = vmem.percent
            
            # Virtual memory details
            memory_data.virtual = {
                "total": vmem.total / (1024 * 1024),
                "used": vmem.used / (1024 * 1024),
                "available": vmem.available / (1024 * 1024),
                "percent": vmem.percent,
                "free": vmem.free / (1024 * 1024)
            }
            
            # Swap memory
            try:
                swap = psutil.swap_memory()
                memory_data.swap = {
                    "total": swap.total / (1024 * 1024),
                    "used": swap.used / (1024 * 1024),
                    "free": swap.free / (1024 * 1024),
                    "percent": swap.percent
                }
            except Exception as e:
                logger.debug(f"Swap memory not available: {e}")
            
            # Create sensor readings
            readings = [
                ("Memory Total", memory_data.total, "MB", "Memory/Data/Total"),
                ("Memory Used", memory_data.used, "MB", "Memory/Data/Used"),
                ("Memory Available", memory_data.available, "MB", "Memory/Data/Available"),
                ("Memory Load", memory_data.load, "%", "Memory/Load/Percent")
            ]
            
            for name, value, unit, path in readings:
                if value is not None:
                    sensor_type = SensorType.LOAD if "load" in name.lower() else SensorType.DATA
                    reading = SensorReading(
                        name=name,
                        value=value,
                        unit=unit,
                        sensor_type=sensor_type,
                        path=path,
                        timestamp=datetime.utcnow()
                    )
                    raw_sensors[path] = reading
                    
        except Exception as e:
            logger.error(f"Error collecting memory data: {e}")
        
        return memory_data
    
    async def _collect_storage_data(self, raw_sensors: Dict) -> StorageData:
        """Collect storage sensor data"""
        storage_data = StorageData()
        
        try:
            # Disk usage for all mounted partitions
            partitions = psutil.disk_partitions()
            
            for partition in partitions:
                try:
                    partition_usage = psutil.disk_usage(partition.mountpoint)
                    
                    # Store usage data
                    device_name = partition.device.replace('\\', '').replace(':', '') if platform.system() == 'Windows' else partition.device.split('/')[-1]
                    
                    storage_data.usage[device_name] = {
                        "total": partition_usage.total / (1024**3),  # GB
                        "used": partition_usage.used / (1024**3),
                        "free": partition_usage.free / (1024**3),
                        "percent": (partition_usage.used / partition_usage.total) * 100
                    }
                    
                    # Create sensor readings
                    readings = [
                        (f"{device_name} Total", partition_usage.total / (1024**3), "GB", f"Storage/{device_name}/Total"),
                        (f"{device_name} Used", partition_usage.used / (1024**3), "GB", f"Storage/{device_name}/Used"),
                        (f"{device_name} Free", partition_usage.free / (1024**3), "GB", f"Storage/{device_name}/Free"),
                        (f"{device_name} Load", (partition_usage.used / partition_usage.total) * 100, "%", f"Storage/{device_name}/Load")
                    ]
                    
                    for name, value, unit, path in readings:
                        sensor_type = SensorType.LOAD if "load" in name.lower() else SensorType.DATA
                        reading = SensorReading(
                            name=name,
                            value=value,
                            unit=unit,
                            sensor_type=sensor_type,
                            path=path,
                            timestamp=datetime.utcnow()
                        )
                        raw_sensors[path] = reading
                        
                except PermissionError:
                    # Skip partitions we can't access
                    continue
                except Exception as e:
                    logger.debug(f"Error reading partition {partition.device}: {e}")
                    continue
            
            # Disk I/O statistics
            try:
                disk_io = psutil.disk_io_counters(perdisk=True)
                if disk_io:
                    for disk_name, io_stats in disk_io.items():
                        # Calculate throughput (simplified)
                        read_mb_s = io_stats.read_bytes / (1024 * 1024) / 60  # Rough estimate
                        write_mb_s = io_stats.write_bytes / (1024 * 1024) / 60
                        
                        storage_data.throughput[f"{disk_name}_read"] = read_mb_s
                        storage_data.throughput[f"{disk_name}_write"] = write_mb_s
                        
                        # Create sensor readings
                        readings = [
                            (f"{disk_name} Read Throughput", read_mb_s, "MB/s", f"Storage/{disk_name}/Read"),
                            (f"{disk_name} Write Throughput", write_mb_s, "MB/s", f"Storage/{disk_name}/Write")
                        ]
                        
                        for name, value, unit, path in readings:
                            reading = SensorReading(
                                name=name,
                                value=value,
                                unit=unit,
                                sensor_type=SensorType.THROUGHPUT,
                                path=path,
                                timestamp=datetime.utcnow()
                            )
                            raw_sensors[path] = reading
                            
            except Exception as e:
                logger.debug(f"Disk I/O stats not available: {e}")
                
        except Exception as e:
            logger.error(f"Error collecting storage data: {e}")
        
        return storage_data
    
    async def _collect_network_data(self, raw_sensors: Dict) -> NetworkData:
        """Collect network sensor data"""
        network_data = NetworkData()
        
        try:
            # Network I/O statistics
            net_io = psutil.net_io_counters()
            if net_io:
                network_data.bytes_sent = net_io.bytes_sent / (1024 * 1024)  # MB
                network_data.bytes_received = net_io.bytes_recv / (1024 * 1024)
                network_data.packets_sent = net_io.packets_sent
                network_data.packets_received = net_io.packets_recv
                
                # Create sensor readings
                readings = [
                    ("Network Bytes Sent", network_data.bytes_sent, "MB", "Network/Data/BytesSent"),
                    ("Network Bytes Received", network_data.bytes_received, "MB", "Network/Data/BytesReceived"),
                    ("Network Packets Sent", network_data.packets_sent, "packets", "Network/Data/PacketsSent"),
                    ("Network Packets Received", network_data.packets_received, "packets", "Network/Data/PacketsReceived")
                ]
                
                for name, value, unit, path in readings:
                    reading = SensorReading(
                        name=name,
                        value=value,
                        unit=unit,
                        sensor_type=SensorType.DATA,
                        path=path,
                        timestamp=datetime.utcnow()
                    )
                    raw_sensors[path] = reading
                    
        except Exception as e:
            logger.error(f"Error collecting network data: {e}")
        
        return network_data
    
    async def _collect_gpu_data(self, raw_sensors: Dict) -> GPUData:
        """Collect limited GPU data (if available)"""
        gpu_data = GPUData()
        
        try:
            # Try to get GPU information using various methods
            # This is very limited compared to PyHardwareMonitor
            
            # Check for NVIDIA GPU via nvidia-smi (if available)
            if shutil.which('nvidia-smi'):
                try:
                    import subprocess
                    result = subprocess.run(['nvidia-smi', '--query-gpu=utilization.gpu,temperature.gpu,memory.used,memory.total', '--format=csv,noheader,nounits'], 
                                          capture_output=True, text=True, timeout=5)
                    
                    if result.returncode == 0:
                        lines = result.stdout.strip().split('\n')
                        for i, line in enumerate(lines):
                            parts = line.split(', ')
                            if len(parts) >= 4:
                                gpu_name = f"GPU_{i}"
                                gpu_load = float(parts[0])
                                gpu_temp = float(parts[1])
                                gpu_mem_used = float(parts[2])
                                gpu_mem_total = float(parts[3])
                                
                                gpu_data.load[gpu_name] = gpu_load
                                gpu_data.temperature[gpu_name] = gpu_temp
                                gpu_data.memory[f"{gpu_name}_used"] = gpu_mem_used
                                gpu_data.memory[f"{gpu_name}_total"] = gpu_mem_total
                                
                                if i == 0:  # Primary GPU
                                    gpu_data.total_load = gpu_load
                                    gpu_data.core_temperature = gpu_temp
                                    gpu_data.memory_used = gpu_mem_used
                                    gpu_data.memory_total = gpu_mem_total
                                
                                # Create sensor readings
                                readings = [
                                    (f"{gpu_name} Load", gpu_load, "%", f"GPU/{gpu_name}/Load"),
                                    (f"{gpu_name} Temperature", gpu_temp, "°C", f"GPU/{gpu_name}/Temperature"),
                                    (f"{gpu_name} Memory Used", gpu_mem_used, "MB", f"GPU/{gpu_name}/MemoryUsed"),
                                    (f"{gpu_name} Memory Total", gpu_mem_total, "MB", f"GPU/{gpu_name}/MemoryTotal")
                                ]
                                
                                for name, value, unit, path in readings:
                                    sensor_type = SensorType.LOAD if "load" in name.lower() else \
                                                SensorType.TEMPERATURE if "temperature" in name.lower() else \
                                                SensorType.DATA
                                    reading = SensorReading(
                                        name=name,
                                        value=value,
                                        unit=unit,
                                        sensor_type=sensor_type,
                                        path=path,
                                        timestamp=datetime.utcnow()
                                    )
                                    raw_sensors[path] = reading
                                    
                except Exception as e:
                    logger.debug(f"nvidia-smi failed: {e}")
                    
        except Exception as e:
            logger.debug(f"Error collecting GPU data: {e}")
        
        return gpu_data
    
    async def _collect_system_info(self):
        """Collect system information"""
        try:
            self.system_info = {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "architecture": platform.architecture()[0],
                "processor": platform.processor(),
                "hostname": platform.node(),
                "python_version": platform.python_version(),
                "psutil_version": psutil.__version__ if hasattr(psutil, '__version__') else "unknown",
                "cpu_count": psutil.cpu_count(),
                "cpu_count_logical": psutil.cpu_count(logical=True),
                "boot_time": datetime.fromtimestamp(psutil.boot_time()).isoformat()
            }
        except Exception as e:
            logger.error(f"Error collecting system info: {e}")
    
    async def _collect_baseline_measurements(self):
        """Collect baseline measurements for delta calculations"""
        try:
            self.baseline_measurements = {
                "network_io": psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {},
                "disk_io": {name: stats._asdict() for name, stats in psutil.disk_io_counters(perdisk=True).items()},
                "timestamp": datetime.utcnow()
            }
        except Exception as e:
            logger.error(f"Error collecting baseline measurements: {e}")
    
    async def get_sensor_by_path(self, sensor_path: str) -> Optional[SensorReading]:
        """Get specific sensor reading by path"""
        return self.sensor_cache.get(sensor_path)
    
    async def get_available_sensors(self) -> List[str]:
        """Get list of available sensor paths"""
        return list(self.sensor_cache.keys())
    
    async def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            **self.system_info,
            "monitoring_service": "psutil",
            "detailed_sensors": False,
            "admin_privileges": False
        }
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get health status of psutil service"""
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
            raise RuntimeError("Psutil service not initialized")
        
        # Just trigger a new data collection
        await self.get_sensor_data()