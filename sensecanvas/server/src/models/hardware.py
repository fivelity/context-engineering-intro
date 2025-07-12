"""
SenseCanvas Hardware Metrics Models
Pydantic models for hardware monitoring data validation and serialization.
"""

from datetime import datetime
from typing import Dict, List, Optional, Union

from pydantic import BaseModel, Field, validator


class CoreMetric(BaseModel):
    """Individual CPU core metrics."""
    
    id: int = Field(..., ge=0, description="Core ID")
    usage: float = Field(..., ge=0, le=100, description="Core usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="Core temperature in Celsius")


class CpuMetrics(BaseModel):
    """CPU monitoring metrics."""
    
    usage: float = Field(..., ge=0, le=100, description="Overall CPU usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="CPU package temperature in Celsius")
    cores: List[CoreMetric] = Field(..., description="Per-core metrics")
    frequency: float = Field(..., ge=0, description="CPU frequency in MHz")
    power: float = Field(..., ge=0, description="CPU power consumption in watts")
    
    @validator('cores')
    def validate_cores(cls, cores):
        if not cores:
            raise ValueError("At least one core metric is required")
        return cores


class GpuMemory(BaseModel):
    """GPU memory metrics."""
    
    used: int = Field(..., ge=0, description="Used memory in MB")
    total: int = Field(..., ge=0, description="Total memory in MB")
    usage: float = Field(..., ge=0, le=100, description="Memory usage percentage")
    
    @validator('usage')
    def validate_usage(cls, usage, values):
        if 'used' in values and 'total' in values and values['total'] > 0:
            calculated_usage = (values['used'] / values['total']) * 100
            if abs(usage - calculated_usage) > 1.0:  # Allow 1% tolerance
                raise ValueError("Usage percentage doesn't match used/total ratio")
        return usage


class GpuFrequency(BaseModel):
    """GPU frequency metrics."""
    
    core: float = Field(..., ge=0, description="GPU core frequency in MHz")
    memory: float = Field(..., ge=0, description="GPU memory frequency in MHz")


class GpuMetrics(BaseModel):
    """GPU monitoring metrics."""
    
    usage: float = Field(..., ge=0, le=100, description="GPU usage percentage")
    temperature: float = Field(..., ge=0, le=150, description="GPU temperature in Celsius")
    memory: GpuMemory = Field(..., description="GPU memory statistics")
    frequency: GpuFrequency = Field(..., description="GPU frequencies")
    power: float = Field(..., ge=0, description="GPU power consumption in watts")
    fanSpeed: float = Field(..., ge=0, le=100, description="GPU fan speed percentage")


class MemoryMetrics(BaseModel):
    """System memory metrics."""
    
    usage: float = Field(..., ge=0, le=100, description="Memory usage percentage")
    used: int = Field(..., ge=0, description="Used memory in MB")
    total: int = Field(..., ge=0, description="Total memory in MB")
    available: int = Field(..., ge=0, description="Available memory in MB")
    speed: float = Field(..., ge=0, description="Memory speed in MHz")
    
    @validator('available')
    def validate_available(cls, available, values):
        if 'total' in values and available > values['total']:
            raise ValueError("Available memory cannot exceed total memory")
        return available


class StorageMetrics(BaseModel):
    """Storage device metrics."""
    
    usage: float = Field(..., ge=0, le=100, description="Storage usage percentage")
    used: int = Field(..., ge=0, description="Used storage in GB")
    total: int = Field(..., ge=0, description="Total storage in GB")
    temperature: float = Field(..., ge=0, le=100, description="Storage temperature in Celsius")
    health: str = Field(..., description="Storage health status")
    name: Optional[str] = Field(None, description="Storage device name")
    type: Optional[str] = Field(None, description="Storage type (SSD, HDD, etc.)")


class NetworkMetrics(BaseModel):
    """Network interface metrics."""
    
    bytesReceived: int = Field(..., ge=0, description="Total bytes received")
    bytesSent: int = Field(..., ge=0, description="Total bytes sent")
    packetsReceived: int = Field(..., ge=0, description="Total packets received")
    packetsSent: int = Field(..., ge=0, description="Total packets sent")
    speed: float = Field(..., ge=0, description="Current network speed in Mbps")
    interface: Optional[str] = Field(None, description="Network interface name")


class SystemMetrics(BaseModel):
    """System-wide metrics."""
    
    uptime: int = Field(..., ge=0, description="System uptime in seconds")
    processes: int = Field(..., ge=0, description="Number of running processes")
    temperature: float = Field(..., ge=0, le=100, description="System/motherboard temperature")
    bootTime: Optional[int] = Field(None, description="System boot time as Unix timestamp")


class HardwareMetrics(BaseModel):
    """Complete hardware metrics snapshot."""
    
    timestamp: int = Field(..., description="Unix timestamp in milliseconds")
    cpu: CpuMetrics = Field(..., description="CPU metrics")
    gpu: GpuMetrics = Field(..., description="GPU metrics") 
    memory: MemoryMetrics = Field(..., description="Memory metrics")
    storage: List[StorageMetrics] = Field(..., description="Storage device metrics")
    network: NetworkMetrics = Field(..., description="Network metrics")
    system: SystemMetrics = Field(..., description="System metrics")
    
    @validator('timestamp')
    def validate_timestamp(cls, timestamp):
        # Ensure timestamp is reasonable (not too far in past/future)
        now = int(datetime.now().timestamp() * 1000)
        if abs(timestamp - now) > 60000:  # 60 seconds tolerance
            raise ValueError("Timestamp is too far from current time")
        return timestamp
    
    @validator('storage')
    def validate_storage(cls, storage):
        if not storage:
            raise ValueError("At least one storage device is required")
        return storage
    
    class Config:
        """Pydantic configuration."""
        
        json_encoders = {
            datetime: lambda v: int(v.timestamp() * 1000)
        }
        
        schema_extra = {
            "example": {
                "timestamp": 1640995200000,
                "cpu": {
                    "usage": 45.2,
                    "temperature": 65.0,
                    "cores": [
                        {"id": 0, "usage": 50.0, "temperature": 67.0},
                        {"id": 1, "usage": 40.0, "temperature": 63.0}
                    ],
                    "frequency": 3200.0,
                    "power": 25.5
                },
                "gpu": {
                    "usage": 85.0,
                    "temperature": 72.0,
                    "memory": {
                        "used": 6144,
                        "total": 8192,
                        "usage": 75.0
                    },
                    "frequency": {
                        "core": 1800.0,
                        "memory": 7000.0
                    },
                    "power": 180.0,
                    "fanSpeed": 65.0
                },
                "memory": {
                    "usage": 68.0,
                    "used": 10987,
                    "total": 16384,
                    "available": 5397,
                    "speed": 3200.0
                },
                "storage": [
                    {
                        "usage": 78.0,
                        "used": 390,
                        "total": 500,
                        "temperature": 42.0,
                        "health": "good",
                        "name": "Samsung SSD 980",
                        "type": "NVMe SSD"
                    }
                ],
                "network": {
                    "bytesReceived": 1073741824,
                    "bytesSent": 536870912,
                    "packetsReceived": 1048576,
                    "packetsSent": 524288,
                    "speed": 125.5,
                    "interface": "Ethernet"
                },
                "system": {
                    "uptime": 86400,
                    "processes": 245,
                    "temperature": 38.0,
                    "bootTime": 1640908800
                }
            }
        }


class HardwareAlert(BaseModel):
    """Hardware alert/warning information."""
    
    type: str = Field(..., description="Alert type (e.g., 'cpu_temperature', 'memory_usage')")
    severity: str = Field(..., regex="^(info|warning|critical)$", description="Alert severity level")
    message: str = Field(..., min_length=1, description="Human-readable alert message")
    value: Union[float, int] = Field(..., description="Current metric value")
    threshold: Union[float, int] = Field(..., description="Threshold that triggered the alert")
    timestamp: int = Field(..., description="Alert timestamp in milliseconds")
    sensor: str = Field(..., description="Source sensor/component")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "type": "cpu_temperature",
                "severity": "warning",
                "message": "CPU temperature is 82.5°C",
                "value": 82.5,
                "threshold": 80.0,
                "timestamp": 1640995200000,
                "sensor": "CPU Package"
            }
        }


class HardwareStatus(BaseModel):
    """Hardware monitoring system status."""
    
    isInitialized: bool = Field(..., description="Whether hardware monitoring is initialized")
    useLibreHardware: bool = Field(..., description="Whether LibreHardwareMonitor is being used")
    adminPrivileges: bool = Field(..., description="Whether running with admin privileges")
    availableSensors: List[str] = Field(..., description="List of available sensor types")
    lastUpdate: int = Field(..., description="Last successful update timestamp")
    errorCount: int = Field(..., ge=0, description="Number of recent errors")
    pollingInterval: int = Field(..., ge=100, description="Polling interval in milliseconds")
    
    class Config:
        """Pydantic configuration."""
        
        schema_extra = {
            "example": {
                "isInitialized": True,
                "useLibreHardware": True,
                "adminPrivileges": True,
                "availableSensors": ["cpu", "gpu", "memory", "storage", "network"],
                "lastUpdate": 1640995200000,
                "errorCount": 0,
                "pollingInterval": 1000
            }
        }