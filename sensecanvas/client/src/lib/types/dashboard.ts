/**
 * SenseCanvas Dashboard Types
 * TypeScript types for dashboard state management and UI interactions
 */

import type { WidgetConfig, DashboardLayout, ThemeType } from './widgets.js';

// Dashboard state management
export interface DashboardState {
  // Edit mode and selection
  isEditMode: boolean;
  selectedWidgetId: string | null;
  selectedWidgets: Set<string>;
  
  // Grid configuration
  gridSize: {
    cols: number;
    rows: number;
    cellSize: number;
  };
  
  // Display settings
  theme: ThemeType;
  showGrid: boolean;
  snapToGrid: boolean;
  showLabels: boolean;
  showMetrics: boolean;
  
  // Layout management
  currentLayout: DashboardLayout | null;
  hasUnsavedChanges: boolean;
  
  // Performance settings
  enableAnimations: boolean;
  enableEffects: boolean;
  autoRefresh: boolean;
  refreshRate: number; // in milliseconds
}

// Widget interaction states
export interface WidgetInteractionState {
  isDragging: boolean;
  isResizing: boolean;
  isHovered: boolean;
  isSelected: boolean;
  dragOffset: { x: number; y: number };
  resizeHandle: ResizeHandle | null;
  bounds: DOMRect | null;
}

export type ResizeHandle = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left';

// Grid system
export interface GridCell {
  col: number;
  row: number;
  width: number;
  height: number;
  occupied: boolean;
  widgetId?: string;
}

export interface GridConfiguration {
  cols: number;
  rows: number;
  cellSize: number;
  gap: number;
  padding: number;
  snapThreshold: number;
}

// Dashboard actions and events
export type DashboardAction = 
  | { type: 'SET_EDIT_MODE'; payload: boolean }
  | { type: 'SELECT_WIDGET'; payload: string | null }
  | { type: 'ADD_WIDGET'; payload: WidgetConfig }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; config: Partial<WidgetConfig> } }
  | { type: 'DELETE_WIDGET'; payload: string }
  | { type: 'MOVE_WIDGET'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'RESIZE_WIDGET'; payload: { id: string; size: { width: number; height: number } } }
  | { type: 'SET_THEME'; payload: ThemeType }
  | { type: 'SET_GRID_SIZE'; payload: GridConfiguration }
  | { type: 'TOGGLE_GRID'; payload: boolean }
  | { type: 'TOGGLE_SNAP'; payload: boolean }
  | { type: 'LOAD_LAYOUT'; payload: DashboardLayout }
  | { type: 'SAVE_LAYOUT'; payload?: Partial<DashboardLayout> }
  | { type: 'RESET_LAYOUT' }
  | { type: 'IMPORT_CONFIG'; payload: any }
  | { type: 'EXPORT_CONFIG' };

// Dashboard events
export interface DashboardEvent {
  type: string;
  timestamp: number;
  data?: any;
  source?: 'user' | 'system' | 'api';
}

// Widget positioning and collision detection
export interface WidgetBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface CollisionInfo {
  hasCollision: boolean;
  collidingWidgets: string[];
  suggestedPosition?: { x: number; y: number };
}

// Dashboard toolbar and UI
export interface ToolbarState {
  isVisible: boolean;
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  tools: ToolbarTool[];
  activeTools: Set<string>;
}

export interface ToolbarTool {
  id: string;
  name: string;
  icon: string;
  tooltip: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  group?: string;
}

// Dashboard context menu
export interface ContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  targetWidgetId?: string;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

// Dashboard shortcuts and hotkeys
export interface KeyboardShortcut {
  key: string;
  modifier?: 'ctrl' | 'alt' | 'shift' | 'meta';
  action: () => void;
  description: string;
  category: string;
}

// Dashboard performance monitoring
export interface DashboardPerformance {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  widgetCount: number;
  activeConnections: number;
  lastUpdate: number;
  errors: PerformanceError[];
}

export interface PerformanceError {
  timestamp: number;
  type: string;
  message: string;
  stack?: string;
  widgetId?: string;
}

// Dashboard settings and preferences
export interface DashboardSettings {
  // Appearance
  theme: ThemeType;
  darkMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Grid and layout
  gridSize: GridConfiguration;
  snapToGrid: boolean;
  showGrid: boolean;
  showGuides: boolean;
  
  // Performance
  enableAnimations: boolean;
  enableEffects: boolean;
  maxFPS: number;
  renderOptimization: boolean;
  
  // Behavior
  autoSave: boolean;
  autoSaveInterval: number;
  confirmDelete: boolean;
  enableHotkeys: boolean;
  
  // Data refresh
  autoRefresh: boolean;
  refreshRate: number;
  enableCaching: boolean;
  
  // Alerts and notifications
  enableNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  alertPersistence: number;
}

// Dashboard backup and recovery
export interface DashboardBackup {
  id: string;
  timestamp: number;
  name: string;
  description?: string;
  layout: DashboardLayout;
  settings: DashboardSettings;
  version: string;
  checksum: string;
}

// Dashboard analytics
export interface DashboardAnalytics {
  sessionStart: number;
  sessionDuration: number;
  widgetsCreated: number;
  widgetsDeleted: number;
  layoutChanges: number;
  themeChanges: number;
  exportCount: number;
  importCount: number;
  errors: number;
  performance: DashboardPerformance[];
}

// Dashboard themes and customization
export interface CustomTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Dashboard responsive design
export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  gridCols: number;
  gridRows: number;
  cellSize: number;
}

export interface ResponsiveLayout {
  breakpoints: ResponsiveBreakpoint[];
  currentBreakpoint: string;
  adaptiveWidgets: boolean;
  hiddenWidgets: Set<string>;
}

// Dashboard accessibility
export interface AccessibilitySettings {
  enableScreenReader: boolean;
  enableKeyboardNavigation: boolean;
  announceUpdates: boolean;
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  focusIndicators: boolean;
}

// Dashboard connection status
export interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: number;
  reconnectAttempts: number;
  latency: number;
  errors: ConnectionError[];
}

export interface ConnectionError {
  timestamp: number;
  type: string;
  message: string;
  code?: number;
}

// Utility types
export type DashboardMode = 'view' | 'edit' | 'presentation' | 'fullscreen';
export type LayoutOrientation = 'portrait' | 'landscape';
export type ZoomLevel = number; // 0.5 to 2.0

// Export all types
export type {
  DashboardState,
  WidgetInteractionState,
  ResizeHandle,
  GridCell,
  GridConfiguration,
  DashboardAction,
  DashboardEvent,
  WidgetBounds,
  CollisionInfo,
  ToolbarState,
  ToolbarTool,
  ContextMenuState,
  ContextMenuItem,
  KeyboardShortcut,
  DashboardPerformance,
  PerformanceError,
  DashboardSettings,
  DashboardBackup,
  DashboardAnalytics,
  CustomTheme,
  ResponsiveBreakpoint,
  ResponsiveLayout,
  AccessibilitySettings,
  ConnectionStatus,
  ConnectionError,
  DashboardMode,
  LayoutOrientation,
  ZoomLevel
};