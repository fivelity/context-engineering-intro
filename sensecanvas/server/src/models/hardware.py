"""
SenseCanvas Hardware Metric Models
Pydantic models for hardware monitoring data validation and serialization
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union
from datetime import datetime


class CpuCore(BaseModel):
    """Individual CPU core metrics"""
    id: int = Field(..., ge=0, description="Core ID")
    usage: float = Field(..., ge=0, le=100, description="Core usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="Core temperature in Celsius")
    frequency: float = Field(..., ge=0, description="Core frequency in MHz")


class CpuMetrics(BaseModel):
    """CPU metrics model"""
    usage: float = Field(..., ge=0, le=100, description="Overall CPU usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="CPU temperature in Celsius")
    cores: List[CpuCore] = Field(..., description="Per-core metrics")
    frequency: float = Field(..., ge=0, description="Current CPU frequency in MHz")
    power: float = Field(..., ge=0, description="CPU power consumption in watts")
    load_average: List[float] = Field(default_factory=list, description="1, 5, 15 minute load averages")
    processes: int = Field(0, ge=0, description="Number of processes")
    threads: int = Field(0, ge=0, description="Number of threads")


class GpuMemory(BaseModel):
    """GPU memory metrics"""
    used: int = Field(..., ge=0, description="Used memory in MB")
    total: int = Field(..., ge=0, description="Total memory in MB")
    free: int = Field(..., ge=0, description="Free memory in MB")
    usage: float = Field(..., ge=0, le=100, description="Memory usage percentage")


class GpuFrequency(BaseModel):
    """GPU frequency metrics"""
    core: float = Field(..., ge=0, description="Core clock frequency in MHz")
    memory: float = Field(..., ge=0, description="Memory clock frequency in MHz")


class GpuMetrics(BaseModel):
    """GPU metrics model"""
    usage: float = Field(..., ge=0, le=100, description="GPU usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="GPU temperature in Celsius")
    memory: GpuMemory = Field(..., description="GPU memory statistics")
    frequency: GpuFrequency = Field(..., description="GPU clock frequencies")
    power: float = Field(..., ge=0, description="GPU power consumption in watts")
    fan_speed: float = Field(..., ge=0, description="GPU fan speed in RPM")
    name: str = Field("", description="GPU model name")
    driver_version: str = Field("", description="GPU driver version")


class MemoryMetrics(BaseModel):
    """System memory metrics"""
    usage: float = Field(..., ge=0, le=100, description="Memory usage percentage")
    used: int = Field(..., ge=0, description="Used memory in MB")
    total: int = Field(..., ge=0, description="Total memory in MB")
    available: int = Field(..., ge=0, description="Available memory in MB")
    free: int = Field(..., ge=0, description="Free memory in MB")
    cached: int = Field(0, ge=0, description="Cached memory in MB")
    swap_used: int = Field(0, ge=0, description="Swap used in MB")
    swap_total: int = Field(0, ge=0, description="Total swap in MB")


class StorageDevice(BaseModel):
    """Individual storage device metrics"""
    name: str = Field(..., description="Device name or path")
    usage: float = Field(..., ge=0, le=100, description="Storage usage percentage")
    used: float = Field(..., ge=0, description="Used space in GB")
    total: float = Field(..., ge=0, description="Total space in GB")
    free: float = Field(..., ge=0, description="Free space in GB")
    temperature: Optional[float] = Field(None, ge=0, le=100, description="Drive temperature in Celsius")
    health: str = Field("unknown", description="Drive health status")
    type: str = Field("unknown", description="Drive type (SSD/HDD)")
    read_speed: Optional[float] = Field(None, ge=0, description="Read speed in MB/s")
    write_speed: Optional[float] = Field(None, ge=0, description="Write speed in MB/s")


class NetworkMetrics(BaseModel):
    """Network interface metrics"""
    bytes_sent: int = Field(..., ge=0, description="Total bytes sent")
    bytes_received: int = Field(..., ge=0, description="Total bytes received")
    packets_sent: int = Field(..., ge=0, description="Total packets sent")
    packets_received: int = Field(..., ge=0, description="Total packets received")
    errors_in: int = Field(0, ge=0, description="Input errors")
    errors_out: int = Field(0, ge=0, description="Output errors")
    drop_in: int = Field(0, ge=0, description="Dropped incoming packets")
    drop_out: int = Field(0, ge=0, description="Dropped outgoing packets")
    speed: Optional[float] = Field(None, ge=0, description="Interface speed in Mbps")
    interface_name: str = Field("", description="Network interface name")


class SystemMetrics(BaseModel):
    """System-wide metrics"""
    uptime: int = Field(..., ge=0, description="System uptime in seconds")
    boot_time: float = Field(..., description="System boot timestamp")
    processes: int = Field(..., ge=0, description="Total number of processes")
    threads: int = Field(..., ge=0, description="Total number of threads")
    temperature: Optional[float] = Field(None, ge=0, le=150, description="System/motherboard temperature")
    os_name: str = Field("", description="Operating system name")
    os_version: str = Field("", description="Operating system version")
    hostname: str = Field("", description="System hostname")


class HardwareMetrics(BaseModel):
    """Complete hardware metrics snapshot"""
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    cpu: CpuMetrics = Field(..., description="CPU metrics")
    gpu: Optional[GpuMetrics] = Field(None, description="GPU metrics if available")
    memory: MemoryMetrics = Field(..., description="Memory metrics")
    storage: List[StorageDevice] = Field(default_factory=list, description="Storage device metrics")
    network: NetworkMetrics = Field(..., description="Network metrics")
    system: SystemMetrics = Field(..., description="System-wide metrics")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class HardwareAlert(BaseModel):
    """Hardware alert model"""
    id: str = Field(..., description="Unique alert ID")
    sensor_type: str = Field(..., description="Type of sensor (cpu, gpu, memory, etc)")
    sensor_name: str = Field(..., description="Sensor display name")
    threshold: float = Field(..., description="Threshold value that was exceeded")
    current_value: float = Field(..., description="Current sensor value")
    severity: str = Field(..., pattern="^(warning|critical)$", description="Alert severity")
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    message: str = Field(..., description="Human-readable alert message")
    
    
class HardwareStatus(BaseModel):
    """Hardware monitoring system status"""
    is_monitoring: bool = Field(..., description="Whether monitoring is active")
    is_initialized: bool = Field(..., description="Whether monitor is initialized")
    use_libre_hardware: bool = Field(..., description="Using LibreHardwareMonitor (Windows)")
    polling_interval: int = Field(..., description="Polling interval in milliseconds")
    last_update: Optional[int] = Field(None, description="Last update timestamp")
    available_sensors: List[str] = Field(default_factory=list, description="Available sensor types")
    error: Optional[str] = Field(None, description="Current error message if any")


class SensorConfig(BaseModel):
    """Sensor configuration model"""
    sensor_type: str = Field(..., description="Type of sensor")
    enabled: bool = Field(True, description="Whether sensor is enabled")
    polling_rate: int = Field(1000, ge=100, le=60000, description="Polling rate in milliseconds")
    alert_enabled: bool = Field(False, description="Whether alerts are enabled")
    warning_threshold: Optional[float] = Field(None, description="Warning threshold value")
    critical_threshold: Optional[float] = Field(None, description="Critical threshold value")