/**
 * CosmicSensorGauge.tsx
 * 
 * React TypeScript adaptation of CosmicSensorGauge component
 * Demonstrates:
 * - Cosmic UI Frame integration with sensor data
 * - Custom SVG gauge design with sci-fi styling
 * - React Hook Form integration for configuration
 * - Real-time value updates with Framer Motion animations
 * - Gaming-inspired visual effects and glows
 * - TanStack Query integration for real-time data
 */

import React, { useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { CosmicFrame } from './CosmicFrame';
import { useSensorStore } from '../stores/sensorStore';
import type { CosmicTheme, SensorPath } from '../types';

interface SensorConfig {
  min: number;
  max: number;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;
  icon?: string;
}

interface CosmicSensorGaugeProps {
  value: number;
  label: string;
  sensorPath: SensorPath;
  config?: SensorConfig;
  size?: number;
  theme: CosmicTheme;
  showFrame?: boolean;
  glowEffect?: boolean;
  animated?: boolean;
}

const defaultConfig: SensorConfig = {
  min: 0,
  max: 100,
  warningThreshold: 70,
  criticalThreshold: 90,
  unit: "%",
  icon: "🔥"
};

export const CosmicSensorGauge: React.FC<CosmicSensorGaugeProps> = ({
  value,
  label,
  sensorPath,
  config = defaultConfig,
  size = 200,
  theme,
  showFrame = true,
  glowEffect = true,
  animated = true
}) => {
  const gaugeRef = useRef<SVGSVGElement>(null);
  
  // Framer Motion values for smooth animations
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 20,
    stiffness: 100,
    duration: 0.8
  });
  
  // Update animation when value changes
  React.useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  // Gauge calculations
  const normalizedValue = useMemo(() => 
    Math.max(0, Math.min(100, ((value - config.min) / (config.max - config.min)) * 100)),
    [value, config.min, config.max]
  );
  
  const angle = useMemo(() => 
    (normalizedValue / 100) * 270 - 135, // 270° arc starting from -135°
    [normalizedValue]
  );
  
  const radius = size * 0.35;
  const centerX = size / 2;
  const centerY = size / 2;

  // Status-based colors with Cosmic UI theme
  const statusColor = useMemo(() => {
    if (value >= config.criticalThreshold) return theme.colors.error;
    if (value >= config.warningThreshold) return theme.colors.warning;
    return theme.colors.success;
  }, [value, config.warningThreshold, config.criticalThreshold, theme.colors]);

  // Cosmic UI frame paths for gauge container
  const gaugeFramePaths = useMemo(() => [
    {
      d: `M 15 15 L ${size * 0.85} 15 L ${size - 15} 30 L ${size - 15} ${size * 0.85} L ${size * 0.85} ${size - 15} L 15 ${size - 15} L 15 15 Z`,
      stroke: theme.colors.primary,
      fill: 'transparent',
      strokeWidth: 2,
      opacity: 0.6
    },
    {
      d: `M 10 10 L ${size * 0.9} 10 L ${size - 10} 25 L ${size - 10} ${size * 0.9} L ${size * 0.9} ${size - 10} L 10 ${size - 10} L 10 10 Z`,
      stroke: statusColor,
      fill: 'transparent',
      strokeWidth: 1,
      opacity: 0.8
    }
  ], [size, theme.colors.primary, statusColor]);

  // Generate arc path for gauge
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = {
      x: centerX + radius * Math.cos((startAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: centerX + radius * Math.cos((endAngle * Math.PI) / 180),
      y: centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    };
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const backgroundArc = createArcPath(-135, 135);
  const valueArc = createArcPath(-135, angle);

  return (
    <div 
      className="relative inline-block cosmic-sensor-gauge"
      style={{ width: size, height: size }}
    >
      {/* Cosmic UI Frame */}
      {showFrame && (
        <CosmicFrame 
          theme={theme}
          paths={gaugeFramePaths}
          glowEffect={glowEffect}
          animated={animated}
          className={glowEffect ? 'drop-shadow-xl' : ''}
          style={{
            filter: glowEffect ? `drop-shadow(0 0 20px ${statusColor}40)` : 'none'
          }}
        />
      )}

      {/* Gauge SVG */}
      <div className="absolute inset-4 flex items-center justify-center">
        <motion.svg 
          ref={gaugeRef}
          width={size - 32} 
          height={size - 32} 
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          initial={animated ? { scale: 0.9, opacity: 0 } : {}}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Background Arc */}
          <path 
            d={backgroundArc}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Animated Value Arc */}
          <motion.path 
            d={valueArc}
            stroke={statusColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            className="transition-all duration-800 ease-out"
            style={{
              filter: glowEffect ? `drop-shadow(0 0 8px ${statusColor})` : 'none'
            }}
            initial={animated ? { pathLength: 0 } : {}}
            animate={animated ? { pathLength: 1 } : {}}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          
          {/* Center Circle */}
          <motion.circle
            cx={centerX}
            cy={centerY}
            r="12"
            fill={theme.colors.background}
            stroke={statusColor}
            strokeWidth="2"
            initial={animated ? { scale: 0 } : {}}
            animate={animated ? { scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.3, ease: "backOut" }}
          />
          
          {/* Value Text */}
          <motion.text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            fill={theme.colors.text}
            fontSize="18"
            fontWeight="bold"
            fontFamily="monospace"
            initial={animated ? { opacity: 0, y: centerY + 5 } : {}}
            animate={animated ? { opacity: 1, y: centerY - 10 } : {}}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {Math.round(value)}
          </motion.text>
          
          {/* Unit Text */}
          <motion.text
            x={centerX}
            y={centerY + 8}
            textAnchor="middle"
            fill={theme.colors.textMuted}
            fontSize="10"
            opacity="0.7"
            fontFamily="monospace"
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 0.7 } : {}}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {config.unit}
          </motion.text>

          {/* Glow effect for critical values */}
          {value >= config.criticalThreshold && glowEffect && (
            <motion.circle
              cx={centerX}
              cy={centerY}
              r={radius + 10}
              fill="none"
              stroke={statusColor}
              strokeWidth="1"
              opacity="0.3"
              animate={{
                r: [radius + 10, radius + 15, radius + 10],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.svg>
      </div>

      {/* Label */}
      <motion.div 
        className="absolute bottom-2 left-0 right-0 text-center"
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <div className="text-xs font-medium text-white/80 flex items-center justify-center gap-1">
          {config.icon && (
            <span className="text-sm">{config.icon}</span>
          )}
          <span style={{ color: theme.colors.textMuted }}>{label}</span>
        </div>
      </motion.div>

      {/* Scan line effect for sci-fi aesthetic */}
      {theme.effects.scanlines && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(0deg, transparent 0%, ${statusColor}20 50%, transparent 100%)`,
            opacity: 0.3
          }}
          animate={{
            y: [-size, size]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </div>
  );
};

// Helper function to get sensor unit based on type
const getSensorUnit = (sensorPath: SensorPath): string => {
  if (sensorPath.includes('temperature')) return '°C';
  if (sensorPath.includes('usage') || sensorPath.includes('load')) return '%';
  if (sensorPath.includes('frequency') || sensorPath.includes('clock')) return 'MHz';
  if (sensorPath.includes('voltage')) return 'V';
  if (sensorPath.includes('fan') || sensorPath.includes('rpm')) return 'RPM';
  if (sensorPath.includes('memory') || sensorPath.includes('storage')) return 'GB';
  if (sensorPath.includes('network')) return 'Mbps';
  return '';
};

export default CosmicSensorGauge; 