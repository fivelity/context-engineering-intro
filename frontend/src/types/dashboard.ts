/**
 * Dashboard-specific types for layout management and user interface
 */

import { WidgetConfig, DashboardLayout, Position, Size } from './widget';
import { SciFiThemeId } from './sci-fi';

// Dashboard view modes
export type DashboardMode = 'view' | 'edit' | 'fullscreen' | 'kiosk';

// Grid configuration
export interface GridConfig {
  size: number; // Grid cell size in pixels
  columns: number;
  rows: number;
  snapToGrid: boolean;
  showGrid: boolean;
  gridColor: string;
  gridOpacity: number;
  bounds: {
    width: number;
    height: number;
  };
}

// Dashboard state for runtime management
export interface DashboardState {
  mode: DashboardMode;
  currentLayout: DashboardLayout;
  selectedWidgetIds: string[];
  draggedWidget: string | null;
  resizingWidget: string | null;
  isGridVisible: boolean;
  isSnapEnabled: boolean;
  isAutoSaveEnabled: boolean;
  isDirty: boolean;
  lastSaved: number;
  zoom: number;
  pan: Position;
  grid: GridConfig;
}

// Dashboard interaction events
export type DashboardEvent = 
  | 'widget-select'
  | 'widget-deselect'
  | 'widget-drag-start'
  | 'widget-drag-end'
  | 'widget-resize-start'
  | 'widget-resize-end'
  | 'widget-configure'
  | 'widget-remove'
  | 'layout-change'
  | 'mode-change'
  | 'theme-change';

export interface DashboardEventPayload {
  event: DashboardEvent;
  widgetId?: string;
  data?: any;
  timestamp: number;
}

// Drag and drop types
export interface DragState {
  isDragging: boolean;
  draggedWidgetId: string | null;
  dragOffset: Position;
  currentPosition: Position;
  snapPreview: Position | null;
  collisionWidgets: string[];
}

export interface DropZone {
  id: string;
  bounds: Bounds;
  accepts: string[];
  isActive: boolean;
  isHovered: boolean;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Resize types
export interface ResizeState {
  isResizing: boolean;
  resizingWidgetId: string | null;
  resizeHandle: ResizeHandle | null;
  initialSize: Size;
  currentSize: Size;
  minSize: Size;
  maxSize: Size;
  aspectRatio?: number;
}

export type ResizeHandle = 
  | 'n' | 'ne' | 'e' | 'se' 
  | 's' | 'sw' | 'w' | 'nw';

// Selection types
export interface SelectionState {
  selectedWidgets: string[];
  selectionBox: SelectionBox | null;
  isMultiSelecting: boolean;
  lastSelectedWidget: string | null;
}

export interface SelectionBox {
  start: Position;
  end: Position;
  bounds: Bounds;
  overlappingWidgets: string[];
}

// Viewport types for virtualization and performance
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
  visibleWidgets: string[];
  culledWidgets: string[];
}

// Dashboard toolbar configuration
export interface ToolbarConfig {
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  visible: boolean;
  collapsed: boolean;
  tools: ToolbarTool[];
  customization: {
    reorderable: boolean;
    hideable: boolean;
    groupable: boolean;
  };
}

export interface ToolbarTool {
  id: string;
  name: string;
  icon: string;
  tooltip: string;
  action: string;
  enabled: boolean;
  visible: boolean;
  shortcut?: string;
  group?: string;
}

// Dashboard sidebar configuration
export interface SidebarConfig {
  position: 'left' | 'right';
  visible: boolean;
  collapsed: boolean;
  width: number;
  resizable: boolean;
  panels: SidebarPanel[];
}

export interface SidebarPanel {
  id: string;
  title: string;
  icon: string;
  component: string;
  visible: boolean;
  collapsed: boolean;
  order: number;
}

// Dashboard settings and preferences
export interface DashboardSettings {
  theme: SciFiThemeId;
  autoSave: {
    enabled: boolean;
    interval: number; // milliseconds
  };
  grid: {
    size: number;
    visible: boolean;
    snapEnabled: boolean;
    color: string;
    opacity: number;
  };
  performance: {
    virtualization: boolean;
    maxWidgets: number;
    animationReduced: boolean;
    updateThrottle: number;
  };
  interaction: {
    multiSelect: boolean;
    dragThreshold: number;
    resizeHandleSize: number;
    doubleClickInterval: number;
  };
  toolbar: ToolbarConfig;
  sidebar: SidebarConfig;
  notifications: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    duration: number;
    maxNotifications: number;
  };
}

// Dashboard history for undo/redo functionality
export interface DashboardHistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  layout: DashboardLayout;
  description: string;
}

export interface DashboardHistory {
  entries: DashboardHistoryEntry[];
  currentIndex: number;
  maxEntries: number;
  canUndo: boolean;
  canRedo: boolean;
}

// Import/Export types
export interface DashboardExport {
  version: string;
  exportedAt: number;
  layout: DashboardLayout;
  settings: DashboardSettings;
  metadata: {
    appVersion: string;
    platform: string;
    widgets: {
      total: number;
      byType: Record<string, number>;
    };
  };
}

export interface ImportResult {
  success: boolean;
  layout?: DashboardLayout;
  settings?: DashboardSettings;
  errors: string[];
  warnings: string[];
  metadata: {
    widgetsImported: number;
    settingsImported: boolean;
    version: string;
  };
}

// Dashboard metrics and analytics
export interface DashboardMetrics {
  performance: {
    renderTime: number;
    updateFrequency: number;
    memoryUsage: number;
    widgetCount: number;
    activeWidgets: number;
  };
  usage: {
    sessionsToday: number;
    totalInteractions: number;
    mostUsedWidgetType: string;
    averageSessionDuration: number;
  };
  health: {
    websocketConnected: boolean;
    dataAge: number;
    errorCount: number;
    warningCount: number;
  };
}

// Context menu types
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: string;
  enabled: boolean;
  visible: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  shortcut?: string;
}

export interface ContextMenuConfig {
  widget: ContextMenuItem[];
  dashboard: ContextMenuItem[];
  selection: ContextMenuItem[];
}

// Keyboard shortcuts
export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: string;
  description: string;
  category: string;
  enabled: boolean;
}

// Dashboard templates
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  layout: Omit<DashboardLayout, 'id' | 'metadata'>;
  requirements: {
    sensors: string[];
    minResolution: { width: number; height: number };
    features: string[];
  };
  tags: string[];
  author?: string;
  version: string;
  popularity: number;
}

// Real-time collaboration types (future feature)
export interface CollaborationSession {
  id: string;
  participants: Participant[];
  permissions: CollaborationPermissions;
  cursors: Record<string, CursorPosition>;
  selections: Record<string, string[]>;
  isActive: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  permissions: UserPermissions;
  lastActivity: number;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canAddWidgets: boolean;
  canRemoveWidgets: boolean;
  canChangeLayout: boolean;
  canChangeTheme: boolean;
  canInviteOthers: boolean;
}

export interface UserPermissions {
  read: boolean;
  write: boolean;
  admin: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
  timestamp: number;
}

// Utility functions for dashboard operations
export function createDashboardId(): string {
  return `dashboard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateGridPosition(
  position: Position,
  gridSize: number,
  snapToGrid: boolean = true
): Position {
  if (!snapToGrid) return position;
  
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

export function checkCollision(
  widget: WidgetConfig,
  otherWidgets: WidgetConfig[],
  newPosition?: Position,
  newSize?: Size
): boolean {
  const pos = newPosition || widget.position;
  const size = newSize || widget.size;
  
  const bounds = {
    left: pos.x,
    right: pos.x + size.w,
    top: pos.y,
    bottom: pos.y + size.h,
  };
  
  return otherWidgets.some(other => {
    if (other.id === widget.id) return false;
    
    const otherBounds = {
      left: other.position.x,
      right: other.position.x + other.size.w,
      top: other.position.y,
      bottom: other.position.y + other.size.h,
    };
    
    return !(
      bounds.right <= otherBounds.left ||
      bounds.left >= otherBounds.right ||
      bounds.bottom <= otherBounds.top ||
      bounds.top >= otherBounds.bottom
    );
  });
}

export function getVisibleWidgets(
  widgets: WidgetConfig[],
  viewport: Viewport
): WidgetConfig[] {
  return widgets.filter(widget => {
    const widgetBounds = {
      left: widget.position.x,
      right: widget.position.x + widget.size.w,
      top: widget.position.y,
      bottom: widget.position.y + widget.size.h,
    };
    
    const viewportBounds = {
      left: viewport.x,
      right: viewport.x + viewport.width,
      top: viewport.y,
      bottom: viewport.y + viewport.height,
    };
    
    return !(
      widgetBounds.right < viewportBounds.left ||
      widgetBounds.left > viewportBounds.right ||
      widgetBounds.bottom < viewportBounds.top ||
      widgetBounds.top > viewportBounds.bottom
    );
  });
}

export function getDashboardBounds(widgets: WidgetConfig[]): Bounds {
  if (widgets.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  widgets.forEach(widget => {
    minX = Math.min(minX, widget.position.x);
    minY = Math.min(minY, widget.position.y);
    maxX = Math.max(maxX, widget.position.x + widget.size.w);
    maxY = Math.max(maxY, widget.position.y + widget.size.h);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}