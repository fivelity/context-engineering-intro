/**
 * SimpleWidget - Clean single-value display with sci-fi styling
 * Perfect for displaying single sensor readings with minimal visual noise
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { WidgetConfig, SensorData, SciFiTheme, SimpleWidgetConfig } from '@types';

interface SimpleWidgetProps {
  widget: SimpleWidgetConfig;
  sensorData: SensorData;
  sensorValue: number | null;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<SimpleWidgetConfig>) => void;
}

export const SimpleWidget: React.FC<SimpleWidgetProps> = memo(({
  widget,
  sensorData,
  sensorValue,
  theme,
  onUpdate
}) => {
  const {
    config: {
      displayMode = 'large',
      showLabel = true,
      showUnit = true,
      showTrend = false,
      showMinMax = false,
      precision = 1,
      fontSize = 'auto',
      textAlign = 'center',
      iconType,
      customIcon,
      glowEffect = false,
      pulseOnChange = true,
      colorThresholds
    },
    range: { min = 0, max = 100 } = {},
    unit = '%'
  } = widget;

  // Calculate display values
  const displayValue = useMemo(() => {
    if (sensorValue === null) return '--';
    
    const clampedValue = Math.max(min, Math.min(max, sensorValue));
    return clampedValue.toFixed(precision);
  }, [sensorValue, min, max, precision]);

  // Get color based on thresholds or default
  const getValueColor = useMemo(() => {
    if (sensorValue === null) return theme.colors.muted;
    
    if (colorThresholds && colorThresholds.length > 0) {
      // Sort thresholds by value
      const sortedThresholds = [...colorThresholds].sort((a, b) => a.value - b.value);
      
      for (const threshold of sortedThresholds.reverse()) {
        if (sensorValue >= threshold.value) {
          return threshold.color;
        }
      }
    }
    
    // Default color logic based on percentage
    const percentage = ((sensorValue - min) / (max - min)) * 100;
    if (percentage >= 90) return theme.colors.danger;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.success;
  }, [sensorValue, colorThresholds, theme.colors, min, max]);

  // Calculate font size based on widget size and mode
  const calculateFontSize = useMemo(() => {
    if (fontSize !== 'auto') return fontSize;
    
    const baseSize = Math.min(widget.size.w * 20, widget.size.h * 15);
    
    switch (displayMode) {
      case 'compact':
        return `${Math.max(12, baseSize * 0.5)}px`;
      case 'medium':
        return `${Math.max(16, baseSize * 0.7)}px`;
      case 'large':
        return `${Math.max(24, baseSize * 1.0)}px`;
      case 'xl':
        return `${Math.max(32, baseSize * 1.3)}px`;
      default:
        return `${Math.max(16, baseSize * 0.8)}px`;
    }
  }, [fontSize, displayMode, widget.size]);

  // Icon mapping
  const getIcon = useMemo(() => {
    if (customIcon) return customIcon;
    
    switch (iconType) {
      case 'cpu': return '🔥';
      case 'gpu': return '🎮';
      case 'memory': return '💾';
      case 'storage': return '💿';
      case 'fan': return '🌪️';
      case 'temperature': return '🌡️';
      case 'voltage': return '⚡';
      case 'frequency': return '📊';
      default: return null;
    }
  }, [iconType, customIcon]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    update: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="simple-widget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: displayMode === 'compact' ? 8 : 16,
        position: 'relative'
      }}
    >
      {/* Icon */}
      {getIcon && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            fontSize: `${parseInt(calculateFontSize) * 0.6}px`,
            marginBottom: 8,
            opacity: 0.7
          }}
        >
          {getIcon}
        </motion.div>
      )}

      {/* Label */}
      {showLabel && displayMode !== 'compact' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          style={{
            fontSize: `${parseInt(calculateFontSize) * 0.3}px`,
            color: theme.colors.textSecondary,
            marginBottom: 4,
            textAlign: textAlign,
            width: '100%',
            fontWeight: 500,
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          {widget.title}
        </motion.div>
      )}

      {/* Main Value */}
      <motion.div
        key={displayValue} // Force re-render on value change for animation
        variants={valueVariants}
        initial="hidden"
        animate={pulseOnChange ? "update" : "visible"}
        style={{
          fontSize: calculateFontSize,
          fontWeight: 'bold',
          color: getValueColor,
          fontFamily: 'monospace',
          letterSpacing: '-0.5px',
          textAlign: textAlign,
          width: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
          gap: 4,
          textShadow: glowEffect ? `0 0 10px ${getValueColor}` : undefined
        }}
      >
        <span>{displayValue}</span>
        {showUnit && (
          <span
            style={{
              fontSize: `${parseInt(calculateFontSize) * 0.6}px`,
              color: theme.colors.textSecondary,
              fontWeight: 'normal'
            }}
          >
            {unit}
          </span>
        )}
      </motion.div>

      {/* Min/Max values */}
      {showMinMax && displayMode !== 'compact' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          style={{
            fontSize: `${parseInt(calculateFontSize) * 0.25}px`,
            color: theme.colors.textSecondary,
            marginTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontFamily: 'monospace'
          }}
        >
          <span>Min: {min.toFixed(precision)}{unit}</span>
          <span>Max: {max.toFixed(precision)}{unit}</span>
        </motion.div>
      )}

      {/* Trend indicator */}
      {showTrend && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: '12px',
            color: theme.colors.accent
          }}
        >
          {/* This would show trend based on historical data */}
          📈
        </motion.div>
      )}

      {/* Status indicator */}
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: sensorValue !== null ? getValueColor : theme.colors.muted,
          boxShadow: `0 0 6px ${sensorValue !== null ? getValueColor : theme.colors.muted}`
        }}
      />

      {/* Glow effect overlay */}
      {glowEffect && sensorValue !== null && (
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle, ${getValueColor}20, transparent 70%)`,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />
      )}

      {/* No data overlay */}
      {sensorValue === null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${theme.colors.surface}80`,
            color: theme.colors.muted,
            fontSize: '12px',
            fontWeight: 'bold',
            backdropFilter: 'blur(2px)'
          }}
        >
          NO DATA
        </motion.div>
      )}
    </motion.div>
  );
});

SimpleWidget.displayName = 'SimpleWidget';

export default SimpleWidget;