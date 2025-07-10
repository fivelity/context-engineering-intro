/**
 * StatusBar - Dashboard status bar with connection, performance, and system info
 * Real-time updates with sci-fi theming and animations
 */

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import SciFiFrame from './sci-fi/SciFiFrame';
import { ConnectionStatus, SensorData } from '@types';

interface StatusBarProps {
  connectionStatus: ConnectionStatus;
  widgetCount: number;
  selectedCount: number;
  sensorData?: SensorData;
}

interface StatusIndicatorProps {
  icon: string;
  label: string;
  value: string | number;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  animated?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = memo(({
  icon,
  label,
  value,
  status = 'normal',
  animated = false
}) => {
  const { currentTheme } = useSciFiTheme();
  
  const getStatusColor = () => {
    switch (status) {
      case 'success': return currentTheme.colors.success;
      case 'warning': return currentTheme.colors.warning;
      case 'critical': return currentTheme.colors.danger;
      default: return currentTheme.colors.textSecondary;
    }
  };

  const statusColor = getStatusColor();

  return (
    <motion.div
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.6, repeat: animated ? Infinity : 0, repeatDelay: 2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: currentTheme.effects.borderRadius,
        backgroundColor: `${statusColor}10`,
        border: `1px solid ${statusColor}40`,
        fontSize: '11px'
      }}
    >
      <span style={{ fontSize: '12px' }}>{icon}</span>
      <span style={{ 
        color: currentTheme.colors.textSecondary,
        fontWeight: 500
      }}>
        {label}:
      </span>
      <span style={{ 
        color: statusColor,
        fontWeight: 600,
        fontFamily: 'monospace'
      }}>
        {value}
      </span>
    </motion.div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

export const StatusBar: React.FC<StatusBarProps> = memo(({
  connectionStatus,
  widgetCount,
  selectedCount,
  sensorData
}) => {
  const { currentTheme } = useSciFiTheme();
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memory: 0,
    updateRate: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceMetrics({
        fps: Math.floor(Math.random() * 5) + 58, // 58-62 FPS
        memory: Math.floor(Math.random() * 50) + 100, // 100-150 MB
        updateRate: Math.floor(Math.random() * 10) + 15 // 15-25 Hz
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { icon: '🟢', label: 'Connected', status: 'success' as const };
      case 'connecting':
        return { icon: '🟡', label: 'Connecting', status: 'warning' as const };
      case 'error':
        return { icon: '🔴', label: 'Disconnected', status: 'critical' as const };
      default:
        return { icon: '⚪', label: 'Unknown', status: 'normal' as const };
    }
  };

  const connectionInfo = getConnectionStatusInfo();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getSystemLoad = () => {
    if (!sensorData?.cpu?.load) return 0;
    return Math.round(sensorData.cpu.load.total || 0);
  };

  const getCpuTemp = () => {
    if (!sensorData?.cpu?.temperature) return 0;
    const temps = Object.values(sensorData.cpu.temperature);
    if (temps.length === 0) return 0;
    return Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
  };

  const getMemoryUsage = () => {
    if (!sensorData?.memory) return 0;
    const used = sensorData.memory.used || 0;
    const total = sensorData.memory.total || 1;
    return Math.round((used / total) * 100);
  };

  const statusVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const pulseVariants = {
    scale: [1, 1.02, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  };

  return (
    <motion.div
      variants={statusVariants}
      initial="hidden"
      animate="visible"
    >
      <SciFiFrame
        frameType="angular"
        cornerCuts={[8, 8, 0, 0]}
        style={{
          backgroundColor: `${currentTheme.colors.surface}95`,
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${currentTheme.colors.border}`,
          padding: '8px 20px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Left Section - Connection & System Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusIndicator
              icon={connectionInfo.icon}
              label="Status"
              value={connectionInfo.label}
              status={connectionInfo.status}
              animated={connectionStatus === 'connecting'}
            />

            {sensorData && (
              <>
                <StatusIndicator
                  icon="🔥"
                  label="CPU"
                  value={`${getCpuTemp()}°C`}
                  status={getCpuTemp() > 70 ? 'critical' : getCpuTemp() > 60 ? 'warning' : 'normal'}
                />

                <StatusIndicator
                  icon="📊"
                  label="Load"
                  value={`${getSystemLoad()}%`}
                  status={getSystemLoad() > 80 ? 'critical' : getSystemLoad() > 60 ? 'warning' : 'normal'}
                />

                <StatusIndicator
                  icon="💾"
                  label="Memory"
                  value={`${getMemoryUsage()}%`}
                  status={getMemoryUsage() > 85 ? 'critical' : getMemoryUsage() > 70 ? 'warning' : 'normal'}
                />
              </>
            )}
          </div>

          {/* Center Section - Widget Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <StatusIndicator
              icon="📱"
              label="Widgets"
              value={widgetCount}
              status="normal"
            />

            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <StatusIndicator
                    icon="✅"
                    label="Selected"
                    value={selectedCount}
                    status="success"
                    animated
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section - Performance & Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusIndicator
              icon="⚡"
              label="FPS"
              value={performanceMetrics.fps}
              status={performanceMetrics.fps < 55 ? 'warning' : 'success'}
            />

            <StatusIndicator
              icon="🔄"
              label="Updates"
              value={`${performanceMetrics.updateRate}Hz`}
              status="normal"
            />

            <div style={{
              width: '1px',
              height: '20px',
              backgroundColor: currentTheme.colors.border,
              margin: '0 4px'
            }} />

            <motion.div
              animate={pulseVariants}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: currentTheme.effects.borderRadius,
                backgroundColor: `${currentTheme.colors.primary}10`,
                border: `1px solid ${currentTheme.colors.primary}40`,
                fontSize: '11px',
                fontFamily: 'monospace',
                color: currentTheme.colors.primary,
                fontWeight: 600
              }}
            >
              <span>🕒</span>
              <span>{formatTime(currentTime)}</span>
            </motion.div>
          </div>
        </div>

        {/* Performance Bar */}
        <motion.div
          style={{
            height: '2px',
            backgroundColor: currentTheme.colors.border,
            borderRadius: '1px',
            marginTop: '6px',
            overflow: 'hidden'
          }}
        >
          <motion.div
            animate={{ 
              width: [`${Math.max(10, performanceMetrics.fps)}%`, `${Math.max(10, performanceMetrics.fps + 5)}%`, `${Math.max(10, performanceMetrics.fps)}%`],
              backgroundColor: [currentTheme.colors.success, currentTheme.colors.primary, currentTheme.colors.success]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              height: '100%',
              backgroundColor: currentTheme.colors.success,
              borderRadius: '1px'
            }}
          />
        </motion.div>
      </SciFiFrame>
    </motion.div>
  );
});

StatusBar.displayName = 'StatusBar';
export default StatusBar;