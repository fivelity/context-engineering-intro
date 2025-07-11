"""
Sensor data models for SenseCanvas backend
Pydantic models for type-safe sensor data handling and API responses
"""

from datetime import datetime
from typing import Dict, List, Optional, Union, Any
from enum import Enum

from pydantic import BaseModel, Field, validator


class SensorType(str, Enum):
    """Sensor types following LibreHardwareMonitor classification"""
    TEMPERATURE = "temperature"
    LOAD = "load"
    FAN = "fan"
    VOLTAGE = "voltage"
    CLOCK = "clock"
    POWER = "power"
    DATA = "data"
    FACTOR = "factor"
    FLOW = "flow"
    CONTROL = "control"
    LEVEL = "level"
    THROUGHPUT = "throughput"


class SensorReading(BaseModel):
    """Individual sensor reading with metadata"""
    name: str = Field(..., description="Human-readable sensor name")
    value: float = Field(..., description="Current sensor value")
    unit: str = Field(..., description="Unit of measurement (°C, %, RPM, etc.)")
    sensor_type: SensorType = Field(..., description="Type of sensor")
    min_value: Optional[float] = Field(None, description="Minimum recorded value")
    max_value: Optional[float] = Field(None, description="Maximum recorded value")
    path: str = Field(..., description="Hierarchical sensor path")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Reading timestamp")
    
    @validator('value', 'min_value', 'max_value')
    def validate_numeric_values(cls, v):
        """Ensure numeric values are valid"""
        if v is not None and (not isinstance(v, (int, float)) or not (-1000000 <= v <= 1000000)):
            raise ValueError("Sensor value must be a reasonable number")
        return v


class CPUData(BaseModel):
    """CPU sensor data collection"""
    temperature: Dict[str, float] = Field(default_factory=dict, description="CPU core temperatures")
    load: Dict[str, float] = Field(default_factory=dict, description="CPU core loads")
    clock: Dict[str, float] = Field(default_factory=dict, description="CPU core clocks")
    voltage: Dict[str, float] = Field(default_factory=dict, description="CPU core voltages")
    power: Dict[str, float] = Field(default_factory=dict, description="CPU power consumption")
    
    # Aggregate values
    total_load: Optional[float] = Field(None, description="Total CPU load percentage")
    average_temperature: Optional[float] = Field(None, description="Average CPU temperature")
    max_temperature: Optional[float] = Field(None, description="Maximum CPU temperature")
    base_clock: Optional[float] = Field(None, description="Base CPU clock frequency")
    boost_clock: Optional[float] = Field(None, description="Current boost clock frequency")


class GPUData(BaseModel):
    """GPU sensor data collection"""
    temperature: Dict[str, float] = Field(default_factory=dict, description="GPU temperatures")
    load: Dict[str, float] = Field(default_factory=dict, description="GPU loads")
    clock: Dict[str, float] = Field(default_factory=dict, description="GPU clocks")
    voltage: Dict[str, float] = Field(default_factory=dict, description="GPU voltages")
    power: Dict[str, float] = Field(default_factory=dict, description="GPU power consumption")
    fan: Dict[str, float] = Field(default_factory=dict, description="GPU fan speeds")
    memory: Dict[str, float] = Field(default_factory=dict, description="GPU memory usage")
    
    # Aggregate values
    total_load: Optional[float] = Field(None, description="Total GPU load percentage")
    core_temperature: Optional[float] = Field(None, description="GPU core temperature")
    memory_used: Optional[float] = Field(None, description="GPU memory used (MB)")
    memory_total: Optional[float] = Field(None, description="GPU memory total (MB)")
    core_clock: Optional[float] = Field(None, description="GPU core clock frequency")
    memory_clock: Optional[float] = Field(None, description="GPU memory clock frequency")


class MemoryData(BaseModel):
    """System memory data"""
    used: Optional[float] = Field(None, description="Used memory (MB)")
    available: Optional[float] = Field(None, description="Available memory (MB)")
    total: Optional[float] = Field(None, description="Total memory (MB)")
    load: Optional[float] = Field(None, description="Memory usage percentage")
    
    # Detailed breakdowns
    virtual: Dict[str, float] = Field(default_factory=dict, description="Virtual memory stats")
    swap: Dict[str, float] = Field(default_factory=dict, description="Swap memory stats")


class StorageData(BaseModel):
    """Storage device data"""
    temperature: Dict[str, float] = Field(default_factory=dict, description="Storage temperatures")
    load: Dict[str, float] = Field(default_factory=dict, description="Storage activity")
    usage: Dict[str, Dict[str, float]] = Field(default_factory=dict, description="Disk usage per drive")
    throughput: Dict[str, float] = Field(default_factory=dict, description="Read/write throughput")


class NetworkData(BaseModel):
    """Network interface data"""
    throughput: Dict[str, float] = Field(default_factory=dict, description="Network throughput")
    bytes_sent: Optional[float] = Field(None, description="Total bytes sent")
    bytes_received: Optional[float] = Field(None, description="Total bytes received")
    packets_sent: Optional[float] = Field(None, description="Total packets sent")
    packets_received: Optional[float] = Field(None, description="Total packets received")


class FanData(BaseModel):
    """Fan sensor data"""
    cpu_fans: Dict[str, float] = Field(default_factory=dict, description="CPU fan speeds")
    case_fans: Dict[str, float] = Field(default_factory=dict, description="Case fan speeds")
    gpu_fans: Dict[str, float] = Field(default_factory=dict, description="GPU fan speeds")
    other_fans: Dict[str, float] = Field(default_factory=dict, description="Other fan speeds")


class PowerData(BaseModel):
    """Power consumption data"""
    cpu_power: Optional[float] = Field(None, description="CPU power consumption (W)")
    gpu_power: Optional[float] = Field(None, description="GPU power consumption (W)")
    total_power: Optional[float] = Field(None, description="Total system power (W)")
    ups_data: Dict[str, float] = Field(default_factory=dict, description="UPS data if available")


class SensorData(BaseModel):
    """Complete sensor data collection"""
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Data collection timestamp")
    
    # Component data
    cpu: Optional[CPUData] = Field(None, description="CPU sensor data")
    gpu: Optional[GPUData] = Field(None, description="GPU sensor data")
    memory: Optional[MemoryData] = Field(None, description="Memory data")
    storage: Optional[StorageData] = Field(None, description="Storage data")
    network: Optional[NetworkData] = Field(None, description="Network data")
    fans: Optional[FanData] = Field(None, description="Fan data")
    power: Optional[PowerData] = Field(None, description="Power data")
    
    # Raw sensor readings for detailed access
    raw_sensors: Dict[str, SensorReading] = Field(default_factory=dict, description="All raw sensor readings")
    
    # Metadata
    source: str = Field(..., description="Data source (hardware_monitor, psutil)")
    collection_time_ms: Optional[float] = Field(None, description="Time taken to collect data (ms)")
    sensor_count: Optional[int] = Field(None, description="Total number of sensors")
    
    @validator('timestamp')
    def validate_timestamp(cls, v):
        """Ensure timestamp is reasonable"""
        now = datetime.utcnow()
        if v > now or (now - v).total_seconds() > 3600:  # Not more than 1 hour old
            return now
        return v


class SystemInfo(BaseModel):
    """System information and monitoring capabilities"""
    platform: str = Field(..., description="Operating system platform")
    platform_version: str = Field(..., description="OS version")
    architecture: str = Field(..., description="System architecture")
    processor: str = Field(..., description="Processor information")
    python_version: str = Field(..., description="Python version")
    monitoring_service: str = Field(..., description="Active monitoring service")
    
    # Monitoring capabilities
    capabilities: Dict[str, Any] = Field(default_factory=dict, description="Monitoring capabilities")
    
    # Hardware information
    cpu_info: Optional[Dict[str, Any]] = Field(None, description="Detailed CPU information")
    gpu_info: Optional[List[Dict[str, Any]]] = Field(None, description="GPU information")
    memory_info: Optional[Dict[str, Any]] = Field(None, description="Memory configuration")
    
    # Service status
    last_update: Optional[str] = Field(None, description="Last sensor update timestamp")
    admin_privileges: Optional[bool] = Field(None, description="Whether running with admin privileges")


class HealthStatus(BaseModel):
    """Service health status"""
    status: str = Field(..., description="Overall health status")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    services: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Individual service status")
    metrics: Dict[str, float] = Field(default_factory=dict, description="Performance metrics")
    errors: List[str] = Field(default_factory=list, description="Recent errors")


class SensorConfig(BaseModel):
    """Sensor monitoring configuration"""
    update_interval: float = Field(1.0, description="Update interval in seconds")
    max_history: int = Field(1000, description="Maximum history entries per sensor")
    enable_logging: bool = Field(True, description="Enable sensor data logging")
    log_level: str = Field("INFO", description="Logging level")
    
    # Service preferences
    prefer_hardware_monitor: bool = Field(True, description="Prefer PyHardwareMonitor over psutil")
    fallback_to_psutil: bool = Field(True, description="Use psutil if PyHardwareMonitor fails")
    
    # Data filtering
    temperature_unit: str = Field("celsius", description="Temperature unit (celsius/fahrenheit)")
    round_values: int = Field(2, description="Number of decimal places for rounding")
    
    @validator('update_interval')
    def validate_update_interval(cls, v):
        """Ensure update interval is reasonable"""
        if v < 0.1 or v > 60:
            raise ValueError("Update interval must be between 0.1 and 60 seconds")
        return v