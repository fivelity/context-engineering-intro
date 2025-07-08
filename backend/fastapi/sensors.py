#!/usr/bin/env python3
"""
Hardware sensor monitoring using PyHardwareMonitor
Wrapper for LibreHardwareMonitorLib.dll
"""

import logging
import os
import sys
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Check if we're on Windows and can import CLR
try:
    import clr
    WINDOWS_AVAILABLE = True
except ImportError:
    WINDOWS_AVAILABLE = False
    logger.warning("CLR not available - falling back to mock data")


@dataclass
class SensorReading:
    """Represents a single sensor reading"""
    name: str
    value: float
    sensor_type: str
    hardware_type: str
    identifier: str
    unit: str
    timestamp: float


class HardwareMonitor:
    """Hardware monitoring using LibreHardwareMonitorLib"""
    
    def __init__(self):
        self.computer = None
        self.is_initialized = False
        self.last_update = 0
        self.sensor_cache = []
        
        # Initialize hardware monitoring
        self._initialize()
    
    def _initialize(self):
        """Initialize the hardware monitoring library"""
        try:
            if not WINDOWS_AVAILABLE:
                logger.info("Using mock sensor data (CLR not available)")
                self.is_initialized = True
                return
            
            # Add reference to LibreHardwareMonitorLib.dll
            dll_path = os.path.join(os.path.dirname(__file__), 'LibreHardwareMonitorLib.dll')
            
            if not os.path.exists(dll_path):
                logger.error(f"LibreHardwareMonitorLib.dll not found at {dll_path}")
                logger.info("Using mock sensor data")
                self.is_initialized = True
                return
            
            # Load the DLL
            clr.AddReference(dll_path)
            from LibreHardwareMonitor import Hardware
            
            # Create computer instance and enable components
            self.computer = Hardware.Computer()
            self.computer.IsCpuEnabled = True
            self.computer.IsGpuEnabled = True
            self.computer.IsMemoryEnabled = True
            self.computer.IsMotherboardEnabled = True
            self.computer.IsStorageEnabled = True
            self.computer.IsNetworkEnabled = True
            
            # Open the computer to start monitoring
            self.computer.Open()
            
            # Initial update to populate sensors
            self.update()
            
            self.is_initialized = True
            logger.info("Hardware monitor initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize hardware monitor: {e}")
            logger.info("Using mock sensor data")
            self.is_initialized = True
    
    def update(self):
        """Update all sensor readings"""
        try:
            if self.computer:
                # Update hardware sensors
                for hardware in self.computer.Hardware:
                    hardware.Update()
                    # Also update sub-hardware (like GPU sub-components)
                    for subhardware in hardware.SubHardware:
                        subhardware.Update()
            
            self.last_update = time.time()
            
        except Exception as e:
            logger.error(f"Error updating sensors: {e}")
    
    def get_sensor_data(self) -> List[Dict[str, Any]]:
        """Get all sensor data in a structured format"""
        try:
            # Update sensors
            self.update()
            
            if not self.computer:
                return self._get_mock_data()
            
            hardware_data = []
            
            for hardware in self.computer.Hardware:
                hw_data = {
                    'name': str(hardware.Name),
                    'hardwareType': str(hardware.HardwareType),
                    'sensors': []
                }
                
                # Get sensors from main hardware
                self._collect_sensors(hardware, hw_data['sensors'])
                
                # Get sensors from sub-hardware
                for subhardware in hardware.SubHardware:
                    sub_data = {
                        'name': str(subhardware.Name),
                        'hardwareType': str(subhardware.HardwareType),
                        'sensors': []
                    }
                    self._collect_sensors(subhardware, sub_data['sensors'])
                    hardware_data.append(sub_data)
                
                hardware_data.append(hw_data)
            
            return hardware_data
            
        except Exception as e:
            logger.error(f"Error getting sensor data: {e}")
            return self._get_mock_data()
    
    def _collect_sensors(self, hardware, sensor_list):
        """Collect sensors from a hardware component"""
        try:
            for sensor in hardware.Sensors:
                sensor_data = {
                    'name': str(sensor.Name),
                    'value': float(sensor.Value) if sensor.Value is not None else 0.0,
                    'sensorType': str(sensor.SensorType),
                    'hardwareType': str(hardware.HardwareType),
                    'identifier': str(sensor.Identifier),
                    'unit': self._get_unit_for_sensor_type(str(sensor.SensorType)),
                    'timestamp': time.time()
                }
                sensor_list.append(sensor_data)
                
        except Exception as e:
            logger.error(f"Error collecting sensors: {e}")
    
    def _get_unit_for_sensor_type(self, sensor_type: str) -> str:
        """Get the unit string for a sensor type"""
        unit_map = {
            'Temperature': '°C',
            'Load': '%',
            'Fan': 'RPM',
            'Voltage': 'V',
            'Clock': 'MHz',
            'Data': 'GB',
            'Control': '%',
            'Power': 'W',
            'Flow': 'L/h',
            'Factor': '',
            'Frequency': 'Hz',
            'Level': '%'
        }
        return unit_map.get(sensor_type, '')
    
    def _get_mock_data(self) -> List[Dict[str, Any]]:
        """Generate mock sensor data for testing"""
        import random
        
        current_time = time.time()
        
        # Simulate some variation in the data
        cpu_usage = 20 + random.random() * 60
        cpu_temp = 35 + random.random() * 30
        gpu_usage = 10 + random.random() * 70
        gpu_temp = 40 + random.random() * 35
        memory_usage = 30 + random.random() * 50
        
        mock_data = [
            {
                'name': 'Intel Core i7-12700K',
                'hardwareType': 'Cpu',
                'sensors': [
                    {
                        'name': 'CPU Total',
                        'value': cpu_usage,
                        'sensorType': 'Load',
                        'hardwareType': 'Cpu',
                        'identifier': '/cpu/0/load/0',
                        'unit': '%',
                        'timestamp': current_time
                    },
                    {
                        'name': 'CPU Package',
                        'value': cpu_temp,
                        'sensorType': 'Temperature',
                        'hardwareType': 'Cpu',
                        'identifier': '/cpu/0/temperature/0',
                        'unit': '°C',
                        'timestamp': current_time
                    },
                    {
                        'name': 'CPU Core #1',
                        'value': 3600 + random.random() * 400,
                        'sensorType': 'Clock',
                        'hardwareType': 'Cpu',
                        'identifier': '/cpu/0/clock/0',
                        'unit': 'MHz',
                        'timestamp': current_time
                    },
                    {
                        'name': 'CPU Core #1',
                        'value': 1.2 + random.random() * 0.3,
                        'sensorType': 'Voltage',
                        'hardwareType': 'Cpu',
                        'identifier': '/cpu/0/voltage/0',
                        'unit': 'V',
                        'timestamp': current_time
                    }
                ]
            },
            {
                'name': 'NVIDIA GeForce RTX 4070',
                'hardwareType': 'GpuNvidia',
                'sensors': [
                    {
                        'name': 'GPU Core',
                        'value': gpu_usage,
                        'sensorType': 'Load',
                        'hardwareType': 'GpuNvidia',
                        'identifier': '/gpu/0/load/0',
                        'unit': '%',
                        'timestamp': current_time
                    },
                    {
                        'name': 'GPU Temperature',
                        'value': gpu_temp,
                        'sensorType': 'Temperature',
                        'hardwareType': 'GpuNvidia',
                        'identifier': '/gpu/0/temperature/0',
                        'unit': '°C',
                        'timestamp': current_time
                    },
                    {
                        'name': 'GPU Memory',
                        'value': 20 + random.random() * 60,
                        'sensorType': 'Load',
                        'hardwareType': 'GpuNvidia',
                        'identifier': '/gpu/0/load/1',
                        'unit': '%',
                        'timestamp': current_time
                    },
                    {
                        'name': 'GPU Fan',
                        'value': 800 + random.random() * 1200,
                        'sensorType': 'Fan',
                        'hardwareType': 'GpuNvidia',
                        'identifier': '/gpu/0/fan/0',
                        'unit': 'RPM',
                        'timestamp': current_time
                    }
                ]
            },
            {
                'name': 'Generic Memory',
                'hardwareType': 'Memory',
                'sensors': [
                    {
                        'name': 'Memory',
                        'value': memory_usage,
                        'sensorType': 'Load',
                        'hardwareType': 'Memory',
                        'identifier': '/ram/load/0',
                        'unit': '%',
                        'timestamp': current_time
                    },
                    {
                        'name': 'Used Memory',
                        'value': memory_usage * 32 / 100,  # Assuming 32GB total
                        'sensorType': 'Data',
                        'hardwareType': 'Memory',
                        'identifier': '/ram/data/0',
                        'unit': 'GB',
                        'timestamp': current_time
                    },
                    {
                        'name': 'Available Memory',
                        'value': 32 - (memory_usage * 32 / 100),
                        'sensorType': 'Data',
                        'hardwareType': 'Memory',
                        'identifier': '/ram/data/1',
                        'unit': 'GB',
                        'timestamp': current_time
                    }
                ]
            },
            {
                'name': 'Motherboard',
                'hardwareType': 'Motherboard',
                'sensors': [
                    {
                        'name': 'System Temperature',
                        'value': 28 + random.random() * 12,
                        'sensorType': 'Temperature',
                        'hardwareType': 'Motherboard',
                        'identifier': '/motherboard/temperature/0',
                        'unit': '°C',
                        'timestamp': current_time
                    },
                    {
                        'name': 'CPU Fan',
                        'value': 600 + random.random() * 800,
                        'sensorType': 'Fan',
                        'hardwareType': 'Motherboard',
                        'identifier': '/motherboard/fan/0',
                        'unit': 'RPM',
                        'timestamp': current_time
                    },
                    {
                        'name': 'System Fan #1',
                        'value': 400 + random.random() * 600,
                        'sensorType': 'Fan',
                        'hardwareType': 'Motherboard',
                        'identifier': '/motherboard/fan/1',
                        'unit': 'RPM',
                        'timestamp': current_time
                    },
                    {
                        'name': '+12V',
                        'value': 11.8 + random.random() * 0.4,
                        'sensorType': 'Voltage',
                        'hardwareType': 'Motherboard',
                        'identifier': '/motherboard/voltage/0',
                        'unit': 'V',
                        'timestamp': current_time
                    }
                ]
            }
        ]
        
        return mock_data
    
    def get_sensor_by_identifier(self, identifier: str) -> Optional[SensorReading]:
        """Get a specific sensor by its identifier"""
        try:
            sensor_data = self.get_sensor_data()
            
            for hardware in sensor_data:
                for sensor in hardware.get('sensors', []):
                    if sensor.get('identifier') == identifier:
                        return SensorReading(
                            name=sensor['name'],
                            value=sensor['value'],
                            sensor_type=sensor['sensorType'],
                            hardware_type=sensor['hardwareType'],
                            identifier=sensor['identifier'],
                            unit=sensor['unit'],
                            timestamp=sensor['timestamp']
                        )
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting sensor by identifier: {e}")
            return None
    
    def get_sensors_by_type(self, sensor_type: str) -> List[SensorReading]:
        """Get all sensors of a specific type"""
        try:
            sensor_data = self.get_sensor_data()
            sensors = []
            
            for hardware in sensor_data:
                for sensor in hardware.get('sensors', []):
                    if sensor.get('sensorType') == sensor_type:
                        sensors.append(SensorReading(
                            name=sensor['name'],
                            value=sensor['value'],
                            sensor_type=sensor['sensorType'],
                            hardware_type=sensor['hardwareType'],
                            identifier=sensor['identifier'],
                            unit=sensor['unit'],
                            timestamp=sensor['timestamp']
                        ))
            
            return sensors
            
        except Exception as e:
            logger.error(f"Error getting sensors by type: {e}")
            return []
    
    def close(self):
        """Clean up resources"""
        try:
            if self.computer:
                self.computer.Close()
                logger.info("Hardware monitor closed successfully")
        except Exception as e:
            logger.error(f"Error closing hardware monitor: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get monitoring statistics"""
        sensor_data = self.get_sensor_data()
        total_sensors = sum(len(hw.get('sensors', [])) for hw in sensor_data)
        
        return {
            'is_initialized': self.is_initialized,
            'last_update': self.last_update,
            'total_hardware_components': len(sensor_data),
            'total_sensors': total_sensors,
            'mock_mode': not bool(self.computer),
            'windows_available': WINDOWS_AVAILABLE
        }