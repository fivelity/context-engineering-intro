/**
 * SciFiFrame - Customizable SVG frames for sci-fi styling
 * SVG-first approach with dynamic path generation
 */

import React, { memo, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SciFiTheme, SciFiFrameConfig } from '@types';

interface SciFiFrameProps {
  children: ReactNode;
  theme: SciFiTheme;
  frameType?: 'angular' | 'rounded' | 'hexagon' | 'circuit' | 'minimal';
  glowEffect?: boolean;
  animated?: boolean;
  cornerCuts?: number;
  borderWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SciFiFrame: React.FC<SciFiFrameProps> = memo(({
  children,
  theme,
  frameType = 'angular',
  glowEffect = true,
  animated = true,
  cornerCuts = 12,
  borderWidth = 2,
  className = '',
  style = {}
}) => {
  // Generate SVG paths based on frame type
  const framePaths = useMemo(() => {
    const width = 100;
    const height = 100;
    const cut = cornerCuts;
    
    switch (frameType) {
      case 'angular':
        return {
          border: `M${cut},0 L${width-cut},0 L${width},${cut} L${width},${height-cut} L${width-cut},${height} L${cut},${height} L0,${height-cut} L0,${cut} Z`,
          inner: `M${cut+2},2 L${width-cut-2},2 L${width-2},${cut+2} L${width-2},${height-cut-2} L${width-cut-2},${height-2} L${cut+2},${height-2} L2,${height-cut-2} L2,${cut+2} Z`
        };
      
      case 'hexagon':
        const hexCut = cut * 2;
        return {
          border: `M${hexCut},0 L${width-hexCut},0 L${width},${height/2} L${width-hexCut},${height} L${hexCut},${height} L0,${height/2} Z`,
          inner: `M${hexCut+2},2 L${width-hexCut-2},2 L${width-2},${height/2} L${width-hexCut-2},${height-2} L${hexCut+2},${height-2} L2,${height/2} Z`
        };
      
      case 'circuit':
        return {
          border: `M${cut},0 L${width/3},0 L${width/3+cut/2},${cut/2} L${2*width/3-cut/2},${cut/2} L${2*width/3},0 L${width-cut},0 L${width},${cut} L${width},${height/3} L${width-cut/2},${height/3+cut/2} L${width-cut/2},${2*height/3-cut/2} L${width},${2*height/3} L${width},${height-cut} L${width-cut},${height} L${2*width/3},${height} L${2*width/3-cut/2},${height-cut/2} L${width/3+cut/2},${height-cut/2} L${width/3},${height} L${cut},${height} L0,${height-cut} L0,${2*height/3} L${cut/2},${2*height/3-cut/2} L${cut/2},${height/3+cut/2} L0,${height/3} L0,${cut} Z`,
          inner: ''
        };
      
      case 'rounded':
        return {
          border: `M${cut},0 Q0,0 0,${cut} L0,${height-cut} Q0,${height} ${cut},${height} L${width-cut},${height} Q${width},${height} ${width},${height-cut} L${width},${cut} Q${width},0 ${width-cut},0 Z`,
          inner: `M${cut},2 Q2,2 2,${cut} L2,${height-cut} Q2,${height-2} ${cut},${height-2} L${width-cut},${height-2} Q${width-2},${height-2} ${width-2},${height-cut} L${width-2},${cut} Q${width-2},2 ${width-cut},2 Z`
        };
      
      default: // minimal
        return {
          border: `M0,0 L${width},0 L${width},${height} L0,${height} Z`,
          inner: `M2,2 L${width-2},2 L${width-2},${height-2} L2,${height-2} Z`
        };
    }
  }, [frameType, cornerCuts]);

  // Animation variants
  const frameVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    },
    glow: {
      filter: [
        `drop-shadow(0 0 5px ${theme.colors.primary})`,
        `drop-shadow(0 0 15px ${theme.colors.primary})`,
        `drop-shadow(0 0 5px ${theme.colors.primary})`
      ],
      transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' }
    }
  };

  return (
    <div
      className={`sci-fi-frame ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style
      }}
    >
      {/* SVG Frame Overlay */}
      <svg
        className="frame-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`frameGradient-${frameType}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.8" />
            <stop offset="50%" stopColor={theme.colors.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0.8" />
          </linearGradient>
          
          {glowEffect && (
            <filter id={`frameGlow-${frameType}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Main frame border */}
        <motion.path
          d={framePaths.border}
          fill="none"
          stroke={`url(#frameGradient-${frameType})`}
          strokeWidth={borderWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={animated ? frameVariants : undefined}
          initial={animated ? "hidden" : undefined}
          animate={animated ? (glowEffect ? "glow" : "visible") : undefined}
          filter={glowEffect ? `url(#frameGlow-${frameType})` : undefined}
        />

        {/* Inner frame detail */}
        {framePaths.inner && (
          <motion.path
            d={framePaths.inner}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={borderWidth / 2}
            strokeOpacity={0.6}
            variants={animated ? frameVariants : undefined}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
          />
        )}

        {/* Corner details */}
        {frameType === 'angular' && (
          <>
            {[0, 1, 2, 3].map(corner => {
              const x = corner % 2 === 0 ? 0 : 100;
              const y = corner < 2 ? 0 : 100;
              const rotation = corner * 90;
              
              return (
                <g key={corner} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
                  <motion.path
                    d={`M0,0 L${cornerCuts/2},0 M0,0 L0,${cornerCuts/2}`}
                    stroke={theme.colors.accent}
                    strokeWidth={borderWidth}
                    strokeLinecap="round"
                    variants={animated ? frameVariants : undefined}
                    initial={animated ? "hidden" : undefined}
                    animate={animated ? "visible" : undefined}
                  />
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          padding: borderWidth * 2,
          zIndex: 0
        }}
      >
        {children}
      </div>

      {/* Background overlay for frame interior */}
      <div
        style={{
          position: 'absolute',
          top: borderWidth,
          left: borderWidth,
          right: borderWidth,
          bottom: borderWidth,
          background: `${theme.colors.surface}10`,
          backdropFilter: 'blur(1px)',
          zIndex: -1,
          clipPath: frameType === 'angular' 
            ? `polygon(${cornerCuts}px 0, calc(100% - ${cornerCuts}px) 0, 100% ${cornerCuts}px, 100% calc(100% - ${cornerCuts}px), calc(100% - ${cornerCuts}px) 100%, ${cornerCuts}px 100%, 0 calc(100% - ${cornerCuts}px), 0 ${cornerCuts}px)`
            : undefined,
          borderRadius: frameType === 'rounded' ? cornerCuts : 0
        }}
      />
    </div>
  );
});

SciFiFrame.displayName = 'SciFiFrame';
export default SciFiFrame;