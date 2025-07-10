/**
 * SciFiThemeToggle - Theme switching component with animations
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SciFiThemeId } from '@types';
import { useSciFiTheme } from './SciFiThemeProvider';

interface SciFiThemeToggleProps {
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}

export const SciFiThemeToggle: React.FC<SciFiThemeToggleProps> = memo(({
  compact = false,
  showLabels = true,
  className = ''
}) => {
  const { currentTheme, themes, setTheme, effectsEnabled, animationsEnabled } = useSciFiTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeList = Object.values(themes);

  const handleThemeSelect = (themeId: SciFiThemeId) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  const toggleVariants = {
    closed: { 
      height: compact ? 40 : 48,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: { 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.2 }
    }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.15 } }
  };

  return (
    <motion.div
      className={`sci-fi-theme-toggle ${className}`}
      variants={toggleVariants}
      animate={isOpen ? 'open' : 'closed'}
      style={{
        position: 'relative',
        backgroundColor: `var(--sci-fi-surface, ${currentTheme.colors.surface})`,
        border: `1px solid var(--sci-fi-border, ${currentTheme.colors.border})`,
        borderRadius: currentTheme.effects.borderRadius,
        overflow: 'hidden',
        minWidth: compact ? 120 : 200
      }}
    >
      {/* Current theme display */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: `${currentTheme.colors.primary}10` }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          height: compact ? 40 : 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          backgroundColor: 'transparent',
          border: 'none',
          color: currentTheme.colors.text,
          cursor: 'pointer',
          fontSize: compact ? '12px' : '14px',
          fontWeight: 500
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme color indicator */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: currentTheme.colors.primary,
              boxShadow: `0 0 8px ${currentTheme.colors.primary}40`,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          />
          
          {showLabels && (
            <span>{currentTheme.name}</span>
          )}
        </div>
        
        {/* Dropdown arrow */}
        <motion.svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            d="M2 4 L6 8 L10 4"
            stroke={currentTheme.colors.textSecondary}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>

      {/* Theme options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              borderTop: `1px solid ${currentTheme.colors.border}`,
              backgroundColor: currentTheme.colors.surface
            }}
          >
            {themeList.map((theme, index) => (
              <motion.button
                key={theme.id}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => handleThemeSelect(theme.id)}
                whileHover={{ 
                  backgroundColor: `${theme.colors.primary}15`,
                  x: 4
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  height: compact ? 36 : 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  padding: '0 12px',
                  backgroundColor: theme.id === currentTheme.id 
                    ? `${theme.colors.primary}10` 
                    : 'transparent',
                  border: 'none',
                  borderBottom: index < themeList.length - 1 
                    ? `1px solid ${currentTheme.colors.border}50` 
                    : 'none',
                  color: currentTheme.colors.text,
                  cursor: 'pointer',
                  fontSize: compact ? '11px' : '13px',
                  textAlign: 'left',
                  gap: 8
                }}
              >
                {/* Theme color preview */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: theme.colors.primary,
                    boxShadow: theme.id === currentTheme.id 
                      ? `0 0 6px ${theme.colors.primary}` 
                      : 'none',
                    border: `1px solid ${theme.colors.border}`
                  }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    {theme.name}
                  </div>
                  {!compact && (
                    <div 
                      style={{ 
                        fontSize: '10px', 
                        color: currentTheme.colors.textSecondary,
                        marginTop: 2
                      }}
                    >
                      {theme.description}
                    </div>
                  )}
                </div>
                
                {/* Current theme indicator */}
                {theme.id === currentTheme.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: theme.colors.primary
                    }}
                  />
                )}
              </motion.button>
            ))}
            
            {/* Effects toggle section */}
            <div
              style={{
                borderTop: `1px solid ${currentTheme.colors.border}`,
                padding: '8px 12px',
                backgroundColor: `${currentTheme.colors.surface}80`
              }}
            >
              <div style={{ 
                fontSize: '10px', 
                color: currentTheme.colors.textSecondary,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Effects
              </div>
              
              <div style={{ display: 'flex', gap: 8, fontSize: '10px' }}>
                <span style={{ 
                  color: effectsEnabled ? currentTheme.colors.success : currentTheme.colors.muted 
                }}>
                  {effectsEnabled ? '✓' : '✗'} Visual
                </span>
                <span style={{ 
                  color: animationsEnabled ? currentTheme.colors.success : currentTheme.colors.muted 
                }}>
                  {animationsEnabled ? '✓' : '✗'} Motion
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

SciFiThemeToggle.displayName = 'SciFiThemeToggle';
export default SciFiThemeToggle;