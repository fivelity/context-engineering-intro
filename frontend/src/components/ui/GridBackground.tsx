/**
 * GridBackground - Sci-fi styled grid background with effects
 * Provides visual grid guide and atmospheric effects for the dashboard
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SciFiTheme } from '@types';

interface GridBackgroundProps {
  width: number;
  height: number;
  gridSize: number;
  theme: SciFiTheme;
  effectsEnabled?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}

export const GridBackground: React.FC<GridBackgroundProps> = memo(({
  width,
  height,
  gridSize,
  theme,
  effectsEnabled = true,
  showGrid = true,
  animate = true
}) => {
  // Calculate grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const cols = Math.ceil(width / gridSize);
    const rows = Math.ceil(height / gridSize);

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      const x = i * gridSize;
      lines.push({
        type: 'vertical',
        x1: x,
        y1: 0,
        x2: x,
        y2: height,
        key: `v-${i}`
      });
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const y = i * gridSize;
      lines.push({
        type: 'horizontal',
        x1: 0,
        y1: y,
        x2: width,
        y2: y,
        key: `h-${i}`
      });
    }

    return lines;
  }, [width, height, gridSize]);

  // Animation variants
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 0.3,
      transition: {
        pathLength: {
          delay: i * 0.01,
          duration: 0.8,
          ease: 'easeInOut'
        },
        opacity: {
          delay: i * 0.01,
          duration: 0.4
        }
      }
    })
  };

  const scanlineVariants = {
    hidden: { x: -width },
    visible: {
      x: width,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 3
      }
    }
  };

  // Generate particle positions
  const particles = useMemo(() => {
    if (!effectsEnabled || !theme.effects.particles) return [];
    
    const particleCount = Math.min(50, Math.floor((width * height) / 10000));
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 2
    }));
  }, [width, height, effectsEnabled, theme.effects.particles]);

  return (
    <div
      className="grid-background"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      {/* Main background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: theme.colors.background,
          opacity: 0.95
        }}
      />

      {/* Grid SVG */}
      {showGrid && (
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <defs>
            {/* Grid line gradient */}
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.1" />
              <stop offset="50%" stopColor={theme.colors.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.1" />
            </linearGradient>

            {/* Glow filter */}
            {effectsEnabled && theme.effects.glowGrid && (
              <filter id="gridGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            )}
          </defs>

          {/* Grid lines */}
          <g className="grid-lines">
            {gridLines.map((line, index) => (
              <motion.line
                key={line.key}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="url(#gridGradient)"
                strokeWidth={0.5}
                variants={animate ? lineVariants : undefined}
                initial={animate ? "hidden" : undefined}
                animate={animate ? "visible" : undefined}
                custom={index}
                filter={effectsEnabled && theme.effects.glowGrid ? "url(#gridGlow)" : undefined}
              />
            ))}
          </g>

          {/* Major grid lines (every 5th line) */}
          <g className="major-grid-lines">
            {gridLines
              .filter((_, index) => index % 5 === 0)
              .map((line, index) => (
                <motion.line
                  key={`major-${line.key}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={theme.colors.secondary}
                  strokeWidth={1}
                  opacity={0.4}
                  variants={animate ? lineVariants : undefined}
                  initial={animate ? "hidden" : undefined}
                  animate={animate ? "visible" : undefined}
                  custom={index + gridLines.length}
                  filter={effectsEnabled && theme.effects.glowGrid ? "url(#gridGlow)" : undefined}
                />
              ))}
          </g>

          {/* Animated particles */}
          {effectsEnabled && theme.effects.particles && (
            <g className="particles">
              {particles.map((particle) => (
                <motion.circle
                  key={particle.id}
                  cx={particle.x}
                  cy={particle.y}
                  r={particle.size}
                  fill={theme.colors.accent}
                  variants={particleVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ transformOrigin: `${particle.x}px ${particle.y}px` }}
                  transition={{ delay: particle.delay }}
                />
              ))}
            </g>
          )}

          {/* Scanning line effect */}
          {effectsEnabled && theme.effects.scan && (
            <motion.line
              x1={0}
              y1={0}
              x2={0}
              y2={height}
              stroke={theme.colors.primary}
              strokeWidth={2}
              opacity={0.6}
              variants={scanlineVariants}
              initial="hidden"
              animate="visible"
              filter="url(#gridGlow)"
            />
          )}
        </svg>
      )}

      {/* Holographic overlay */}
      {effectsEnabled && theme.effects.hologram && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, transparent 30%, ${theme.colors.primary}05 50%, transparent 70%)`,
            animation: 'hologramSweep 4s ease-in-out infinite'
          }}
        />
      )}

      {/* Scanlines effect */}
      {effectsEnabled && theme.effects.scanlines && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${theme.colors.primary}10 2px,
              ${theme.colors.primary}10 4px
            )`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes hologramSweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          50% { transform: translateX(100%) skewX(-15deg); }
          100% { transform: translateX(-100%) skewX(-15deg); }
        }
      `}</style>
    </div>
  );
});

GridBackground.displayName = 'GridBackground';

export default GridBackground;