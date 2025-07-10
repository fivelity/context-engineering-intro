/**
 * Settings - Main settings page with nested routing
 * Comprehensive configuration interface for SenseCanvas
 */

import React, { memo } from 'react';
import { Outlet, Link, useLocation } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import SciFiFrame from './sci-fi/SciFiFrame';

interface SettingsTabProps {
  to: string;
  icon: string;
  label: string;
  description: string;
  isActive: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = memo(({
  to,
  icon,
  label,
  description,
  isActive
}) => {
  const { currentTheme } = useSciFiTheme();
  
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02, x: 4 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderRadius: currentTheme.effects.borderRadius,
          backgroundColor: isActive 
            ? `${currentTheme.colors.primary}15` 
            : 'transparent',
          border: `1px solid ${isActive ? currentTheme.colors.primary : 'transparent'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isActive ? `0 0 12px ${currentTheme.colors.primary}20` : 'none'
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isActive 
            ? `${currentTheme.colors.primary}20` 
            : `${currentTheme.colors.surface}80`,
          borderRadius: currentTheme.effects.borderRadius,
          fontSize: '18px',
          border: `1px solid ${isActive ? currentTheme.colors.primary : currentTheme.colors.border}`
        }}>
          {icon}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: 0,
            color: isActive ? currentTheme.colors.primary : currentTheme.colors.text,
            fontSize: '14px',
            fontWeight: 600
          }}>
            {label}
          </h3>
          <p style={{
            margin: '4px 0 0',
            color: currentTheme.colors.textSecondary,
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            {description}
          </p>
        </div>
        
        <div style={{
          color: currentTheme.colors.textSecondary,
          fontSize: '12px'
        }}>
          →
        </div>
      </motion.div>
    </Link>
  );
});

SettingsTab.displayName = 'SettingsTab';

export const Settings: React.FC = memo(() => {
  const { currentTheme } = useSciFiTheme();
  const location = useLocation();
  
  const settingsTabs = [
    {
      to: '/settings/general',
      icon: '⚙️',
      label: 'General',
      description: 'Application preferences and behavior settings'
    },
    {
      to: '/settings/theme',
      icon: '🎨',
      label: 'Theme & Appearance',
      description: 'Customize colors, effects, and visual styling'
    },
    {
      to: '/settings/connection',
      icon: '🔌',
      label: 'Connection',
      description: 'Sensor backend and WebSocket configuration'
    },
    {
      to: '/settings/widgets',
      icon: '📱',
      label: 'Widgets',
      description: 'Default widget settings and templates'
    }
  ];

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  const isRootSettings = location.pathname === '/settings';

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
        overflow: 'auto'
      }}
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isRootSettings ? '1fr' : '350px 1fr',
        gap: '20px',
        height: '100%'
      }}>
        {/* Settings Navigation */}
        <SciFiFrame
          frameType="angular"
          cornerCuts={[12, 12, 12, 12]}
          style={{
            backgroundColor: currentTheme.colors.surface,
            padding: '20px',
            height: 'fit-content'
          }}
        >
          <div style={{
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${currentTheme.colors.border}`
          }}>
            <h2 style={{
              margin: 0,
              color: currentTheme.colors.text,
              fontSize: '20px',
              fontWeight: 700
            }}>
              Settings
            </h2>
            <p style={{
              margin: '8px 0 0',
              color: currentTheme.colors.textSecondary,
              fontSize: '14px'
            }}>
              Configure SenseCanvas to your preferences
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {settingsTabs.map((tab) => (
              <SettingsTab
                key={tab.to}
                {...tab}
                isActive={location.pathname === tab.to}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: `1px solid ${currentTheme.colors.border}`
          }}>
            <h4 style={{
              margin: '0 0 12px',
              color: currentTheme.colors.text,
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Quick Actions
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.effects.borderRadius,
                  color: currentTheme.colors.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>💾</span>
                Export Settings
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentTheme.colors.border}`,
                  borderRadius: currentTheme.effects.borderRadius,
                  color: currentTheme.colors.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📁</span>
                Import Settings
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'transparent',
                  border: `1px solid ${currentTheme.colors.warning}`,
                  borderRadius: currentTheme.effects.borderRadius,
                  color: currentTheme.colors.warning,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔄</span>
                Reset to Defaults
              </motion.button>
            </div>
          </div>
        </SciFiFrame>

        {/* Settings Content */}
        {!isRootSettings && (
          <SciFiFrame
            frameType="rounded"
            cornerCuts={[8, 8, 8, 8]}
            style={{
              backgroundColor: currentTheme.colors.surface,
              padding: '20px',
              height: 'fit-content',
              minHeight: '500px'
            }}
          >
            <Outlet />
          </SciFiFrame>
        )}

        {/* Welcome Message for Root Settings */}
        {isRootSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentTheme.colors.textSecondary,
              textAlign: 'center'
            }}
          >
            <div>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 20px',
                backgroundColor: `${currentTheme.colors.primary}20`,
                border: `2px solid ${currentTheme.colors.primary}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                ⚙️
              </div>
              <h3 style={{
                margin: '0 0 12px',
                color: currentTheme.colors.text,
                fontSize: '20px',
                fontWeight: 600
              }}>
                Configure SenseCanvas
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                maxWidth: '400px',
                lineHeight: 1.5
              }}>
                Select a settings category from the sidebar to customize your dashboard experience.
                Configure themes, connections, widgets, and more.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

Settings.displayName = 'Settings';
export default Settings;