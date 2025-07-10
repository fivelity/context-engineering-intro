/**
 * Layout store for dashboard widget management and persistence
 * Based on the examples/layoutStore.ts pattern with React 19+ optimizations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  WidgetConfig, 
  DashboardLayout, 
  Position, 
  Size, 
  createWidgetId,
  checkCollision,
  calculateGridPosition 
} from '@types';

interface LayoutState {
  // Current layout state
  currentLayout: DashboardLayout;
  widgets: WidgetConfig[];
  gridSize: number;
  editMode: boolean;
  selectedWidgetIds: string[];
  
  // UI interaction state
  isDragging: boolean;
  isResizing: boolean;
  draggedWidgetId: string | null;
  resizingWidgetId: string | null;
  dragPreview: { position: Position; size: Size } | null;
  
  // Layout management
  savedLayouts: DashboardLayout[];
  layoutHistory: DashboardLayout[];
  historyIndex: number;
  maxHistoryEntries: number;
  
  // Grid and viewport settings
  snapToGrid: boolean;
  showGrid: boolean;
  autoSave: boolean;
  lastSaved: number;
  isDirty: boolean;
  
  // Widget management actions
  addWidget: (widget: Omit<WidgetConfig, 'id' | 'created' | 'modified'>) => string;
  removeWidget: (id: string) => void;
  removeWidgets: (ids: string[]) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  updateWidgetPosition: (id: string, position: Position) => void;
  updateWidgetSize: (id: string, size: Size) => void;
  duplicateWidget: (id: string) => string | null;
  
  // Selection management
  selectWidget: (id: string, multiSelect?: boolean) => void;
  selectWidgets: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Layout actions
  setEditMode: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (enabled: boolean) => void;
  setShowGrid: (visible: boolean) => void;
  setAutoSave: (enabled: boolean) => void;
  
  // Layout persistence
  saveCurrentLayout: (name: string, description?: string) => string;
  loadLayout: (layout: DashboardLayout) => void;
  resetLayout: () => void;
  duplicateLayout: (layoutId: string) => string | null;
  deleteLayout: (layoutId: string) => void;
  
  // History management (undo/redo)
  addToHistory: () => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  
  // Import/Export
  exportLayout: () => string;
  exportLayouts: () => string;
  importLayout: (layoutJson: string) => boolean;
  importLayouts: (layoutsJson: string) => number;
  
  // Grid utilities
  isValidPosition: (position: Position, size: Size, excludeWidgetId?: string) => boolean;
  snapToGrid: (position: Position) => Position;
  getGridBounds: () => { width: number; height: number };
  findEmptyPosition: (size: Size) => Position;
  
  // Collision detection
  checkWidgetCollision: (widget: WidgetConfig, newPosition?: Position, newSize?: Size) => boolean;
  getOverlappingWidgets: (widget: WidgetConfig, newPosition?: Position, newSize?: Size) => string[];
  
  // Drag state management
  setDragging: (dragging: boolean, widgetId?: string) => void;
  setResizing: (resizing: boolean, widgetId?: string) => void;
  setDragPreview: (preview: { position: Position; size: Size } | null) => void;
  
  // Utility functions
  getWidget: (id: string) => WidgetConfig | null;
  getSelectedWidgets: () => WidgetConfig[];
  getWidgetAt: (position: Position) => WidgetConfig | null;
  getLayoutBounds: () => { x: number; y: number; width: number; height: number };
}

// Create default dashboard layout
const createDefaultLayout = (): DashboardLayout => ({
  id: 'default',
  name: 'Default Layout',
  description: 'Default SenseCanvas dashboard layout',
  widgets: [],
  gridSize: 20,
  theme: 'cyberpunk',
  backgroundEffects: {
    particles: true,
    scanlines: false,
    glowGrid: true,
    hologram: false,
  },
  metadata: {
    created: Date.now(),
    modified: Date.now(),
    version: '1.0.0',
    tags: ['default'],
  },
  settings: {
    snapToGrid: true,
    showGrid: true,
    lockLayout: false,
    autoSave: true,
    maxWidgets: 50,
  },
});

export const useLayoutStore = create<LayoutState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        currentLayout: createDefaultLayout(),
        widgets: [],
        gridSize: 20,
        editMode: false,
        selectedWidgetIds: [],
        isDragging: false,
        isResizing: false,
        draggedWidgetId: null,
        resizingWidgetId: null,
        dragPreview: null,
        savedLayouts: [],
        layoutHistory: [],
        historyIndex: -1,
        maxHistoryEntries: 50,
        snapToGrid: true,
        showGrid: true,
        autoSave: true,
        lastSaved: Date.now(),
        isDirty: false,

        // Widget management actions
        addWidget: (widgetData) => {
          const widgetId = createWidgetId();
          const widget: WidgetConfig = {
            ...widgetData,
            id: widgetId,
            created: Date.now(),
            modified: Date.now(),
          } as WidgetConfig;

          set((state) => {
            // Find a good position if none provided
            if (!widget.position || (widget.position.x === 0 && widget.position.y === 0)) {
              widget.position = state.findEmptyPosition(widget.size);
            }

            state.widgets.push(widget);
            state.currentLayout.widgets = state.widgets;
            state.currentLayout.metadata.modified = Date.now();
            state.isDirty = true;

            // Add to history
            state.addToHistory();
          });

          return widgetId;
        },

        removeWidget: (id) => {
          set((state) => {
            state.widgets = state.widgets.filter(w => w.id !== id);
            state.currentLayout.widgets = state.widgets;
            state.currentLayout.metadata.modified = Date.now();
            state.selectedWidgetIds = state.selectedWidgetIds.filter(wId => wId !== id);
            state.isDirty = true;

            // Add to history
            state.addToHistory();
          });
        },

        removeWidgets: (ids) => {
          set((state) => {
            state.widgets = state.widgets.filter(w => !ids.includes(w.id));
            state.currentLayout.widgets = state.widgets;
            state.currentLayout.metadata.modified = Date.now();
            state.selectedWidgetIds = state.selectedWidgetIds.filter(wId => !ids.includes(wId));
            state.isDirty = true;

            // Add to history
            state.addToHistory();
          });
        },

        updateWidget: (id, updates) => {
          set((state) => {
            const index = state.widgets.findIndex(w => w.id === id);
            if (index !== -1) {
              state.widgets[index] = { 
                ...state.widgets[index], 
                ...updates, 
                modified: Date.now() 
              };
              state.currentLayout.widgets = state.widgets;
              state.currentLayout.metadata.modified = Date.now();
              state.isDirty = true;
            }
          });
        },

        updateWidgetPosition: (id, position) => {
          set((state) => {
            const widget = state.widgets.find(w => w.id === id);
            if (widget) {
              const snappedPosition = state.snapToGrid ? state.snapToGrid(position) : position;
              
              // Check for collisions
              if (!state.checkWidgetCollision(widget, snappedPosition)) {
                widget.position = snappedPosition;
                widget.modified = Date.now();
                state.currentLayout.metadata.modified = Date.now();
                state.isDirty = true;
              }
            }
          });
        },

        updateWidgetSize: (id, size) => {
          set((state) => {
            const widget = state.widgets.find(w => w.id === id);
            if (widget) {
              // Ensure size meets minimum requirements
              const constrainedSize = {
                w: Math.max(size.w, widget.minSize.w),
                h: Math.max(size.h, widget.minSize.h),
              };

              // Check max size if defined
              if (widget.maxSize) {
                constrainedSize.w = Math.min(constrainedSize.w, widget.maxSize.w);
                constrainedSize.h = Math.min(constrainedSize.h, widget.maxSize.h);
              }

              // Check for collisions with new size
              if (!state.checkWidgetCollision(widget, widget.position, constrainedSize)) {
                widget.size = constrainedSize;
                widget.modified = Date.now();
                state.currentLayout.metadata.modified = Date.now();
                state.isDirty = true;
              }
            }
          });
        },

        duplicateWidget: (id) => {
          const widget = get().getWidget(id);
          if (!widget) return null;

          const newWidgetId = createWidgetId();
          const duplicatedWidget: WidgetConfig = {
            ...widget,
            id: newWidgetId,
            title: `${widget.title} (Copy)`,
            position: {
              x: widget.position.x + widget.size.w * get().gridSize,
              y: widget.position.y,
            },
            created: Date.now(),
            modified: Date.now(),
          };

          set((state) => {
            // Find a good position for the duplicate
            duplicatedWidget.position = state.findEmptyPosition(duplicatedWidget.size);
            
            state.widgets.push(duplicatedWidget);
            state.currentLayout.widgets = state.widgets;
            state.currentLayout.metadata.modified = Date.now();
            state.isDirty = true;

            // Add to history
            state.addToHistory();
          });

          return newWidgetId;
        },

        // Selection management
        selectWidget: (id, multiSelect = false) => {
          set((state) => {
            if (multiSelect) {
              if (state.selectedWidgetIds.includes(id)) {
                state.selectedWidgetIds = state.selectedWidgetIds.filter(wId => wId !== id);
              } else {
                state.selectedWidgetIds.push(id);
              }
            } else {
              state.selectedWidgetIds = [id];
            }
          });
        },

        selectWidgets: (ids) => {
          set((state) => {
            state.selectedWidgetIds = [...ids];
          });
        },

        clearSelection: () => {
          set((state) => {
            state.selectedWidgetIds = [];
          });
        },

        selectAll: () => {
          set((state) => {
            state.selectedWidgetIds = state.widgets.map(w => w.id);
          });
        },

        // Layout management
        setEditMode: (enabled) => {
          set((state) => {
            state.editMode = enabled;
            if (!enabled) {
              state.selectedWidgetIds = [];
              state.isDragging = false;
              state.isResizing = false;
              state.draggedWidgetId = null;
              state.resizingWidgetId = null;
              state.dragPreview = null;
            }
          });
        },

        setGridSize: (size) => {
          set((state) => {
            state.gridSize = size;
            state.currentLayout.gridSize = size;
            state.currentLayout.metadata.modified = Date.now();
            state.isDirty = true;
          });
        },

        setSnapToGrid: (enabled) => {
          set((state) => {
            state.snapToGrid = enabled;
            state.currentLayout.settings.snapToGrid = enabled;
          });
        },

        setShowGrid: (visible) => {
          set((state) => {
            state.showGrid = visible;
            state.currentLayout.settings.showGrid = visible;
          });
        },

        setAutoSave: (enabled) => {
          set((state) => {
            state.autoSave = enabled;
            state.currentLayout.settings.autoSave = enabled;
          });
        },

        // Layout persistence
        saveCurrentLayout: (name, description) => {
          const layoutId = `layout-${Date.now()}`;
          const layout: DashboardLayout = {
            ...get().currentLayout,
            id: layoutId,
            name,
            description,
            metadata: {
              ...get().currentLayout.metadata,
              created: Date.now(),
              modified: Date.now(),
            },
          };

          set((state) => {
            state.savedLayouts.push(layout);
            state.lastSaved = Date.now();
            state.isDirty = false;
          });

          return layoutId;
        },

        loadLayout: (layout) => {
          set((state) => {
            // Add current layout to history before switching
            state.addToHistory();
            
            state.currentLayout = { 
              ...layout, 
              metadata: { 
                ...layout.metadata, 
                modified: Date.now() 
              } 
            };
            state.widgets = [...layout.widgets];
            state.gridSize = layout.gridSize;
            state.selectedWidgetIds = [];
            state.editMode = false;
            state.isDirty = false;
            state.lastSaved = Date.now();
          });
        },

        resetLayout: () => {
          set((state) => {
            // Add current layout to history before resetting
            state.addToHistory();
            
            state.widgets = [];
            state.currentLayout = createDefaultLayout();
            state.selectedWidgetIds = [];
            state.editMode = false;
            state.isDirty = false;
          });
        },

        duplicateLayout: (layoutId) => {
          const layout = get().savedLayouts.find(l => l.id === layoutId);
          if (!layout) return null;

          const newLayoutId = `layout-${Date.now()}`;
          const duplicatedLayout: DashboardLayout = {
            ...layout,
            id: newLayoutId,
            name: `${layout.name} (Copy)`,
            widgets: layout.widgets.map(w => ({
              ...w,
              id: createWidgetId(),
              created: Date.now(),
              modified: Date.now(),
            })),
            metadata: {
              ...layout.metadata,
              created: Date.now(),
              modified: Date.now(),
            },
          };

          set((state) => {
            state.savedLayouts.push(duplicatedLayout);
          });

          return newLayoutId;
        },

        deleteLayout: (layoutId) => {
          set((state) => {
            state.savedLayouts = state.savedLayouts.filter(l => l.id !== layoutId);
          });
        },

        // History management
        addToHistory: () => {
          const state = get();
          const currentSnapshot = { ...state.currentLayout };
          
          set((historyState) => {
            // Remove any entries after current index (when adding new history after undo)
            historyState.layoutHistory = historyState.layoutHistory.slice(0, historyState.historyIndex + 1);
            
            // Add new entry
            historyState.layoutHistory.push(currentSnapshot);
            historyState.historyIndex = historyState.layoutHistory.length - 1;
            
            // Limit history size
            if (historyState.layoutHistory.length > historyState.maxHistoryEntries) {
              historyState.layoutHistory = historyState.layoutHistory.slice(-historyState.maxHistoryEntries);
              historyState.historyIndex = historyState.layoutHistory.length - 1;
            }
          });
        },

        undo: () => {
          const state = get();
          if (!state.canUndo()) return false;

          const previousLayout = state.layoutHistory[state.historyIndex - 1];
          set((undoState) => {
            undoState.historyIndex--;
            undoState.currentLayout = { ...previousLayout };
            undoState.widgets = [...previousLayout.widgets];
            undoState.gridSize = previousLayout.gridSize;
            undoState.selectedWidgetIds = [];
          });

          return true;
        },

        redo: () => {
          const state = get();
          if (!state.canRedo()) return false;

          const nextLayout = state.layoutHistory[state.historyIndex + 1];
          set((redoState) => {
            redoState.historyIndex++;
            redoState.currentLayout = { ...nextLayout };
            redoState.widgets = [...nextLayout.widgets];
            redoState.gridSize = nextLayout.gridSize;
            redoState.selectedWidgetIds = [];
          });

          return true;
        },

        canUndo: () => {
          const state = get();
          return state.historyIndex > 0;
        },

        canRedo: () => {
          const state = get();
          return state.historyIndex < state.layoutHistory.length - 1;
        },

        clearHistory: () => {
          set((state) => {
            state.layoutHistory = [];
            state.historyIndex = -1;
          });
        },

        // Import/Export functionality
        exportLayout: () => {
          const state = get();
          return JSON.stringify({
            layout: state.currentLayout,
            widgets: state.widgets,
            exportedAt: Date.now(),
            version: '1.0.0',
            app: 'SenseCanvas'
          }, null, 2);
        },

        exportLayouts: () => {
          const state = get();
          return JSON.stringify({
            layouts: state.savedLayouts,
            current: state.currentLayout,
            exportedAt: Date.now(),
            version: '1.0.0',
            app: 'SenseCanvas'
          }, null, 2);
        },

        importLayout: (layoutJson) => {
          try {
            const imported = JSON.parse(layoutJson);
            
            if (imported.layout && imported.widgets) {
              set((state) => {
                state.currentLayout = {
                  ...imported.layout,
                  id: `imported-${Date.now()}`,
                  metadata: {
                    ...imported.layout.metadata,
                    modified: Date.now()
                  }
                };
                state.widgets = imported.widgets.map((w: WidgetConfig) => ({
                  ...w,
                  id: createWidgetId(),
                  modified: Date.now()
                }));
                state.gridSize = imported.layout.gridSize || 20;
                state.selectedWidgetIds = [];
                state.isDirty = true;
              });
              return true;
            }
            return false;
          } catch (error) {
            console.error('Failed to import layout:', error);
            return false;
          }
        },

        importLayouts: (layoutsJson) => {
          try {
            const imported = JSON.parse(layoutsJson);
            let importedCount = 0;
            
            if (imported.layouts && Array.isArray(imported.layouts)) {
              set((state) => {
                imported.layouts.forEach((layout: DashboardLayout) => {
                  const importedLayout = {
                    ...layout,
                    id: `imported-${Date.now()}-${importedCount}`,
                    widgets: layout.widgets.map(w => ({
                      ...w,
                      id: createWidgetId(),
                      modified: Date.now()
                    })),
                    metadata: {
                      ...layout.metadata,
                      modified: Date.now()
                    }
                  };
                  state.savedLayouts.push(importedLayout);
                  importedCount++;
                });
              });
            }
            
            return importedCount;
          } catch (error) {
            console.error('Failed to import layouts:', error);
            return 0;
          }
        },

        // Grid utilities
        isValidPosition: (position, size, excludeWidgetId) => {
          const state = get();
          const bounds = state.getGridBounds();
          
          // Check bounds
          const inBounds = (
            position.x >= 0 &&
            position.y >= 0 &&
            position.x + (size.w * state.gridSize) <= bounds.width &&
            position.y + (size.h * state.gridSize) <= bounds.height
          );
          
          if (!inBounds) return false;
          
          // Check for collisions with other widgets
          const hasCollision = state.widgets.some(widget => {
            if (excludeWidgetId && widget.id === excludeWidgetId) return false;
            return checkCollision(
              { position, size } as any,
              [widget]
            );
          });
          
          return !hasCollision;
        },

        snapToGrid: (position) => {
          const { gridSize } = get();
          return calculateGridPosition(position, gridSize, true);
        },

        getGridBounds: () => {
          // This would typically get the actual container dimensions
          // For now, return a large default size
          return { width: 2000, height: 1200 };
        },

        findEmptyPosition: (size) => {
          const state = get();
          const bounds = state.getGridBounds();
          const gridSize = state.gridSize;
          
          // Try to find an empty position
          for (let y = 0; y < bounds.height - (size.h * gridSize); y += gridSize) {
            for (let x = 0; x < bounds.width - (size.w * gridSize); x += gridSize) {
              const position = { x, y };
              if (state.isValidPosition(position, size)) {
                return position;
              }
            }
          }
          
          // If no empty position found, return bottom right
          return { x: 0, y: 0 };
        },

        // Collision detection
        checkWidgetCollision: (widget, newPosition, newSize) => {
          const state = get();
          const position = newPosition || widget.position;
          const size = newSize || widget.size;
          
          return state.widgets.some(otherWidget => {
            if (otherWidget.id === widget.id) return false;
            return checkCollision(
              { position, size } as any,
              [otherWidget]
            );
          });
        },

        getOverlappingWidgets: (widget, newPosition, newSize) => {
          const state = get();
          const position = newPosition || widget.position;
          const size = newSize || widget.size;
          
          return state.widgets
            .filter(otherWidget => {
              if (otherWidget.id === widget.id) return false;
              return checkCollision(
                { position, size } as any,
                [otherWidget]
              );
            })
            .map(w => w.id);
        },

        // Drag state management
        setDragging: (dragging, widgetId) => {
          set((state) => {
            state.isDragging = dragging;
            state.draggedWidgetId = dragging ? (widgetId || null) : null;
            if (!dragging) {
              state.dragPreview = null;
            }
          });
        },

        setResizing: (resizing, widgetId) => {
          set((state) => {
            state.isResizing = resizing;
            state.resizingWidgetId = resizing ? (widgetId || null) : null;
          });
        },

        setDragPreview: (preview) => {
          set((state) => {
            state.dragPreview = preview;
          });
        },

        // Utility functions
        getWidget: (id) => {
          return get().widgets.find(w => w.id === id) || null;
        },

        getSelectedWidgets: () => {
          const state = get();
          return state.widgets.filter(w => state.selectedWidgetIds.includes(w.id));
        },

        getWidgetAt: (position) => {
          const state = get();
          return state.widgets.find(widget => {
            const bounds = {
              left: widget.position.x,
              right: widget.position.x + widget.size.w * state.gridSize,
              top: widget.position.y,
              bottom: widget.position.y + widget.size.h * state.gridSize,
            };
            
            return (
              position.x >= bounds.left &&
              position.x <= bounds.right &&
              position.y >= bounds.top &&
              position.y <= bounds.bottom
            );
          }) || null;
        },

        getLayoutBounds: () => {
          const state = get();
          const widgets = state.widgets;
          
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
            maxX = Math.max(maxX, widget.position.x + (widget.size.w * state.gridSize));
            maxY = Math.max(maxY, widget.position.y + (widget.size.h * state.gridSize));
          });
          
          return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
        },
      })),
      {
        name: 'sensecanvas-layout',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          currentLayout: state.currentLayout,
          widgets: state.widgets,
          gridSize: state.gridSize,
          savedLayouts: state.savedLayouts,
          snapToGrid: state.snapToGrid,
          showGrid: state.showGrid,
          autoSave: state.autoSave,
        }),
      }
    )
  )
);