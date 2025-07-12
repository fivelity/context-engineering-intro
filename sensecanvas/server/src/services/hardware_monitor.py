"""
SenseCanvas Hardware Monitoring Service
LibreHardwareMonitor integration with pythonnet for Windows hardware monitoring,
with graceful fallback to psutil for cross-platform compatibility.
"""

import asyncio
import logging
import os
import platform
import time
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from pathlib import Path

# Cross-platform imports
import psutil

# Windows-specific imports (conditional)
try:
    import clr
    import sys
    
    # Add reference to LibreHardwareMonitorLib.dll
    dll_path = Path(__file__).parent.parent.parent / "LibreHardwareMonitorLib.dll"
    if dll_path.exists():
        clr.AddReference(str(dll_path))
        from LibreHardwareMonitor.Hardware import Computer
        WINDOWS_MONITORING_AVAILABLE = True
    else:
        WINDOWS_MONITORING_AVAILABLE = False
        Computer = None
except ImportError:
    WINDOWS_MONITORING_AVAILABLE = False
    Computer = None

# Import our Pydantic models
from ..models.hardware import (
    HardwareMetrics,
    CpuMetrics,
    GpuMetrics,
    MemoryMetrics,
    StorageMetrics,
    NetworkMetrics,
    SystemMetrics,
    CoreMetric,
    GpuMemory,
    GpuFrequency,
    HardwareAlert,
    HardwareStatus
)

logger = logging.getLogger(__name__)


@dataclass
class SensorReading:
    """Represents a single sensor reading."""
    name: str
    value: float
    sensor_type: str
    unit: str
    timestamp: float


class HardwareMonitor:
    """
    Main hardware monitoring class that handles both Windows LibreHardwareMonitor
    and cross-platform psutil monitoring.
    """
    
    def __init__(self, polling_interval: float = 1.0):
        self.is_windows = platform.system() == "Windows"
        self.use_libre_hardware = WINDOWS_MONITORING_AVAILABLE and self.is_windows
        self.computer: Optional[Computer] = None
        self.is_initialized = False
        self.last_update_time = 0
        self.update_interval = polling_interval
        self.error_count = 0
        
        # Network monitoring state for rate calculations
        self.network_stats_prev = None
        self.network_time_prev = None
        
        # Alert thresholds (configurable)
        self.alert_thresholds = {
            'cpu_temp_warning': 75.0,
            'cpu_temp_critical': 85.0,
            'gpu_temp_warning': 80.0,
            'gpu_temp_critical': 90.0,
            'memory_usage_warning': 85.0,
            'memory_usage_critical': 95.0,
            'cpu_usage_warning': 90.0,
            'storage_usage_warning': 90.0
        }
        
        logger.info(
            f"Hardware Monitor initialized - Windows: {self.is_windows}, "
            f"LibreHardware: {self.use_libre_hardware}, "
            f"Polling interval: {polling_interval}s"
        )
        
    async def initialize(self) -> None:
        """Initialize the hardware monitoring system."""
        try:
            if self.use_libre_hardware:
                await self._initialize_libre_hardware()
            else:
                await self._initialize_psutil()
                
            self.is_initialized = True
            self.error_count = 0
            logger.info("Hardware monitoring initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize hardware monitoring: {e}")
            # Fallback to psutil
            if self.use_libre_hardware:
                logger.info("Falling back to psutil monitoring")
                self.use_libre_hardware = False
                try:
                    await self._initialize_psutil()
                    self.is_initialized = True
                    self.error_count = 0
                except Exception as fallback_error:
                    logger.error(f"Fallback initialization failed: {fallback_error}")
                    raise fallback_error
            else:
                raise
                
    async def _initialize_libre_hardware(self) -> None:
        """Initialize LibreHardwareMonitor for Windows."""
        try:
            # Check if running with admin privileges
            import ctypes
            is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0
            if not is_admin:
                logger.warning(
                    "Not running with administrator privileges. "
                    "Some sensors may not be available."
                )
            
            self.computer = Computer()
            
            # Enable monitoring for all hardware types
            self.computer.IsCpuEnabled = True
            self.computer.IsGpuEnabled = True
            self.computer.IsMemoryEnabled = True
            self.computer.IsStorageEnabled = True
            self.computer.IsNetworkEnabled = True
            self.computer.IsMotherboardEnabled = True
            
            # Open the computer for monitoring
            self.computer.Open()
            
            # Accept the license (if required)
            self.computer.Accept()
            
            logger.info("LibreHardwareMonitor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize LibreHardwareMonitor: {e}")
            raise
            
    async def _initialize_psutil(self) -> None:
        """Initialize psutil for cross-platform monitoring."""
        try:
            # Test psutil functionality
            psutil.cpu_percent(interval=0.1)
            psutil.virtual_memory()
            
            # Test disk access (use appropriate root path for OS)
            root_path = '/' if not self.is_windows else 'C:\\'
            try:
                psutil.disk_usage(root_path)
            except PermissionError:
                logger.warning(f"Cannot access disk usage for {root_path}")
            
            # Initialize network monitoring
            self.network_stats_prev = psutil.net_io_counters()
            self.network_time_prev = time.time()
            
            logger.info("psutil monitoring initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize psutil: {e}")
            raise
            
    async def get_metrics(self) -> HardwareMetrics:
        """Get current hardware metrics."""
        if not self.is_initialized:
            raise RuntimeError("Hardware monitor not initialized")
            
        try:
            if self.use_libre_hardware:
                metrics = await self._get_libre_hardware_metrics()
            else:
                metrics = await self._get_psutil_metrics()
            
            self.last_update_time = int(time.time() * 1000)
            return metrics
                
        except Exception as e:
            logger.error(f"Failed to get hardware metrics: {e}")
            self.error_count += 1
            
            # Try fallback if using LibreHardwareMonitor
            if self.use_libre_hardware:
                logger.info("Falling back to psutil for this reading")
                try:
                    metrics = await self._get_psutil_metrics()
                    self.last_update_time = int(time.time() * 1000)
                    return metrics
                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {fallback_error}")
                    raise fallback_error
            else:
                raise
                
    async def _get_libre_hardware_metrics(self) -> HardwareMetrics:
        """Get metrics using LibreHardwareMonitor."""
        if not self.computer:
            raise RuntimeError("LibreHardwareMonitor not initialized")
            
        # Update hardware information
        self.computer.Update()
        
        # Collect metrics from all hardware components
        cpu_metrics = self._collect_cpu_metrics_libre()
        gpu_metrics = self._collect_gpu_metrics_libre()
        memory_metrics = self._collect_memory_metrics_libre()
        storage_metrics = self._collect_storage_metrics_libre()
        network_metrics = self._collect_network_metrics_psutil()  # Always use psutil for network
        system_metrics = self._collect_system_metrics()
        
        return HardwareMetrics(
            timestamp=int(time.time() * 1000),
            cpu=cpu_metrics,
            gpu=gpu_metrics,
            memory=memory_metrics,
            storage=storage_metrics,
            network=network_metrics,
            system=system_metrics
        )
        
    async def _get_psutil_metrics(self) -> HardwareMetrics:
        """Get metrics using psutil."""
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        cpu_per_core = psutil.cpu_percent(percpu=True)
        
        # Create core metrics
        core_metrics = []
        for i, usage in enumerate(cpu_per_core):
            core_metrics.append(CoreMetric(
                id=i,
                usage=usage,
                temperature=0.0  # Not available in psutil
            ))
        
        # Memory metrics
        memory = psutil.virtual_memory()
        
        # Storage metrics
        storage_list = []
        for disk in psutil.disk_partitions():
            try:
                disk_usage = psutil.disk_usage(disk.mountpoint)
                storage_list.append(StorageMetrics(
                    usage=(disk_usage.used / disk_usage.total) * 100,
                    used=disk_usage.used // (1024**3),  # GB
                    total=disk_usage.total // (1024**3),  # GB
                    temperature=0.0,  # Not available in psutil
                    health='good',
                    name=disk.device,
                    type='Unknown'
                ))
            except (PermissionError, OSError):
                continue
                
        # Network metrics
        network_metrics = self._collect_network_metrics_psutil()
        system_metrics = self._collect_system_metrics()
        
        return HardwareMetrics(
            timestamp=int(time.time() * 1000),
            cpu=CpuMetrics(
                usage=cpu_percent,
                temperature=self._get_cpu_temperature_psutil(),
                cores=core_metrics,
                frequency=cpu_freq.current if cpu_freq else 0.0,
                power=0.0  # Not available in psutil
            ),
            gpu=GpuMetrics(
                usage=0.0,  # Not available in psutil
                temperature=0.0,
                memory=GpuMemory(used=0, total=0, usage=0.0),
                frequency=GpuFrequency(core=0.0, memory=0.0),
                power=0.0,
                fanSpeed=0.0
            ),
            memory=MemoryMetrics(
                usage=memory.percent,
                used=memory.used // (1024**2),  # MB
                total=memory.total // (1024**2),  # MB
                available=memory.available // (1024**2),  # MB
                speed=0.0  # Not available in psutil
            ),
            storage=storage_list,
            network=network_metrics,
            system=system_metrics
        )
        
    def _collect_cpu_metrics_libre(self) -> CpuMetrics:
        """Collect CPU metrics using LibreHardwareMonitor."""
        cpu_usage = 0.0
        cpu_temp = 0.0
        cpu_freq = 0.0
        cpu_power = 0.0
        core_metrics = []
        
        for hardware in self.computer.Hardware:
            if hardware.HardwareType.ToString() == "Cpu":
                hardware.Update()
                
                for sensor in hardware.Sensors:
                    sensor_name = sensor.Name
                    sensor_type = sensor.SensorType.ToString()
                    sensor_value = float(sensor.Value) if sensor.Value else 0.0
                    
                    if sensor_type == "Load":
                        if "CPU Total" in sensor_name:
                            cpu_usage = sensor_value
                        elif "CPU Core" in sensor_name:
                            core_id = self._extract_core_id(sensor_name)
                            if core_id is not None:
                                # Find or create core metric
                                while len(core_metrics) <= core_id:
                                    core_metrics.append(CoreMetric(
                                        id=len(core_metrics),
                                        usage=0.0,
                                        temperature=0.0
                                    ))
                                core_metrics[core_id].usage = sensor_value
                                
                    elif sensor_type == "Temperature":
                        if "CPU Package" in sensor_name:
                            cpu_temp = sensor_value
                        elif "CPU Core" in sensor_name:
                            core_id = self._extract_core_id(sensor_name)
                            if core_id is not None and core_id < len(core_metrics):
                                core_metrics[core_id].temperature = sensor_value
                                
                    elif sensor_type == "Clock":
                        if "CPU Core" in sensor_name:
                            cpu_freq = sensor_value
                            
                    elif sensor_type == "Power":
                        if "CPU Package" in sensor_name:
                            cpu_power = sensor_value
                            
        return CpuMetrics(
            usage=cpu_usage,
            temperature=cpu_temp,
            cores=core_metrics,
            frequency=cpu_freq,
            power=cpu_power
        )
        
    def _collect_gpu_metrics_libre(self) -> GpuMetrics:
        """Collect GPU metrics using LibreHardwareMonitor."""
        gpu_usage = 0.0
        gpu_temp = 0.0
        gpu_memory_used = 0
        gpu_memory_total = 0
        gpu_core_freq = 0.0
        gpu_memory_freq = 0.0
        gpu_power = 0.0
        gpu_fan_speed = 0.0
        
        for hardware in self.computer.Hardware:
            if hardware.HardwareType.ToString() in ["GpuNvidia", "GpuAmd"]:
                hardware.Update()
                
                for sensor in hardware.Sensors:
                    sensor_name = sensor.Name
                    sensor_type = sensor.SensorType.ToString()
                    sensor_value = float(sensor.Value) if sensor.Value else 0.0
                    
                    if sensor_type == "Load":
                        if "GPU Core" in sensor_name:
                            gpu_usage = sensor_value
                    elif sensor_type == "Temperature":
                        if "GPU Core" in sensor_name:
                            gpu_temp = sensor_value
                    elif sensor_type == "SmallData":
                        if "GPU Memory Used" in sensor_name:
                            gpu_memory_used = int(sensor_value)
                        elif "GPU Memory Total" in sensor_name:
                            gpu_memory_total = int(sensor_value)
                    elif sensor_type == "Clock":
                        if "GPU Core" in sensor_name:
                            gpu_core_freq = sensor_value
                        elif "GPU Memory" in sensor_name:
                            gpu_memory_freq = sensor_value
                    elif sensor_type == "Power":
                        if "GPU Power" in sensor_name:
                            gpu_power = sensor_value
                    elif sensor_type == "Fan":
                        if "GPU Fan" in sensor_name:
                            gpu_fan_speed = sensor_value
                            
        gpu_memory_usage = (gpu_memory_used / gpu_memory_total * 100) if gpu_memory_total > 0 else 0.0
        
        return GpuMetrics(
            usage=gpu_usage,
            temperature=gpu_temp,
            memory=GpuMemory(
                used=gpu_memory_used,
                total=gpu_memory_total,
                usage=gpu_memory_usage
            ),
            frequency=GpuFrequency(
                core=gpu_core_freq,
                memory=gpu_memory_freq
            ),
            power=gpu_power,
            fanSpeed=gpu_fan_speed
        )
        
    def _collect_memory_metrics_libre(self) -> MemoryMetrics:
        """Collect memory metrics using LibreHardwareMonitor."""
        memory_usage = 0.0
        memory_used = 0
        memory_total = 0
        memory_available = 0
        memory_speed = 0.0
        
        for hardware in self.computer.Hardware:
            if hardware.HardwareType.ToString() == "Memory":
                hardware.Update()
                
                for sensor in hardware.Sensors:
                    sensor_name = sensor.Name
                    sensor_type = sensor.SensorType.ToString()
                    sensor_value = float(sensor.Value) if sensor.Value else 0.0
                    
                    if sensor_type == "Load":
                        if "Memory" in sensor_name:
                            memory_usage = sensor_value
                    elif sensor_type == "Data":
                        if "Memory Used" in sensor_name:
                            memory_used = int(sensor_value)
                        elif "Memory Available" in sensor_name:
                            memory_available = int(sensor_value)
                    elif sensor_type == "Clock":
                        if "Memory" in sensor_name:
                            memory_speed = sensor_value
                            
        # Fallback to psutil if LibreHardwareMonitor doesn't provide memory info
        if memory_total == 0:
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            memory_used = memory.used // (1024**2)  # MB
            memory_total = memory.total // (1024**2)  # MB
            memory_available = memory.available // (1024**2)  # MB
            
        return MemoryMetrics(
            usage=memory_usage,
            used=memory_used,
            total=memory_total,
            available=memory_available,
            speed=memory_speed
        )
        
    def _collect_storage_metrics_libre(self) -> List[StorageMetrics]:
        """Collect storage metrics using LibreHardwareMonitor."""
        storage_list = []
        storage_temps = {}
        
        # Get temperature data from LibreHardwareMonitor
        for hardware in self.computer.Hardware:
            if hardware.HardwareType.ToString() == "Storage":
                hardware.Update()
                
                hardware_name = str(hardware.Name)
                for sensor in hardware.Sensors:
                    sensor_type = sensor.SensorType.ToString()
                    sensor_value = float(sensor.Value) if sensor.Value else 0.0
                    
                    if sensor_type == "Temperature":
                        storage_temps[hardware_name] = sensor_value
                        
        # Get disk usage info from psutil and combine with temperature data
        for disk in psutil.disk_partitions():
            try:
                disk_usage = psutil.disk_usage(disk.mountpoint)
                
                # Try to match storage device name for temperature
                temp = 0.0
                for name, temperature in storage_temps.items():
                    if disk.device.replace('\\', '').replace(':', '') in name:
                        temp = temperature
                        break
                
                storage_list.append(StorageMetrics(
                    usage=(disk_usage.used / disk_usage.total) * 100,
                    used=disk_usage.used // (1024**3),  # GB
                    total=disk_usage.total // (1024**3),  # GB
                    temperature=temp,
                    health='good',  # LibreHardwareMonitor doesn't provide health easily
                    name=disk.device,
                    type='Unknown'  # Would need additional logic to determine type
                ))
            except (PermissionError, OSError):
                continue
                        
        return storage_list
        
    def _collect_network_metrics_psutil(self) -> NetworkMetrics:
        """Collect network metrics using psutil."""
        try:
            current_stats = psutil.net_io_counters()
            current_time = time.time()
            
            if self.network_stats_prev is None:
                self.network_stats_prev = current_stats
                self.network_time_prev = current_time
                speed = 0.0
            else:
                # Calculate rates
                time_delta = current_time - self.network_time_prev
                if time_delta > 0:
                    bytes_recv_rate = (current_stats.bytes_recv - self.network_stats_prev.bytes_recv) / time_delta
                    bytes_sent_rate = (current_stats.bytes_sent - self.network_stats_prev.bytes_sent) / time_delta
                    speed = max(bytes_recv_rate, bytes_sent_rate) * 8 / (1024**2)  # Mbps
                else:
                    speed = 0.0
            
            # Update previous values
            self.network_stats_prev = current_stats
            self.network_time_prev = current_time
            
            return NetworkMetrics(
                bytesReceived=current_stats.bytes_recv,
                bytesSent=current_stats.bytes_sent,
                packetsReceived=current_stats.packets_recv,
                packetsSent=current_stats.packets_sent,
                speed=speed,
                interface='Default'
            )
        except Exception as e:
            logger.error(f"Failed to collect network metrics: {e}")
            return NetworkMetrics(
                bytesReceived=0,
                bytesSent=0,
                packetsReceived=0,
                packetsSent=0,
                speed=0.0,
                interface='Unknown'
            )
        
    def _collect_system_metrics(self) -> SystemMetrics:
        """Collect system-wide metrics."""
        try:
            uptime = int(time.time() - psutil.boot_time())
            processes = len(psutil.pids())
            
            # Get motherboard temperature if using LibreHardwareMonitor
            motherboard_temp = 0.0
            if self.use_libre_hardware and self.computer:
                motherboard_temp = self._get_motherboard_temperature()
            
            return SystemMetrics(
                uptime=uptime,
                processes=processes,
                temperature=motherboard_temp,
                bootTime=int(psutil.boot_time())
            )
        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            return SystemMetrics(
                uptime=0,
                processes=0,
                temperature=0.0
            )
        
    def _get_cpu_temperature_psutil(self) -> float:
        """Get CPU temperature using psutil (if available)."""
        try:
            if hasattr(psutil, 'sensors_temperatures'):
                temps = psutil.sensors_temperatures()
                if temps:
                    # Try to find CPU temperature
                    for name, entries in temps.items():
                        if 'cpu' in name.lower() or 'core' in name.lower():
                            return entries[0].current if entries else 0.0
        except Exception:
            pass
        return 0.0
        
    def _get_motherboard_temperature(self) -> float:
        """Get motherboard temperature."""
        if not self.use_libre_hardware or not self.computer:
            return 0.0
            
        try:
            for hardware in self.computer.Hardware:
                if hardware.HardwareType.ToString() == "Motherboard":
                    hardware.Update()
                    for sensor in hardware.Sensors:
                        if sensor.SensorType.ToString() == "Temperature":
                            return float(sensor.Value) if sensor.Value else 0.0
        except Exception:
            pass
        return 0.0
        
    def _extract_core_id(self, sensor_name: str) -> Optional[int]:
        """Extract core ID from sensor name."""
        try:
            # Look for patterns like "CPU Core #1" or "Core #1"
            match = re.search(r'#(\d+)', sensor_name)
            if match:
                return int(match.group(1)) - 1  # Convert to 0-based index
        except Exception:
            pass
        return None
        
    async def get_status(self) -> HardwareStatus:
        """Get hardware monitoring system status."""
        available_sensors = []
        
        if self.is_initialized:
            available_sensors = ['cpu', 'memory', 'storage', 'network']
            if self.use_libre_hardware:
                available_sensors.extend(['gpu', 'motherboard'])
            
        return HardwareStatus(
            isInitialized=self.is_initialized,
            useLibreHardware=self.use_libre_hardware,
            adminPrivileges=self._check_admin_privileges(),
            availableSensors=available_sensors,
            lastUpdate=self.last_update_time,
            errorCount=self.error_count,
            pollingInterval=int(self.update_interval * 1000)
        )
        
    def _check_admin_privileges(self) -> bool:
        """Check if running with administrator privileges."""
        if not self.is_windows:
            return os.getuid() == 0 if hasattr(os, 'getuid') else False
        
        try:
            import ctypes
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        except Exception:
            return False
            
    async def check_alerts(self, metrics: HardwareMetrics) -> List[HardwareAlert]:
        """Check for alert conditions in the metrics."""
        alerts = []
        timestamp = int(time.time() * 1000)
        
        # CPU temperature alert
        if metrics.cpu.temperature > self.alert_thresholds['cpu_temp_warning']:
            severity = 'critical' if metrics.cpu.temperature > self.alert_thresholds['cpu_temp_critical'] else 'warning'
            alerts.append(HardwareAlert(
                type='cpu_temperature',
                severity=severity,
                message=f'CPU temperature is {metrics.cpu.temperature:.1f}°C',
                value=metrics.cpu.temperature,
                threshold=self.alert_thresholds['cpu_temp_warning'],
                timestamp=timestamp,
                sensor='CPU Package'
            ))
            
        # CPU usage alert
        if metrics.cpu.usage > self.alert_thresholds['cpu_usage_warning']:
            alerts.append(HardwareAlert(
                type='cpu_usage',
                severity='warning',
                message=f'CPU usage is {metrics.cpu.usage:.1f}%',
                value=metrics.cpu.usage,
                threshold=self.alert_thresholds['cpu_usage_warning'],
                timestamp=timestamp,
                sensor='CPU'
            ))
            
        # GPU temperature alert
        if metrics.gpu.temperature > self.alert_thresholds['gpu_temp_warning']:
            severity = 'critical' if metrics.gpu.temperature > self.alert_thresholds['gpu_temp_critical'] else 'warning'
            alerts.append(HardwareAlert(
                type='gpu_temperature',
                severity=severity,
                message=f'GPU temperature is {metrics.gpu.temperature:.1f}°C',
                value=metrics.gpu.temperature,
                threshold=self.alert_thresholds['gpu_temp_warning'],
                timestamp=timestamp,
                sensor='GPU'
            ))
            
        # Memory usage alert
        if metrics.memory.usage > self.alert_thresholds['memory_usage_warning']:
            severity = 'critical' if metrics.memory.usage > self.alert_thresholds['memory_usage_critical'] else 'warning'
            alerts.append(HardwareAlert(
                type='memory_usage',
                severity=severity,
                message=f'Memory usage is {metrics.memory.usage:.1f}%',
                value=metrics.memory.usage,
                threshold=self.alert_thresholds['memory_usage_warning'],
                timestamp=timestamp,
                sensor='Memory'
            ))
            
        # Storage usage alerts
        for i, storage in enumerate(metrics.storage):
            if storage.usage > self.alert_thresholds['storage_usage_warning']:
                alerts.append(HardwareAlert(
                    type='storage_usage',
                    severity='warning',
                    message=f'Storage {storage.name or f"Device {i}"} usage is {storage.usage:.1f}%',
                    value=storage.usage,
                    threshold=self.alert_thresholds['storage_usage_warning'],
                    timestamp=timestamp,
                    sensor=storage.name or f'Storage Device {i}'
                ))
            
        return alerts
        
    def set_alert_threshold(self, alert_type: str, value: float) -> None:
        """Set alert threshold for a specific metric."""
        if alert_type in self.alert_thresholds:
            self.alert_thresholds[alert_type] = value
            logger.info(f"Alert threshold for {alert_type} set to {value}")
        else:
            logger.warning(f"Unknown alert type: {alert_type}")
            
    async def cleanup(self) -> None:
        """Clean up resources."""
        try:
            if self.computer:
                self.computer.Close()
                self.computer = None
            self.is_initialized = False
            logger.info("Hardware monitor cleaned up successfully")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")