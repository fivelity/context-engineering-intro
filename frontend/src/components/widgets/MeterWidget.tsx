/**
 * MeterWidget - Linear meter with sci-fi styling
 * Supports horizontal/vertical bars, progress rings, and segmented displays
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { WidgetConfig, SensorData, SciFiTheme, MeterWidgetConfig } from '@types';

interface MeterWidgetProps {
  widget: MeterWidgetConfig;
  sensorData: SensorData;
  sensorValue: number | null;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<MeterWidgetConfig>) => void;
}

export const MeterWidget: React.FC<MeterWidgetProps> = memo(({
  widget,
  sensorData,
  sensorValue,
  theme,
  onUpdate
}) => {
  const {
    config: {
      meterType = 'horizontal',
      showValue = true,
      showMarkers = true,
      showThresholds = true,
      segments = 10,
      cornerRadius = 4,
      thickness = 20,
      glowEffect = true,
      animationSpeed = 1000,
      gradientColors,
      thresholdColors = {
        normal: theme.colors.success,
        warning: theme.colors.warning,
        critical: theme.colors.danger
      }
    },
    range: { min = 0, max = 100 } = {},
    unit = '%',
    alerts = []
  } = widget;

  // Calculate percentage and value
  const percentage = useMemo(() => {
    if (sensorValue === null) return 0;
    const clampedValue = Math.max(min, Math.min(max, sensorValue));
    return ((clampedValue - min) / (max - min)) * 100;
  }, [sensorValue, min, max]);

  const displayValue = useMemo(() => {
    if (sensorValue === null) return '--';
    return Math.max(min, Math.min(max, sensorValue)).toFixed(1);
  }, [sensorValue, min, max]);

  // Get meter color based on thresholds
  const getMeterColor = useMemo(() => {
    if (sensorValue === null) return theme.colors.muted;
    
    // Check alert thresholds
    for (const alert of alerts) {
      if (sensorValue >= alert.threshold) {
        return alert.severity === 'critical' 
          ? thresholdColors.critical 
          : thresholdColors.warning;
      }
    }
    
    // Default color based on percentage
    if (percentage >= 90) return thresholdColors.critical;
    if (percentage >= 75) return thresholdColors.warning;
    return thresholdColors.normal;
  }, [sensorValue, percentage, alerts, thresholdColors]);

  // Generate gradient colors
  const gradientStops = useMemo(() => {
    if (gradientColors && gradientColors.length > 0) {
      return gradientColors.map((color, index) => ({
        offset: (index / (gradientColors.length - 1)) * 100,
        color
      }));
    }
    
    return [
      { offset: 0, color: thresholdColors.normal },
      { offset: 75, color: thresholdColors.warning },
      { offset: 90, color: thresholdColors.critical }
    ];
  }, [gradientColors, thresholdColors]);

  // Render horizontal meter
  const renderHorizontalMeter = () => {
    const width = '100%';
    const height = thickness;
    
    return (
      <div
        className="horizontal-meter"
        style={{
          width,
          height,
          position: 'relative',
          backgroundColor: `${theme.colors.border}30`,
          borderRadius: cornerRadius,
          overflow: 'hidden'
        }}
      >
        {/* Background track with segments */}
        {segments > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex'
            }}
          >
            {Array.from({ length: segments }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRight: i < segments - 1 ? `1px solid ${theme.colors.background}` : 'none',
                  backgroundColor: `${theme.colors.border}20`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animationSpeed / 1000, 
            ease: 'easeInOut' 
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            background: gradientStops.length > 1 
              ? `linear-gradient(90deg, ${gradientStops.map(stop => `${stop.color} ${stop.offset}%`).join(', ')})`
              : getMeterColor,
            borderRadius: cornerRadius,
            boxShadow: glowEffect ? `0 0 10px ${getMeterColor}40` : undefined
          }}
        />
        
        {/* Threshold markers */}
        {showThresholds && alerts.map((alert, index) => {
          const alertPercentage = ((alert.threshold - min) / (max - min)) * 100;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${alertPercentage}%`,
                top: -2,
                bottom: -2,
                width: 2,
                backgroundColor: alert.severity === 'critical' 
                  ? thresholdColors.critical 
                  : thresholdColors.warning,
                zIndex: 10
              }}
            />
          );
        })}
      </div>
    );
  };

  // Render vertical meter
  const renderVerticalMeter = () => {
    const width = thickness;
    const height = '100%';
    
    return (
      <div
        className="vertical-meter"
        style={{
          width,
          height,
          position: 'relative',
          backgroundColor: `${theme.colors.border}30`,
          borderRadius: cornerRadius,
          overflow: 'hidden'
        }}
      >
        {/* Background track with segments */}
        {segments > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {Array.from({ length: segments }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderBottom: i < segments - 1 ? `1px solid ${theme.colors.background}` : 'none',
                  backgroundColor: `${theme.colors.border}20`
                }}
              />
            ))}
          </div>
        )}
        
        {/* Progress fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ 
            duration: animationSpeed / 1000, 
            ease: 'easeInOut' 
          }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: gradientStops.length > 1 
              ? `linear-gradient(0deg, ${gradientStops.map(stop => `${stop.color} ${stop.offset}%`).join(', ')})`
              : getMeterColor,
            borderRadius: cornerRadius,
            boxShadow: glowEffect ? `0 0 10px ${getMeterColor}40` : undefined
          }}
        />
        
        {/* Threshold markers */}
        {showThresholds && alerts.map((alert, index) => {
          const alertPercentage = ((alert.threshold - min) / (max - min)) * 100;
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                bottom: `${alertPercentage}%`,
                left: -2,
                right: -2,
                height: 2,
                backgroundColor: alert.severity === 'critical' 
                  ? thresholdColors.critical 
                  : thresholdColors.warning,
                zIndex: 10
              }}
            />
          );
        })}
      </div>
    );
  };

  // Render circular meter
  const renderCircularMeter = () => {
    const size = Math.min(widget.size.w * 80, widget.size.h * 80);
    const strokeWidth = thickness;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage / 100);
    
    return (
      <motion.svg
        width={size}
        height={size}
        className="circular-meter"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`meter-gradient-${widget.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, index) => (
              <stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} />
            ))}
          </linearGradient>
          
          {glowEffect && (
            <filter id={`meter-glow-${widget.id}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${theme.colors.border}30`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradientStops.length > 1 ? `url(#meter-gradient-${widget.id})` : getMeterColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animationSpeed / 1000, ease: 'easeInOut' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={glowEffect ? `url(#meter-glow-${widget.id})` : undefined}
        />
        
        {/* Center text */}
        {showValue && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={theme.colors.text}
            fontSize={`${size * 0.15}px`}
            fontWeight="bold"
            fontFamily="monospace"
          >
            {displayValue}{unit}
          </text>
        )}
      </motion.svg>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className="meter-widget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: meterType === 'vertical' ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 12
      }}
    >
      {/* Meter display */}
      {meterType === 'horizontal' && renderHorizontalMeter()}
      {meterType === 'vertical' && renderVerticalMeter()}
      {meterType === 'circular' && renderCircularMeter()}
      
      {/* Value display for linear meters */}
      {showValue && meterType !== 'circular' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: getMeterColor,
            fontFamily: 'monospace',
            textAlign: 'center'
          }}
        >
          {displayValue}{unit}
        </motion.div>
      )}
      
      {/* Markers */}
      {showMarkers && meterType !== 'circular' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: meterType === 'horizontal' ? '100%' : 'auto',
            height: meterType === 'vertical' ? '100%' : 'auto',
            flexDirection: meterType === 'vertical' ? 'column-reverse' : 'row',
            fontSize: '10px',
            color: theme.colors.textSecondary,
            fontFamily: 'monospace'
          }}
        >
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      )}
      
      {/* Status indicator */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: sensorValue !== null ? getMeterColor : theme.colors.muted,
          boxShadow: `0 0 8px ${sensorValue !== null ? getMeterColor : theme.colors.muted}`
        }}
      />
    </motion.div>
  );
});

MeterWidget.displayName = 'MeterWidget';

export default MeterWidget;