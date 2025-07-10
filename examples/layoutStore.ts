/**
 * layoutStore.ts - State Management Examples
 * 
 * This file demonstrates both Svelte 5 and React 19+ state management patterns
 * for widget layout persistence and management.
 */

// ============================================================================
// REACT 19+ VERSION - Zustand Store with Persistence
// ============================================================================

/**
 * React 19+ Zustand Store Example
 * 
 * Demonstrates:
 * - Zustand for lightweight client state management
 * - Persistence middleware for layout saving
 * - Immer integration for immutable updates
 * - TypeScript integration with strict typing
 * - Integration with TanStack Query for server state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WidgetConfig, DashboardLayout, Position, Size } from '../types/widget';

interface LayoutState {
  // Current layout state
  currentLayout: DashboardLayout;
  widgets: WidgetConfig[];
  gridSize: number;
  editMode: boolean;
  selectedWidgetId: string | null;
  
  // UI state
  isDragging: boolean;
  dragPreview: { position: Position; size: Size } | null;
  
  // Layout presets
  savedLayouts: DashboardLayout[];
  
  // Actions for widget management
  addWidget: (widget: Omit<WidgetConfig, 'id' | 'created' | 'modified'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  updateWidgetPosition: (id: string, position: Position) => void;
  updateWidgetSize: (id: string, size: Size) => void;
  selectWidget: (id: string | null) => void;
  
  // Layout actions
  setEditMode: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  saveCurrentLayout: (name: string, description?: string) => void;
  loadLayout: (layout: DashboardLayout) => void;
  resetLayout: () => void;
  
  // Import/Export
  exportLayout: () => string;
  importLayout: (layoutJson: string) => boolean;
  
  // Grid utilities
  isValidPosition: (position: Position, size: Size) => boolean;
  snapToGrid: (position: Position) => Position;
  getGridBounds: () => { width: number; height: number };
  
  // Drag state management
  setDragging: (dragging: boolean) => void;
  setDragPreview: (preview: { position: Position; size: Size } | null) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      currentLayout: {
        id: 'default',
        name: 'Default Layout',
        widgets: [],
        gridSize: 20,
        theme: 'cyberpunk',
        backgroundEffects: {
          particles: true,
          scanlines: false,
          glowGrid: true
        },
        created: Date.now(),
        modified: Date.now(),
        version: '1.0.0'
      },
      widgets: [],
      gridSize: 20,
      editMode: false,
      selectedWidgetId: null,
      isDragging: false,
      dragPreview: null,
      savedLayouts: [],

      // Widget management actions
      addWidget: (widgetData) =>
        set((state) => {
          const widget: WidgetConfig = {
            ...widgetData,
            id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created: Date.now(),
            modified: Date.now(),
          };
          
          state.widgets.push(widget);
          state.currentLayout.widgets = state.widgets;
          state.currentLayout.modified = Date.now();
        }),

      removeWidget: (id) =>
        set((state) => {
          state.widgets = state.widgets.filter(w => w.id !== id);
          state.currentLayout.widgets = state.widgets;
          state.currentLayout.modified = Date.now();
          
          if (state.selectedWidgetId === id) {
            state.selectedWidgetId = null;
          }
        }),

      updateWidget: (id, updates) =>
        set((state) => {
          const index = state.widgets.findIndex(w => w.id === id);
          if (index !== -1) {
            state.widgets[index] = { 
              ...state.widgets[index], 
              ...updates, 
              modified: Date.now() 
            };
            state.currentLayout.widgets = state.widgets;
            state.currentLayout.modified = Date.now();
          }
        }),

      updateWidgetPosition: (id, position) =>
        set((state) => {
          const widget = state.widgets.find(w => w.id === id);
          if (widget) {
            widget.position = position;
            widget.modified = Date.now();
            state.currentLayout.modified = Date.now();
          }
        }),

      updateWidgetSize: (id, size) =>
        set((state) => {
          const widget = state.widgets.find(w => w.id === id);
          if (widget) {
            widget.size = size;
            widget.modified = Date.now();
            state.currentLayout.modified = Date.now();
          }
        }),

      selectWidget: (id) =>
        set((state) => {
          state.selectedWidgetId = id;
        }),

      // Layout management
      setEditMode: (enabled) =>
        set((state) => {
          state.editMode = enabled;
          if (!enabled) {
            state.selectedWidgetId = null;
            state.isDragging = false;
            state.dragPreview = null;
          }
        }),

      setGridSize: (size) =>
        set((state) => {
          state.gridSize = size;
          state.currentLayout.gridSize = size;
          state.currentLayout.modified = Date.now();
        }),

      saveCurrentLayout: (name, description) =>
        set((state) => {
          const layout: DashboardLayout = {
            ...state.currentLayout,
            id: `layout-${Date.now()}`,
            name,
            description,
            created: Date.now(),
            modified: Date.now(),
          };
          
          state.savedLayouts.push(layout);
        }),

      loadLayout: (layout) =>
        set((state) => {
          state.currentLayout = { ...layout, modified: Date.now() };
          state.widgets = [...layout.widgets];
          state.gridSize = layout.gridSize;
          state.selectedWidgetId = null;
          state.editMode = false;
        }),

      resetLayout: () =>
        set((state) => {
          state.widgets = [];
          state.currentLayout.widgets = [];
          state.currentLayout.modified = Date.now();
          state.selectedWidgetId = null;
          state.editMode = false;
        }),

      // Import/Export functionality
      exportLayout: () => {
        const state = get();
        return JSON.stringify({
          layout: state.currentLayout,
          widgets: state.widgets,
          exportedAt: Date.now(),
          version: '1.0.0'
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
                modified: Date.now()
              };
              state.widgets = imported.widgets.map((w: WidgetConfig) => ({
                ...w,
                id: `imported-${w.id}-${Date.now()}`,
                modified: Date.now()
              }));
              state.gridSize = imported.layout.gridSize || 20;
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      // Grid utilities
      isValidPosition: (position, size) => {
        const state = get();
        const bounds = state.getGridBounds();
        
        return (
          position.x >= 0 &&
          position.y >= 0 &&
          position.x + (size.w * state.gridSize) <= bounds.width &&
          position.y + (size.h * state.gridSize) <= bounds.height
        );
      },

      snapToGrid: (position) => {
        const { gridSize } = get();
        return {
          x: Math.round(position.x / gridSize) * gridSize,
          y: Math.round(position.y / gridSize) * gridSize,
        };
      },

      getGridBounds: () => {
        // This would typically get the actual container dimensions
        return { width: 1200, height: 800 };
      },

      // Drag state management
      setDragging: (dragging) =>
        set((state) => {
          state.isDragging = dragging;
          if (!dragging) {
            state.dragPreview = null;
          }
        }),

      setDragPreview: (preview) =>
        set((state) => {
          state.dragPreview = preview;
        }),
    })),
    {
      name: 'sensecanvas-layout',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLayout: state.currentLayout,
        widgets: state.widgets,
        gridSize: state.gridSize,
        savedLayouts: state.savedLayouts,
      }),
    }
  )
);

// ============================================================================
// ORIGINAL SVELTE 5 VERSION (for comparison)
// ============================================================================

/**
 * Original Svelte 5 Implementation
 * 
 * Shows the Svelte runes approach for comparison with React patterns
 */

// import { browser } from '$app/environment';
// import type { WidgetConfig, DashboardLayout, Position, Size } from '$lib/types/widget';

// // Svelte 5 reactive state
// let currentLayout = $state<DashboardLayout>({
//   id: 'default',
//   name: 'Default Layout',
//   widgets: [],
//   gridSize: 20,
//   theme: 'cyberpunk',
//   backgroundEffects: {
//     particles: true,
//     scanlines: false,
//     glowGrid: true
//   },
//   created: Date.now(),
//   modified: Date.now(),
//   version: '1.0.0'
// });

// let widgets = $state<WidgetConfig[]>([]);
// let gridSize = $state(20);
// let editMode = $state(false);
// let selectedWidgetId = $state<string | null>(null);

// // Derived values
// const isValid = $derived((position: Position, size: Size) => {
//   return position.x >= 0 && 
//          position.y >= 0 && 
//          position.x + (size.w * gridSize) <= 1200 &&
//          position.y + (size.h * gridSize) <= 800;
// });

// // Effects for persistence
// $effect(() => {
//   if (browser) {
//     const saved = localStorage.getItem('sensecanvas-layout');
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         currentLayout = parsed.currentLayout;
//         widgets = parsed.widgets;
//         gridSize = parsed.gridSize;
//       } catch (error) {
//         console.error('Failed to load saved layout:', error);
//       }
//     }
//   }
// });

// $effect(() => {
//   if (browser) {
//     localStorage.setItem('sensecanvas-layout', JSON.stringify({
//       currentLayout,
//       widgets,
//       gridSize
//     }));
//   }
// });

// // Export store interface
// export const layoutStore = {
//   // Getters
//   get current() { return currentLayout; },
//   get widgets() { return widgets; },
//   get gridSize() { return gridSize; },
//   get editMode() { return editMode; },
//   get selectedWidgetId() { return selectedWidgetId; },
  
//   // Actions
//   addWidget(widget: Omit<WidgetConfig, 'id' | 'created' | 'modified'>) {
//     const newWidget: WidgetConfig = {
//       ...widget,
//       id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       created: Date.now(),
//       modified: Date.now(),
//     };
//     widgets = [...widgets, newWidget];
//     currentLayout.widgets = widgets;
//     currentLayout.modified = Date.now();
//   },
  
//   removeWidget(id: string) {
//     widgets = widgets.filter(w => w.id !== id);
//     currentLayout.widgets = widgets;
//     currentLayout.modified = Date.now();
//     if (selectedWidgetId === id) {
//       selectedWidgetId = null;
//     }
//   },
  
//   updateWidgetPosition(id: string, position: Position) {
//     const index = widgets.findIndex(w => w.id === id);
//     if (index !== -1) {
//       widgets[index] = { 
//         ...widgets[index], 
//         position, 
//         modified: Date.now() 
//       };
//       currentLayout.modified = Date.now();
//     }
//   },
  
//   setEditMode(enabled: boolean) {
//     editMode = enabled;
//     if (!enabled) {
//       selectedWidgetId = null;
//     }
//   },
  
//   isValidPosition: isValid,
  
//   snapToGrid(position: Position): Position {
//     return {
//       x: Math.round(position.x / gridSize) * gridSize,
//       y: Math.round(position.y / gridSize) * gridSize,
//     };
//   }
// };

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

// React 19+ Usage:
/*
import { useLayoutStore } from './stores/layoutStore';

const Dashboard = () => {
  const { 
    widgets, 
    editMode, 
    addWidget, 
    setEditMode,
    updateWidgetPosition 
  } = useLayoutStore();

  const handleAddGauge = () => {
    addWidget({
      type: 'gauge',
      title: 'CPU Usage',
      sensorPath: 'cpu.usage',
      position: { x: 0, y: 0 },
      size: { w: 4, h: 4 },
      minSize: { w: 2, h: 2 },
      maxSize: { w: 8, h: 8 },
      theme: 'cyberpunk',
      alerts: [],
      config: {
        gaugeType: 'arc',
        startAngle: -90,
        endAngle: 90,
        thickness: 20,
        showValue: true,
        animated: true,
        glowEffect: true
      }
    });
  };

  return (
    <div>
      <button onClick={() => setEditMode(!editMode)}>
        {editMode ? 'Exit Edit' : 'Edit Layout'}
      </button>
      <button onClick={handleAddGauge}>Add CPU Gauge</button>
      <DashboardGrid widgets={widgets} editMode={editMode} />
    </div>
  );
};
*/

// Svelte 5 Usage:
/*
<script lang="ts">
  import { layoutStore } from '$lib/stores/layoutStore';
  import DashboardGrid from '$lib/components/DashboardGrid.svelte';

  function handleAddGauge() {
    layoutStore.addWidget({
      type: 'gauge',
      title: 'CPU Usage',
      sensorPath: 'cpu.usage',
      position: { x: 0, y: 0 },
      size: { w: 4, h: 4 },
      theme: 'cyberpunk',
      config: { gaugeType: 'arc', animated: true }
    });
  }
</script>

<button onclick={() => layoutStore.setEditMode(!layoutStore.editMode)}>
  {layoutStore.editMode ? 'Exit Edit' : 'Edit Layout'}
</button>

<button onclick={handleAddGauge}>Add CPU Gauge</button>

<DashboardGrid widgets={layoutStore.widgets} editMode={layoutStore.editMode} />
*/ 