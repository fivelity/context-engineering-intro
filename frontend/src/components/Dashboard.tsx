/**
 * Dashboard - Main dashboard component integrating all systems
 * React 19+ with TanStack ecosystem and sci-fi theming
 */

import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import { useWidgetStore } from '@stores/widgetStore';
import { useSensorStore } from '@stores/sensorStore';
import { useWebSocket } from '@hooks/useWebSocket';
import DragDropSystem from './DragDropSystem';
import WidgetConfigurator from './WidgetConfigurator';
import DashboardToolbar from './DashboardToolbar';
import StatusBar from './StatusBar';
import type { WidgetConfig } from '../types/widget';

interface DashboardProps {
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = memo(({ className = '' }) => {
  const { currentTheme } = useSciFiTheme();
  const { widgets } = useWidgetStore();
  const { data: sensorData } = useSensorStore();
  
  // Widget configurator state
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [newWidgetPosition, setNewWidgetPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Dashboard layout state
  const [layoutMode] = useState<'edit' | 'view'>('view');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [gridSettings] = useState({ 
    gridSize: 20,
    cellSize: 100,
    gap: 8,
    snapToGrid: true, 
    showGrid: false 
  });

  // WebSocket connection for real-time data
  const { 
    isConnected, 
    connect,
    disconnect,
    lastError: connectionError
  } = useWebSocket({ 
    url: 'ws://localhost:8000/ws/sensors',
    enableReconnect: true,
    reconnectInterval: 3000
  });

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // WebSocket handles sensor data updates automatically through the hook

  const handleCreateWidget = useCallback((position?: { x: number; y: number }) => {
    setNewWidgetPosition(position || { x: 0, y: 0 });
    setEditingWidget(null);
    setIsConfiguratorOpen(true);
  }, []);

  const handleEditWidget = useCallback((widget: WidgetConfig) => {
    setEditingWidget(widget);
    setNewWidgetPosition(null);
    setIsConfiguratorOpen(true);
  }, []);

  const handleCloseConfigurator = useCallback(() => {
    setIsConfiguratorOpen(false);
    setEditingWidget(null);
    setNewWidgetPosition(null);
  }, []);

  const handleGridDoubleClick = useCallback((event: React.MouseEvent) => {
    if (layoutMode === 'edit') {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: Math.floor((event.clientX - rect.left) / (gridSettings.cellSize + gridSettings.gap)),
        y: Math.floor((event.clientY - rect.top) / (gridSettings.cellSize + gridSettings.gap))
      };
      handleCreateWidget(position);
    }
  }, [layoutMode, gridSettings, handleCreateWidget]);

  const dashboardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      className={`dashboard ${className}`}
      variants={dashboardVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background Effects */}
      <div className="dashboard-background effects-enabled particles scanlines" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Toolbar */}
      <motion.div variants={contentVariants} style={{ zIndex: 10 }}>
        <DashboardToolbar
          onCreateWidget={() => handleCreateWidget()}
          connectionStatus={isConnected ? 'connected' : connectionError ? 'error' : 'connecting'}
          selectedCount={selectedWidgets.length}
          totalWidgets={widgets.length}
        />
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        variants={contentVariants}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          padding: '12px',
          zIndex: 1
        }}
      >
        {/* Widget Grid */}
        <motion.div
          onDoubleClick={handleGridDoubleClick}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: currentTheme.effects.borderRadius,
            border: layoutMode === 'edit' 
              ? `2px dashed ${currentTheme.colors.primary}40`
              : `1px solid ${currentTheme.colors.border}20`,
            backgroundColor: `${currentTheme.colors.surface}10`,
            transition: 'all 0.3s ease'
          }}
          whileHover={layoutMode === 'edit' ? {
            borderColor: `${currentTheme.colors.primary}60`,
            backgroundColor: `${currentTheme.colors.surface}20`
          } : {}}
        >
          {/* Grid Pattern Overlay */}
          {layoutMode === 'edit' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                  linear-gradient(${currentTheme.colors.border}40 1px, transparent 1px),
                  linear-gradient(90deg, ${currentTheme.colors.border}40 1px, transparent 1px)
                `,
                backgroundSize: `${gridSettings.cellSize + gridSettings.gap}px ${gridSettings.cellSize + gridSettings.gap}px`,
                pointerEvents: 'none',
                opacity: 0.3
              }}
            />
          )}

          {/* No Widgets State */}
          <AnimatePresence>
            {widgets.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: currentTheme.colors.textSecondary,
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 16px',
                  border: `2px dashed ${currentTheme.colors.border}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px'
                }}>
                  📊
                </div>
                <h3 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '18px',
                  color: currentTheme.colors.text 
                }}>
                  No Widgets Yet
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px',
                  maxWidth: '300px'
                }}>
                  {layoutMode === 'edit' 
                    ? 'Double-click anywhere to create your first widget or use the toolbar'
                    : 'Enter edit mode to start creating widgets'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag & Drop Widget System */}
          <DragDropSystem
            widgets={widgets}
            editMode={layoutMode === 'edit'}
            onWidgetUpdate={(id, updates) => {
              // Update widget in store
              const { updateWidget } = useWidgetStore.getState();
              updateWidget(id, updates);
            }}
            onWidgetRemove={(id) => {
              const { removeWidget } = useWidgetStore.getState();
              removeWidget(id);
            }}
            onWidgetSelect={(id, multiSelect) => {
              if (multiSelect) {
                setSelectedWidgets(prev => 
                  prev.includes(id) 
                    ? prev.filter(wId => wId !== id)
                    : [...prev, id]
                );
              } else {
                setSelectedWidgets([id]);
              }
            }}
          />
        </motion.div>

        {/* Layout Mode Indicator */}
        <AnimatePresence>
          {layoutMode === 'edit' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '8px 12px',
                backgroundColor: `${currentTheme.colors.warning}20`,
                border: `1px solid ${currentTheme.colors.warning}`,
                borderRadius: currentTheme.effects.borderRadius,
                color: currentTheme.colors.warning,
                fontSize: '12px',
                fontWeight: 600,
                zIndex: 100,
                pointerEvents: 'none'
              }}
            >
              EDIT MODE
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status Bar */}
      <motion.div variants={contentVariants} style={{ zIndex: 10 }}>
        <StatusBar
          connectionStatus={isConnected ? 'connected' : connectionError ? 'error' : 'connecting'}
          widgetCount={widgets.length}
          selectedCount={selectedWidgets.length}
          sensorData={sensorData}
        />
      </motion.div>

      {/* Widget Configurator Modal */}
      <WidgetConfigurator
        isOpen={isConfiguratorOpen}
        onClose={handleCloseConfigurator}
        editingWidget={editingWidget}
        initialPosition={newWidgetPosition || { x: 0, y: 0 }}
        sensorData={sensorData}
      />

      {/* Connection Error Overlay */}
      <AnimatePresence>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: `${currentTheme.colors.background}90`,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              style={{
                padding: '24px',
                backgroundColor: currentTheme.colors.surface,
                border: `1px solid ${currentTheme.colors.danger}`,
                borderRadius: currentTheme.effects.borderRadius,
                textAlign: 'center',
                maxWidth: '400px'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                backgroundColor: `${currentTheme.colors.danger}20`,
                border: `2px solid ${currentTheme.colors.danger}`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme.colors.danger,
                fontSize: '20px'
              }}>
                ⚠️
              </div>
              <h3 style={{ 
                margin: '0 0 8px',
                color: currentTheme.colors.text,
                fontSize: '16px'
              }}>
                Connection Error
              </h3>
              <p style={{
                margin: '0 0 16px',
                color: currentTheme.colors.textSecondary,
                fontSize: '14px'
              }}>
                Unable to connect to sensor backend. Check your connection and try again.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connect}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentTheme.colors.primary,
                  border: 'none',
                  borderRadius: currentTheme.effects.borderRadius,
                  color: currentTheme.colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retry Connection
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;