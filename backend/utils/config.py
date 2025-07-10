"""
Configuration management for SenseCanvas backend
Environment-based configuration with sensible defaults
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Server configuration
    host: str = Field("localhost", description="Server host")
    port: int = Field(8000, description="Server port")
    debug: bool = Field(False, description="Debug mode")
    
    # CORS configuration
    allowed_origins: List[str] = Field(
        ["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins"
    )
    
    # Sensor monitoring configuration
    update_interval: float = Field(1.0, description="Sensor update interval in seconds")
    max_update_age: float = Field(10.0, description="Maximum age for sensor data before considered stale")
    enable_hardware_monitor: bool = Field(True, description="Enable PyHardwareMonitor")
    enable_psutil_fallback: bool = Field(True, description="Enable psutil fallback")
    
    # Data configuration
    max_sensor_history: int = Field(1000, description="Maximum sensor history entries")
    temperature_unit: str = Field("celsius", description="Temperature unit")
    round_precision: int = Field(2, description="Decimal places for sensor values")
    
    # Logging configuration
    log_level: str = Field("INFO", description="Logging level")
    log_to_file: bool = Field(False, description="Enable file logging")
    log_file_path: Optional[str] = Field(None, description="Log file path")
    
    # Security configuration
    admin_required_warning: bool = Field(True, description="Show admin privileges warning")
    
    # Performance configuration
    websocket_ping_interval: float = Field(30.0, description="WebSocket ping interval")
    max_concurrent_connections: int = Field(50, description="Maximum WebSocket connections")
    
    # Hardware monitor specific settings
    hardware_monitor_timeout: float = Field(5.0, description="Hardware monitor timeout")
    retry_initialization: bool = Field(True, description="Retry service initialization on failure")
    max_init_retries: int = Field(3, description="Maximum initialization retries")
    
    class Config:
        env_prefix = "SENSECANVAS_"
        env_file = ".env"
        case_sensitive = False
    
    @validator('update_interval')
    def validate_update_interval(cls, v):
        """Ensure update interval is reasonable"""
        if v < 0.1:
            return 0.1
        if v > 60:
            return 60
        return v
    
    @validator('port')
    def validate_port(cls, v):
        """Ensure port is valid"""
        if v < 1 or v > 65535:
            raise ValueError("Port must be between 1 and 65535")
        return v
    
    @validator('temperature_unit')
    def validate_temperature_unit(cls, v):
        """Ensure temperature unit is valid"""
        if v.lower() not in ['celsius', 'fahrenheit', 'kelvin']:
            return 'celsius'
        return v.lower()
    
    @validator('log_level')
    def validate_log_level(cls, v):
        """Ensure log level is valid"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            return 'INFO'
        return v.upper()
    
    @validator('round_precision')
    def validate_round_precision(cls, v):
        """Ensure round precision is reasonable"""
        if v < 0:
            return 0
        if v > 10:
            return 10
        return v


class DevelopmentSettings(Settings):
    """Development environment settings"""
    debug: bool = True
    log_level: str = "DEBUG"
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]


class ProductionSettings(Settings):
    """Production environment settings"""
    debug: bool = False
    log_level: str = "INFO"
    log_to_file: bool = True
    log_file_path: str = "logs/sensecanvas.log"


@lru_cache()
def get_settings() -> Settings:
    """Get application settings (cached)"""
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        return ProductionSettings()
    elif environment == "development":
        return DevelopmentSettings()
    else:
        return Settings()


def get_cors_origins() -> List[str]:
    """Get CORS origins from environment or default"""
    origins_env = os.getenv("SENSECANVAS_ALLOWED_ORIGINS")
    if origins_env:
        return [origin.strip() for origin in origins_env.split(",")]
    
    return get_settings().allowed_origins


def is_admin_required() -> bool:
    """Check if admin privileges are required for full functionality"""
    import platform
    import ctypes
    
    if platform.system().lower() != "windows":
        return False
    
    try:
        return not ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return True  # Assume admin required if we can't check


def get_log_config() -> dict:
    """Get logging configuration"""
    settings = get_settings()
    
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.log_level,
                "formatter": "default",
                "stream": "ext://sys.stdout"
            }
        },
        "loggers": {
            "": {  # root logger
                "level": settings.log_level,
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            }
        }
    }
    
    # Add file handler if enabled
    if settings.log_to_file and settings.log_file_path:
        # Ensure log directory exists
        log_dir = os.path.dirname(settings.log_file_path)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        
        config["handlers"]["file"] = {
            "class": "logging.handlers.RotatingFileHandler",
            "level": settings.log_level,
            "formatter": "detailed",
            "filename": settings.log_file_path,
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5
        }
        
        # Add file handler to all loggers
        for logger_config in config["loggers"].values():
            if "file" not in logger_config["handlers"]:
                logger_config["handlers"].append("file")
    
    return config