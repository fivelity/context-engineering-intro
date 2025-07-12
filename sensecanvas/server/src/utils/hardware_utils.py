"""
SenseCanvas Hardware Utility Functions
Helper functions for hardware data processing and conversion
"""

import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import platform
import psutil

logger = logging.getLogger(__name__)


def bytes_to_mb(bytes_value: int) -> int:
    """Convert bytes to megabytes."""
    return int(bytes_value / (1024 * 1024))


def bytes_to_gb(bytes_value: int) -> float:
    """Convert bytes to gigabytes."""
    return round(bytes_value / (1024 * 1024 * 1024), 2)


def hz_to_mhz(hz_value: int) -> float:
    """Convert Hz to MHz."""
    return round(hz_value / 1_000_000, 2)


def celsius_to_fahrenheit(celsius: float) -> float:
    """Convert Celsius to Fahrenheit."""
    return round((celsius * 9/5) + 32, 1)


def get_percentage(used: float, total: float) -> float:
    """Calculate percentage with safe division."""
    if total <= 0:
        return 0.0
    return round((used / total) * 100, 2)


def format_uptime(seconds: int) -> str:
    """Format uptime in seconds to human-readable string."""
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60
    
    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    
    return " ".join(parts) if parts else "0m"


def get_system_info() -> Dict[str, str]:
    """Get system information."""
    try:
        return {
            "platform": platform.system(),
            "platform_release": platform.release(),
            "platform_version": platform.version(),
            "architecture": platform.machine(),
            "hostname": platform.node(),
            "processor": platform.processor(),
            "python_version": platform.python_version()
        }
    except Exception as e:
        logger.error(f"Error getting system info: {e}")
        return {}


def check_admin_privileges() -> bool:
    """Check if the process has admin/root privileges."""
    try:
        if platform.system() == "Windows":
            import ctypes
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        else:
            # Unix/Linux
            import os
            return os.geteuid() == 0
    except Exception as e:
        logger.error(f"Error checking admin privileges: {e}")
        return False


def get_network_interface_speed(interface_name: str) -> Optional[float]:
    """Get network interface speed in Mbps."""
    try:
        stats = psutil.net_if_stats()
        if interface_name in stats:
            # Speed is in Mbps
            return float(stats[interface_name].speed)
        return None
    except Exception as e:
        logger.error(f"Error getting network interface speed: {e}")
        return None


def calculate_network_speed(
    bytes_sent_before: int,
    bytes_sent_after: int,
    bytes_recv_before: int,
    bytes_recv_after: int,
    time_delta: float
) -> Tuple[float, float]:
    """Calculate network upload and download speeds in MB/s."""
    if time_delta <= 0:
        return 0.0, 0.0
    
    upload_speed = (bytes_sent_after - bytes_sent_before) / time_delta / (1024 * 1024)
    download_speed = (bytes_recv_after - bytes_recv_before) / time_delta / (1024 * 1024)
    
    return round(upload_speed, 2), round(download_speed, 2)


def get_storage_type(device_name: str) -> str:
    """Determine storage device type (SSD/HDD)."""
    # Simple heuristic based on common patterns
    device_lower = device_name.lower()
    
    if any(ssd_indicator in device_lower for ssd_indicator in ['ssd', 'nvme', 'solid']):
        return "SSD"
    elif any(hdd_indicator in device_lower for hdd_indicator in ['hdd', 'disk', 'sata']):
        return "HDD"
    
    # Additional check based on rotational property if available
    try:
        import subprocess
        if platform.system() == "Linux":
            # Check if device is rotational (1 = HDD, 0 = SSD)
            result = subprocess.run(
                ['cat', f'/sys/block/{device_name}/queue/rotational'],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return "HDD" if result.stdout.strip() == "1" else "SSD"
    except:
        pass
    
    return "Unknown"


def normalize_sensor_name(sensor_name: str) -> str:
    """Normalize sensor names for consistency."""
    # Remove common prefixes/suffixes
    normalized = sensor_name.strip()
    
    # Common replacements
    replacements = {
        "CPU Package": "CPU",
        "GPU Core": "GPU",
        "System Memory": "Memory",
        "Physical Memory": "Memory",
        "Virtual Memory": "Swap"
    }
    
    for old, new in replacements.items():
        if old in normalized:
            normalized = normalized.replace(old, new)
    
    return normalized


def calculate_alert_severity(
    current_value: float,
    warning_threshold: float,
    critical_threshold: float
) -> Optional[str]:
    """Calculate alert severity based on thresholds."""
    if current_value >= critical_threshold:
        return "critical"
    elif current_value >= warning_threshold:
        return "warning"
    return None


def get_default_thresholds(sensor_type: str) -> Dict[str, float]:
    """Get default warning and critical thresholds for sensor types."""
    thresholds = {
        "cpu_usage": {"warning": 75.0, "critical": 90.0},
        "cpu_temperature": {"warning": 70.0, "critical": 85.0},
        "gpu_usage": {"warning": 80.0, "critical": 95.0},
        "gpu_temperature": {"warning": 75.0, "critical": 85.0},
        "memory_usage": {"warning": 80.0, "critical": 95.0},
        "storage_usage": {"warning": 85.0, "critical": 95.0},
        "storage_temperature": {"warning": 50.0, "critical": 65.0}
    }
    
    return thresholds.get(sensor_type, {"warning": 75.0, "critical": 90.0})


def sanitize_hardware_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize hardware data to ensure valid values."""
    sanitized = {}
    
    for key, value in data.items():
        if isinstance(value, dict):
            sanitized[key] = sanitize_hardware_data(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_hardware_data(item) if isinstance(item, dict) else item
                for item in value
            ]
        elif isinstance(value, (int, float)):
            # Ensure numeric values are within reasonable bounds
            if key.endswith('_usage') or key.endswith('_percentage'):
                sanitized[key] = max(0, min(100, value))
            elif key.endswith('_temperature'):
                sanitized[key] = max(-50, min(150, value))
            else:
                sanitized[key] = value
        else:
            sanitized[key] = value
    
    return sanitized


def aggregate_sensor_data(
    sensor_readings: List[Dict[str, Any]],
    aggregation_type: str = "average"
) -> Dict[str, Any]:
    """Aggregate multiple sensor readings."""
    if not sensor_readings:
        return {}
    
    if aggregation_type == "latest":
        return sensor_readings[-1]
    
    # For average aggregation
    aggregated = {}
    numeric_fields = {}
    
    # Collect all numeric values
    for reading in sensor_readings:
        for key, value in reading.items():
            if isinstance(value, (int, float)):
                if key not in numeric_fields:
                    numeric_fields[key] = []
                numeric_fields[key].append(value)
            elif key not in aggregated:
                # Use the first non-numeric value
                aggregated[key] = value
    
    # Calculate averages
    for key, values in numeric_fields.items():
        if aggregation_type == "average":
            aggregated[key] = round(sum(values) / len(values), 2)
        elif aggregation_type == "max":
            aggregated[key] = max(values)
        elif aggregation_type == "min":
            aggregated[key] = min(values)
    
    return aggregated


def format_bytes_human_readable(bytes_value: int) -> str:
    """Format bytes to human-readable string."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.2f} PB"


def get_process_info(limit: int = 10) -> List[Dict[str, Any]]:
    """Get top processes by CPU and memory usage."""
    processes = []
    
    try:
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                proc_info = proc.info
                if proc_info['cpu_percent'] > 0 or proc_info['memory_percent'] > 0:
                    processes.append({
                        'pid': proc_info['pid'],
                        'name': proc_info['name'],
                        'cpu_percent': round(proc_info['cpu_percent'], 2),
                        'memory_percent': round(proc_info['memory_percent'], 2)
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        # Sort by CPU usage and return top N
        processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        return processes[:limit]
        
    except Exception as e:
        logger.error(f"Error getting process info: {e}")
        return []