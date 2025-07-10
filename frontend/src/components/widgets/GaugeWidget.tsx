/**
 * GaugeWidget - Sci-fi styled circular gauge for sensor values
 * Supports arc, circle, and linear gauge types with advanced animations
 */

import React, { memo, useMemo, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { WidgetConfig, SensorData, SciFiTheme, GaugeWidgetConfig } from '@types';

interface GaugeWidgetProps {
  widget: GaugeWidgetConfig;
  sensorData: SensorData;
  sensorValue: number | null;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<GaugeWidgetConfig>) => void;
}

export const GaugeWidget: React.FC<GaugeWidgetProps> = memo(({
  widget,
  sensorData,
  sensorValue,
  theme,
  onUpdate
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const controls = useAnimation();
  
  const {
    config: {
      gaugeType = 'arc',
      startAngle = -90,
      endAngle = 90,
      thickness = 20,
      showValue = true,
      showMinMax = true,
      animated = true,
      glowEffect = true,
      segments = 1,
      segmentColors,
      innerRadius = 60,
      outerRadius = 100
    },
    range: { min = 0, max = 100 } = {},
    unit = '%'
  } = widget;

  // Calculate gauge dimensions
  const size = Math.min(
    (widget.size.w * 100) - 40, 
    (widget.size.h * 100) - 60
  );
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size - thickness) / 2;

  // Calculate current value and percentage
  const currentValue = sensorValue ?? 0;
  const percentage = Math.max(0, Math.min(100, ((currentValue - min) / (max - min)) * 100));
  const clampedValue = Math.max(min, Math.min(max, currentValue));

  // Generate gauge path based on type
  const gaugePath = useMemo(() => {
    const angleRange = endAngle - startAngle;
    const valueAngle = startAngle + (percentage / 100) * angleRange;
    
    if (gaugeType === 'circle') {
      const circumference = 2 * Math.PI * radius;
      const strokeDasharray = circumference;
      const strokeDashoffset = circumference * (1 - percentage / 100);
      
      return {
        circumference,
        strokeDasharray,
        strokeDashoffset,
        path: `M ${centerX},${centerY} m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`
      };
    } else {
      // Arc gauge calculations
      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((valueAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((valueAngle * Math.PI) / 180);
      
      const largeArcFlag = Math.abs(valueAngle - startAngle) > 180 ? 1 : 0;
      
      return {
        backgroundPath: `M ${centerX + radius * Math.cos((startAngle * Math.PI) / 180)},${centerY + radius * Math.sin((startAngle * Math.PI) / 180)} A ${radius},${radius} 0 ${Math.abs(endAngle - startAngle) > 180 ? 1 : 0},1 ${centerX + radius * Math.cos((endAngle * Math.PI) / 180)},${centerY + radius * Math.sin((endAngle * Math.PI) / 180)}`,
        valuePath: percentage > 0 ? `M ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}` : '',
        needleAngle: valueAngle
      };
    }
  }, [gaugeType, startAngle, endAngle, percentage, radius, centerX, centerY]);

  // Segment calculations for multi-color gauges
  const segments_data = useMemo(() => {
    if (segments <= 1 || !segmentColors) return [];
    
    const segmentSize = 100 / segments;
    return Array.from({ length: segments }, (_, i) => {
      const segmentStart = i * segmentSize;
      const segmentEnd = (i + 1) * segmentSize;
      const isActive = percentage >= segmentStart;
      
      return {
        start: segmentStart,
        end: segmentEnd,
        color: segmentColors[i] || theme.colors.primary,
        isActive,
        opacity: isActive ? 1 : 0.3
      };
    });
  }, [segments, segmentColors, percentage, theme.colors.primary]);

  // Animation variants
  const gaugeVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      rotate: -180
    },
    visible: { 
      scale: 1, 
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    },
    update: {
      transition: {
        duration: animated ? 0.6 : 0,
        ease: 'easeInOut'
      }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3, duration: 0.5 }
    }
  };

  // Glow animation for active state
  useEffect(() => {
    if (glowEffect && animated) {
      controls.start({
        filter: [
          `drop-shadow(0 0 5px ${theme.colors.primary})`,
          `drop-shadow(0 0 15px ${theme.colors.primary})`,
          `drop-shadow(0 0 5px ${theme.colors.primary})`
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      });
    }
  }, [glowEffect, animated, theme.colors.primary, controls]);

  // Status color based on value
  const getStatusColor = () => {
    if (percentage >= 90) return theme.colors.danger;
    if (percentage >= 75) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <div
      className="gauge-widget"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      {/* Main Gauge SVG */}
      <motion.svg
        ref={svgRef}
        width={size}
        height={gaugeType === 'circle' ? size : size * 0.8}
        variants={gaugeVariants}
        initial="hidden"
        animate="visible"
        style={{ overflow: 'visible' }}
        animate={controls}
      >
        <defs>
          {/* Gradient definitions */}
          <linearGradient id={`gauge-gradient-${widget.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={getStatusColor()} stopOpacity="1" />
          </linearGradient>
          
          {/* Glow filter */}
          {glowEffect && (
            <filter id={`gauge-glow-${widget.id}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Background track */}
        {gaugeType === 'circle' ? (
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={`${theme.colors.border}40`}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        ) : (
          <path
            d={gaugePath.backgroundPath}
            fill="none"
            stroke={`${theme.colors.border}40`}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        )}

        {/* Segments or single gauge */}
        {segments_data.length > 0 ? (
          segments_data.map((segment, index) => (
            <motion.path
              key={index}
              d={gaugePath.valuePath}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${segment.end - segment.start} 100`}
              strokeDashoffset={100 - segment.end}
              opacity={segment.opacity}
              filter={glowEffect ? `url(#gauge-glow-${widget.id})` : undefined}
              animate={{
                strokeDashoffset: 100 - Math.min(segment.end, percentage),
                opacity: segment.isActive ? 1 : 0.3
              }}
              transition={{ duration: animated ? 0.6 : 0 }}
            />
          ))
        ) : (
          <motion.path
            d={gaugeType === 'circle' ? undefined : gaugePath.valuePath}
            cx={gaugeType === 'circle' ? centerX : undefined}
            cy={gaugeType === 'circle' ? centerY : undefined}
            r={gaugeType === 'circle' ? radius : undefined}
            fill="none"
            stroke={`url(#gauge-gradient-${widget.id})`}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={gaugeType === 'circle' ? gaugePath.strokeDasharray : undefined}
            filter={glowEffect ? `url(#gauge-glow-${widget.id})` : undefined}
            animate={{
              strokeDashoffset: gaugeType === 'circle' ? gaugePath.strokeDashoffset : undefined
            }}
            transition={{ duration: animated ? 0.6 : 0, ease: 'easeInOut' }}
          />
        )}

        {/* Needle for arc gauges */}
        {gaugeType === 'arc' && (
          <motion.line
            x1={centerX}
            y1={centerY}
            x2={centerX + (radius - 10) * Math.cos((gaugePath.needleAngle * Math.PI) / 180)}
            y2={centerY + (radius - 10) * Math.sin((gaugePath.needleAngle * Math.PI) / 180)}
            stroke={theme.colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
            animate={{
              x2: centerX + (radius - 10) * Math.cos((gaugePath.needleAngle * Math.PI) / 180),
              y2: centerY + (radius - 10) * Math.sin((gaugePath.needleAngle * Math.PI) / 180)
            }}
            transition={{ duration: animated ? 0.6 : 0, ease: 'easeInOut' }}
          />
        )}

        {/* Center dot */}
        <circle
          cx={centerX}
          cy={centerY}
          r={6}
          fill={theme.colors.accent}
          stroke={theme.colors.background}
          strokeWidth={2}
        />

        {/* Tick marks */}
        {showMinMax && Array.from({ length: 11 }, (_, i) => {
          const angle = startAngle + (i / 10) * (endAngle - startAngle);
          const tickRadius = radius + 5;
          const x1 = centerX + radius * Math.cos((angle * Math.PI) / 180);
          const y1 = centerY + radius * Math.sin((angle * Math.PI) / 180);
          const x2 = centerX + tickRadius * Math.cos((angle * Math.PI) / 180);
          const y2 = centerY + tickRadius * Math.sin((angle * Math.PI) / 180);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.colors.textSecondary}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              opacity={0.6}
            />
          );
        })}
      </motion.svg>

      {/* Value Display */}
      {showValue && (
        <motion.div
          variants={valueVariants}
          initial="hidden"
          animate="visible"
          style={{
            textAlign: 'center',
            marginTop: 8
          }}
        >
          <motion.div
            style={{
              fontSize: widget.size.w > 4 ? '24px' : '18px',
              fontWeight: 'bold',
              color: getStatusColor(),
              textShadow: glowEffect ? `0 0 10px ${getStatusColor()}` : undefined
            }}
            animate={{
              color: getStatusColor()
            }}
            transition={{ duration: 0.3 }}
          >
            {clampedValue.toFixed(1)}{unit}
          </motion.div>
          
          {showMinMax && (
            <div
              style={{
                fontSize: '12px',
                color: theme.colors.textSecondary,
                marginTop: 4,
                display: 'flex',
                justifyContent: 'space-between',
                width: '100px'
              }}
            >
              <span>{min}{unit}</span>
              <span>{max}{unit}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Status indicator */}
      <motion.div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: sensorValue !== null ? getStatusColor() : theme.colors.muted
        }}
        animate={{
          backgroundColor: sensorValue !== null ? getStatusColor() : theme.colors.muted,
          boxShadow: sensorValue !== null ? `0 0 8px ${getStatusColor()}` : 'none'
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
});

GaugeWidget.displayName = 'GaugeWidget';

export default GaugeWidget;