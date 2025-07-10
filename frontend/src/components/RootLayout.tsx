/**
 * RootLayout - Main layout component for TanStack Router
 * Provides navigation, theme context, and error boundaries
 */

import React, { Suspense, memo } from 'react';
import { Outlet, Link, useNavigate, useLocation } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { SciFiThemeProvider } from './sci-fi/SciFiThemeProvider';
import SciFiFrame from './sci-fi/SciFiFrame';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';

// Loading spinner component
const LoadingSpinner: React.FC = memo(() => {
  const { currentTheme } = useSciFiTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${currentTheme.colors.background}90`,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${currentTheme.colors.primary}`,
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{
          color: currentTheme.colors.text,
          fontSize: '14px',
          fontWeight: 500
        }}>
          Loading...
        </span>
      </div>
    </motion.div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = memo(({ 
  error, 
  resetErrorBoundary 
}) => {
  const { currentTheme } = useSciFiTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '500px',
        padding: '0'
      }}
    >
      <SciFiFrame
        frameType="angular"
        cornerCuts={[12, 12, 12, 12]}
        style={{
          backgroundColor: currentTheme.colors.surface,
          border: `1px solid ${currentTheme.colors.danger}`,
          padding: '24px',
          textAlign: 'center'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 16px',
          backgroundColor: `${currentTheme.colors.danger}20`,
          border: `2px solid ${currentTheme.colors.danger}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          ⚠️
        </div>
        
        <h2 style={{ 
          margin: '0 0 12px',
          color: currentTheme.colors.text,
          fontSize: '18px',
          fontWeight: 600
        }}>
          Application Error
        </h2>
        
        <p style={{
          margin: '0 0 16px',
          color: currentTheme.colors.textSecondary,
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          An unexpected error occurred. This could be due to a network issue or a problem with the application.
        </p>
        
        <details style={{
          margin: '16px 0',
          padding: '12px',
          backgroundColor: `${currentTheme.colors.background}80`,
          border: `1px solid ${currentTheme.colors.border}`,
          borderRadius: currentTheme.effects.borderRadius,
          fontSize: '12px',
          fontFamily: 'monospace',
          color: currentTheme.colors.textSecondary,
          textAlign: 'left'
        }}>
          <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
            Error Details
          </summary>
          {error.message}
        </details>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetErrorBoundary}
            style={{
              padding: '10px 20px',
              backgroundColor: currentTheme.colors.primary,
              border: 'none',
              borderRadius: currentTheme.effects.borderRadius,
              color: currentTheme.colors.text,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: `1px solid ${currentTheme.colors.border}`,
              borderRadius: currentTheme.effects.borderRadius,
              color: currentTheme.colors.text,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Go Home
          </motion.button>
        </div>
      </SciFiFrame>
    </motion.div>
  );
});

ErrorFallback.displayName = 'ErrorFallback';

// Navigation component
const Navigation: React.FC = memo(() => {
  const { currentTheme } = useSciFiTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/widgets', label: 'Widgets', icon: '🧩' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/help', label: 'Help', icon: '❓' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      position: 'fixed',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 100
    }}>
      <SciFiFrame
        frameType="rounded"
        cornerCuts={[8, 8, 8, 8]}
        style={{
          backgroundColor: `${currentTheme.colors.surface}95`,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${currentTheme.colors.border}`,
          padding: '8px'
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {navItems.map((item) => {
            const isActive = isActivePath(item.path);
            
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate({ to: item.path })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: currentTheme.effects.borderRadius,
                  backgroundColor: isActive 
                    ? `${currentTheme.colors.primary}20` 
                    : 'transparent',
                  color: isActive 
                    ? currentTheme.colors.primary 
                    : currentTheme.colors.textSecondary,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive 
                    ? `0 0 12px ${currentTheme.colors.primary}20` 
                    : 'none',
                  border: isActive 
                    ? `1px solid ${currentTheme.colors.primary}40` 
                    : '1px solid transparent'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </SciFiFrame>
    </nav>
  );
});

Navigation.displayName = 'Navigation';

// Main layout content
const LayoutContent: React.FC = memo(() => {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Show navigation for non-dashboard pages */}
      {!isDashboard && <Navigation />}
      
      {/* Main content area */}
      <div style={{
        width: '100%',
        height: '100%',
        paddingLeft: isDashboard ? '0' : '80px',
        transition: 'padding-left 0.3s ease'
      }}>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => window.location.reload()}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ width: '100%', height: '100%' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
});

LayoutContent.displayName = 'LayoutContent';

// Root layout component
export const RootLayout: React.FC = memo(() => {
  return (
    <SciFiThemeProvider defaultTheme="cyberpunk">
      <div className="sci-fi-scrollbar">
        <LayoutContent />
      </div>
      
      {/* Global styles and animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        #root {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </SciFiThemeProvider>
  );
});

RootLayout.displayName = 'RootLayout';
export default RootLayout;