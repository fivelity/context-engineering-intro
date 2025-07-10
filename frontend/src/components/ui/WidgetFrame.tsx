/**
 * WidgetFrame - Sci-fi styled frame wrapper for widgets
 * Provides consistent styling, borders, and visual effects
 */

import React, { memo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SciFiTheme } from '@types';

interface WidgetFrameProps {
  children: ReactNode;
  theme: SciFiTheme;
  status?: 'normal' | 'warning' | 'critical' | 'no-data' | 'configured';
  statusColor?: string;
  isSelected?: boolean;
  title?: string;
  subtitle?: string;
  headerHeight?: number;
  borderWidth?: number;
  glowIntensity?: number;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = memo(({
  children,
  theme,
  status = 'normal',
  statusColor,
  isSelected = false,
  title,
  subtitle,
  headerHeight = 32,
  borderWidth = 1,
  glowIntensity = 0.3
}) => {
  // Calculate colors based on theme and status
  const borderColor = statusColor || theme.colors.border;
  const glowColor = isSelected ? theme.colors.primary : borderColor;
  const headerBg = `${theme.colors.surface}90`;
  const frameBg = `${theme.colors.surface}40`;

  // Frame variants for animations
  const frameVariants = {
    idle: {
      borderColor: borderColor,
      boxShadow: `0 0 ${glowIntensity * 10}px ${glowColor}30`,
      scale: 1
    },
    selected: {
      borderColor: theme.colors.primary,
      boxShadow: `0 0 ${glowIntensity * 20}px ${theme.colors.primary}60`,
      scale: 1.01,
      transition: { duration: 0.2 }
    },
    hover: {
      borderColor: theme.colors.secondary,
      boxShadow: `0 0 ${glowIntensity * 15}px ${theme.colors.secondary}40`,
      transition: { duration: 0.15 }
    }
  };

  // Header variants
  const headerVariants = {
    hidden: { y: -headerHeight, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  // Corner decoration paths
  const cornerPaths = {
    topLeft: `M 0,${theme.effects?.cornerSize || 12} L 0,0 L ${theme.effects?.cornerSize || 12},0`,
    topRight: `M ${-(theme.effects?.cornerSize || 12)},0 L 0,0 L 0,${theme.effects?.cornerSize || 12}`,
    bottomLeft: `M 0,${-(theme.effects?.cornerSize || 12)} L 0,0 L ${theme.effects?.cornerSize || 12},0`,
    bottomRight: `M ${-(theme.effects?.cornerSize || 12)},0 L 0,0 L 0,${-(theme.effects?.cornerSize || 12)}`
  };

  return (
    <motion.div
      className={`
        widget-frame
        status-${status}
        ${isSelected ? 'selected' : ''}
      `}
      variants={frameVariants}
      initial="idle"
      animate={isSelected ? 'selected' : 'idle'}
      whileHover={!isSelected ? 'hover' : undefined}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: theme.effects?.borderRadius || 8,
        border: `${borderWidth}px solid ${borderColor}`,
        background: frameBg,
        backdropFilter: 'blur(10px)',
        overflow: 'hidden'
      }}
    >
      {/* Corner decorations */}
      {theme.effects?.cornerDecoration && (
        <div className="corner-decorations">
          {Object.entries(cornerPaths).map(([position, path]) => (
            <svg
              key={position}
              className={`corner-decoration corner-${position}`}
              style={{
                position: 'absolute',
                width: theme.effects?.cornerSize || 12,
                height: theme.effects?.cornerSize || 12,
                ...(position === 'topLeft' && { top: -1, left: -1 }),
                ...(position === 'topRight' && { top: -1, right: -1 }),
                ...(position === 'bottomLeft' && { bottom: -1, left: -1 }),
                ...(position === 'bottomRight' && { bottom: -1, right: -1 })
              }}
            >
              <path
                d={path}
                stroke={theme.colors.accent}
                strokeWidth={2}
                fill="none"
                opacity={0.8}
              />
            </svg>
          ))}
        </div>
      )}

      {/* Header */}
      {(title || subtitle) && (
        <motion.div
          className="widget-header"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            background: headerBg,
            borderBottom: `1px solid ${theme.colors.border}50`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            zIndex: 10
          }}
        >
          {title && (
            <div
              className="widget-title"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: theme.colors.text,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                flex: 1
              }}
            >
              {title}
            </div>
          )}
          
          {subtitle && (
            <div
              className="widget-subtitle"
              style={{
                fontSize: '10px',
                color: theme.colors.textSecondary,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                marginLeft: title ? 8 : 0,
                opacity: 0.7
              }}
            >
              {subtitle}
            </div>
          )}
        </motion.div>
      )}

      {/* Content area */}
      <div
        className="widget-content-area"
        style={{
          position: 'absolute',
          top: (title || subtitle) ? headerHeight : 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: 8
        }}
      >
        {children}
      </div>

      {/* Glitch effect overlay (for critical status) */}
      {status === 'critical' && theme.effects?.glitch && (
        <motion.div
          className="glitch-overlay"
          animate={{
            opacity: [0, 0.1, 0, 0.2, 0],
            x: [0, -1, 1, -1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: 'loop',
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${theme.colors.danger}20 50%, 
              transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 5
          }}
        />
      )}

      {/* Pulse effect for selected state */}
      {isSelected && theme.effects?.pulse && (
        <motion.div
          className="pulse-overlay"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            top: -borderWidth,
            left: -borderWidth,
            right: -borderWidth,
            bottom: -borderWidth,
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: theme.effects?.borderRadius || 8,
            pointerEvents: 'none',
            zIndex: 15
          }}
        />
      )}

      {/* Data flow lines (animated border segments) */}
      {theme.effects?.dataFlow && (
        <div className="data-flow-lines">
          {/* Top line */}
          <motion.div
            animate={{
              x: [-20, '100%', -20]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 0
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 20,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${theme.colors.accent}, transparent)`,
              zIndex: 20
            }}
          />
          
          {/* Right line */}
          <motion.div
            animate={{
              y: [-20, '100%', -20]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.75
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 2,
              height: 20,
              background: `linear-gradient(180deg, transparent, ${theme.colors.accent}, transparent)`,
              zIndex: 20
            }}
          />
          
          {/* Bottom line */}
          <motion.div
            animate={{
              x: ['100%', -20, '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 1.5
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 20,
              height: 2,
              background: `linear-gradient(270deg, transparent, ${theme.colors.accent}, transparent)`,
              zIndex: 20
            }}
          />
          
          {/* Left line */}
          <motion.div
            animate={{
              y: ['100%', -20, '100%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 2.25
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 2,
              height: 20,
              background: `linear-gradient(0deg, transparent, ${theme.colors.accent}, transparent)`,
              zIndex: 20
            }}
          />
        </div>
      )}
    </motion.div>
  );
});

WidgetFrame.displayName = 'WidgetFrame';

export default WidgetFrame;