/**
 * Help - Documentation and help system
 * Placeholder component for TanStack Router integration
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import SciFiFrame from './sci-fi/SciFiFrame';

export const Help: React.FC = memo(() => {
  const { currentTheme } = useSciFiTheme();

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: currentTheme.colors.background,
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <SciFiFrame
        frameType="angular"
        cornerCuts={[12, 12, 12, 12]}
        style={{
          backgroundColor: currentTheme.colors.surface,
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px'
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          backgroundColor: `${currentTheme.colors.secondary}20`,
          border: `2px solid ${currentTheme.colors.secondary}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          ❓
        </div>
        
        <h1 style={{
          margin: '0 0 16px',
          color: currentTheme.colors.text,
          fontSize: '24px',
          fontWeight: 700
        }}>
          Help & Documentation
        </h1>
        
        <p style={{
          margin: '0 0 24px',
          color: currentTheme.colors.textSecondary,
          fontSize: '16px',
          lineHeight: 1.5
        }}>
          Get help with SenseCanvas features, troubleshooting guides, API documentation, 
          and step-by-step tutorials for creating and customizing your dashboard.
        </p>
        
        <div style={{
          padding: '16px',
          backgroundColor: `${currentTheme.colors.warning}10`,
          border: `1px solid ${currentTheme.colors.warning}`,
          borderRadius: currentTheme.effects.borderRadius,
          color: currentTheme.colors.warning,
          fontSize: '14px'
        }}>
          🚧 Coming Soon - Help documentation is under development
        </div>
      </SciFiFrame>
    </motion.div>
  );
});

Help.displayName = 'Help';
export default Help;