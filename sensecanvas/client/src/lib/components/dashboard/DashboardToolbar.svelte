<!--
SenseCanvas Dashboard Toolbar Component
Toolbar with edit mode controls, widget library, and layout management.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { dashboardStore } from '../../stores/dashboard.svelte.js';
  import { createWidget, getWidgetIcon, getWidgetDescription } from '../widgets/index.js';

  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();

  const dispatch = createEventDispatcher<{
    editModeToggled: boolean;
    widgetLibraryOpened: void;
    configuratorOpened: void;
    dashboardExported: void;
    dashboardImported: void;
  }>();

  // ✅ Using Svelte 5 runes for toolbar state
  let showWidgetPalette = $state(false);
  let showLayoutTools = $state(false);
  let draggedWidgetType = $state<string | null>(null);

  // Widget types available in the palette
  const widgetTypes = [
    { type: 'gauge', name: 'Gauge', description: 'Circular progress indicator' },
    { type: 'graph', name: 'Graph', description: 'Time-series line chart' },
    { type: 'text', name: 'Text', description: 'Customizable text display' },
    { type: 'multi-sensor', name: 'Multi-Sensor', description: 'Multiple sensor grid' }
  ];

  // ✅ Derived toolbar state
  let toolbarClasses = $derived(() => {
    const classes = ['dashboard-toolbar', className];
    if (dashboardStore.isEditMode) classes.push('edit-mode');
    return classes.join(' ');
  });

  let selectedWidgetInfo = $derived(() => {
    const widget = dashboardStore.selectedWidget;
    if (!widget) return null;
    
    return {
      title: widget.title,
      type: widget.type,
      position: `${widget.position.x}, ${widget.position.y}`,
      size: `${widget.size.width} × ${widget.size.height}`,
      zIndex: widget.zIndex || 1
    };
  });

  function toggleEditMode() {
    const newMode = !dashboardStore.isEditMode;
    dashboardStore.setEditMode(newMode);
    dispatch('editModeToggled', newMode);
  }

  function addWidget(type: string) {
    dashboardStore.addWidget(type);
    showWidgetPalette = false;
  }

  function duplicateSelected() {
    if (dashboardStore.selectedWidgetId) {
      dashboardStore.duplicateWidget(dashboardStore.selectedWidgetId);
    }
  }

  function deleteSelected() {
    if (dashboardStore.selectedWidgetId) {
      dashboardStore.removeWidget(dashboardStore.selectedWidgetId);
    }
  }

  function copySelected() {
    if (dashboardStore.selectedWidgetId) {
      dashboardStore.copyWidget(dashboardStore.selectedWidgetId);
    }
  }

  function pasteWidget() {
    dashboardStore.pasteWidget();
  }

  function clearDashboard() {
    if (confirm('Are you sure you want to clear all widgets?')) {
      dashboardStore.clearDashboard();
    }
  }

  function alignWidgets(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    dashboardStore.alignWidgets(alignment);
    showLayoutTools = false;
  }

  function distributeWidgets(direction: 'horizontal' | 'vertical') {
    dashboardStore.distributeWidgets(direction);
    showLayoutTools = false;
  }

  function exportDashboard() {
    const layout = dashboardStore.exportDashboard();
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layout.name.replace(/\s+/g, '_')}_dashboard.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    dispatch('dashboardExported');
  }

  function importDashboard() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target?.result as string);
          dashboardStore.loadDashboard(layout);
          dispatch('dashboardImported');
        } catch (error) {
          console.error('Failed to import dashboard:', error);
          alert('Invalid dashboard file');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  // Drag and drop for widget creation
  function handleWidgetDragStart(event: DragEvent, widgetType: string) {
    if (!event.dataTransfer) return;
    
    event.dataTransfer.setData('text/widget-type', widgetType);
    event.dataTransfer.effectAllowed = 'copy';
    draggedWidgetType = widgetType;
  }

  function handleWidgetDragEnd() {
    draggedWidgetType = null;
  }

  // Keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (!dashboardStore.isEditMode) return;

    // Ctrl+E to toggle edit mode
    if (event.key === 'e' && event.ctrlKey) {
      event.preventDefault();
      toggleEditMode();
    }

    // Ctrl+S to export dashboard
    if (event.key === 's' && event.ctrlKey) {
      event.preventDefault();
      exportDashboard();
    }

    // Ctrl+O to import dashboard
    if (event.key === 'o' && event.ctrlKey) {
      event.preventDefault();
      importDashboard();
    }
  }

  // ✅ Using $effect for keyboard shortcuts
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<div class={toolbarClasses}>
  <!-- Primary Toolbar -->
  <div class="toolbar-section primary">
    <!-- Edit Mode Toggle -->
    <button 
      class="toolbar-btn edit-toggle"
      class:active={dashboardStore.isEditMode}
      onclick={toggleEditMode}
      title="Toggle Edit Mode (Ctrl+E)"
    >
      <span class="btn-icon">{dashboardStore.isEditMode ? '✏️' : '👁️'}</span>
      <span class="btn-text">{dashboardStore.isEditMode ? 'Edit' : 'View'}</span>
    </button>

    <!-- Widget Palette -->
    {#if dashboardStore.isEditMode}
      <div class="toolbar-dropdown">
        <button 
          class="toolbar-btn"
          class:active={showWidgetPalette}
          onclick={() => showWidgetPalette = !showWidgetPalette}
          title="Widget Library"
        >
          <span class="btn-icon">🧩</span>
          <span class="btn-text">Widgets</span>
        </button>

        {#if showWidgetPalette}
          <div class="dropdown-content widget-palette">
            <div class="palette-header">
              <h3>Widget Library</h3>
              <button onclick={() => showWidgetPalette = false} class="close-btn">×</button>
            </div>
            
            <div class="widget-grid">
              {#each widgetTypes as widget}
                <div 
                  class="widget-item"
                  class:dragging={draggedWidgetType === widget.type}
                  draggable="true"
                  ondragstart={(e) => handleWidgetDragStart(e, widget.type)}
                  ondragend={handleWidgetDragEnd}
                  onclick={() => addWidget(widget.type)}
                  role="button"
                  tabindex="0"
                  title={widget.description}
                >
                  <div class="widget-icon">{getWidgetIcon(widget.type)}</div>
                  <div class="widget-name">{widget.name}</div>
                  <div class="widget-desc">{widget.description}</div>
                </div>
              {/each}
            </div>
            
            <div class="palette-footer">
              <button 
                class="palette-btn"
                onclick={() => dispatch('widgetLibraryOpened')}
              >
                Browse Library
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Selected Widget Info -->
    {#if dashboardStore.isEditMode && selectedWidgetInfo}
      <div class="selected-widget-info">
        <div class="widget-title">{selectedWidgetInfo.title}</div>
        <div class="widget-details">
          <span class="detail-item">{selectedWidgetInfo.type}</span>
          <span class="detail-separator">•</span>
          <span class="detail-item">{selectedWidgetInfo.position}</span>
          <span class="detail-separator">•</span>
          <span class="detail-item">{selectedWidgetInfo.size}</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Edit Mode Tools -->
  {#if dashboardStore.isEditMode}
    <div class="toolbar-section edit-tools">
      <!-- Widget Actions -->
      <div class="tool-group">
        <button 
          class="tool-btn"
          onclick={duplicateSelected}
          disabled={!dashboardStore.selectedWidgetId}
          title="Duplicate Widget (Ctrl+D)"
        >
          📋
        </button>
        
        <button 
          class="tool-btn"
          onclick={copySelected}
          disabled={!dashboardStore.selectedWidgetId}
          title="Copy Widget (Ctrl+C)"
        >
          📄
        </button>
        
        <button 
          class="tool-btn"
          onclick={pasteWidget}
          disabled={!dashboardStore.clipboard}
          title="Paste Widget (Ctrl+V)"
        >
          📋
        </button>
        
        <button 
          class="tool-btn delete"
          onclick={deleteSelected}
          disabled={!dashboardStore.selectedWidgetId}
          title="Delete Widget (Delete)"
        >
          🗑️
        </button>
      </div>

      <div class="tool-separator"></div>

      <!-- Layout Tools -->
      <div class="toolbar-dropdown">
        <button 
          class="tool-btn"
          class:active={showLayoutTools}
          onclick={() => showLayoutTools = !showLayoutTools}
          title="Layout Tools"
        >
          📐
        </button>

        {#if showLayoutTools}
          <div class="dropdown-content layout-tools">
            <div class="tool-section">
              <h4>Alignment</h4>
              <div class="align-grid">
                <button onclick={() => alignWidgets('left')} title="Align Left">⬅️</button>
                <button onclick={() => alignWidgets('center')} title="Align Center">🔄</button>
                <button onclick={() => alignWidgets('right')} title="Align Right">➡️</button>
                <button onclick={() => alignWidgets('top')} title="Align Top">⬆️</button>
                <button onclick={() => alignWidgets('middle')} title="Align Middle">🔄</button>
                <button onclick={() => alignWidgets('bottom')} title="Align Bottom">⬇️</button>
              </div>
            </div>
            
            <div class="tool-section">
              <h4>Distribution</h4>
              <div class="distribute-btns">
                <button onclick={() => distributeWidgets('horizontal')}>
                  ↔️ Horizontal
                </button>
                <button onclick={() => distributeWidgets('vertical')}>
                  ↕️ Vertical
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <div class="tool-separator"></div>

      <!-- Grid Controls -->
      <div class="tool-group">
        <button 
          class="tool-btn"
          class:active={dashboardStore.showGrid}
          onclick={() => dashboardStore.setShowGrid(!dashboardStore.showGrid)}
          title="Toggle Grid (Ctrl+G)"
        >
          #
        </button>
        
        <button 
          class="tool-btn"
          class:active={dashboardStore.snapToGrid}
          onclick={() => dashboardStore.setSnapToGrid(!dashboardStore.snapToGrid)}
          title="Snap to Grid (Ctrl+Shift+G)"
        >
          🧲
        </button>
      </div>
    </div>
  {/if}

  <!-- Dashboard Actions -->
  <div class="toolbar-section actions">
    <div class="tool-group">
      <button 
        class="toolbar-btn"
        onclick={() => dispatch('configuratorOpened')}
        title="Widget Configurator"
      >
        <span class="btn-icon">⚙️</span>
        <span class="btn-text">Config</span>
      </button>
      
      <button 
        class="toolbar-btn"
        onclick={exportDashboard}
        title="Export Dashboard (Ctrl+S)"
      >
        <span class="btn-icon">💾</span>
        <span class="btn-text">Export</span>
      </button>
      
      <button 
        class="toolbar-btn"
        onclick={importDashboard}
        title="Import Dashboard (Ctrl+O)"
      >
        <span class="btn-icon">📁</span>
        <span class="btn-text">Import</span>
      </button>
    </div>

    {#if dashboardStore.isEditMode}
      <button 
        class="toolbar-btn danger"
        onclick={clearDashboard}
        title="Clear Dashboard"
      >
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">Clear</span>
      </button>
    {/if}
  </div>

  <!-- Dashboard Stats -->
  <div class="toolbar-section stats">
    <div class="stat-display">
      <span class="stat-value">{dashboardStore.stats.totalWidgets}</span>
      <span class="stat-label">widgets</span>
    </div>
    
    {#if dashboardStore.hasCollisions}
      <div class="collision-indicator" title="Widget collisions detected">
        ⚠️
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard-toolbar {
    @apply bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between;
    @apply shadow-lg backdrop-blur-sm;
    font-family: 'Orbitron', monospace;
  }

  .toolbar-section {
    @apply flex items-center gap-3;
  }

  .toolbar-btn {
    @apply flex items-center gap-2 px-3 py-2 rounded-lg;
    @apply bg-gray-800 border border-gray-600 text-gray-300;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .toolbar-btn.active {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
  }

  .toolbar-btn.danger {
    @apply border-red-400/50 text-red-400;
    @apply hover:bg-red-500/20 hover:border-red-400;
  }

  .btn-icon {
    @apply text-lg;
  }

  .btn-text {
    @apply text-sm font-medium;
  }

  .edit-toggle {
    @apply relative;
  }

  .edit-mode .edit-toggle {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }

  .toolbar-dropdown {
    @apply relative;
  }

  .dropdown-content {
    @apply absolute top-full mt-2 bg-gray-800 border border-gray-600 rounded-lg;
    @apply shadow-xl z-50 min-w-[300px];
  }

  .widget-palette {
    @apply p-4;
  }

  .palette-header {
    @apply flex justify-between items-center mb-3;
  }

  .palette-header h3 {
    @apply text-lg font-bold text-cyan-400;
  }

  .close-btn {
    @apply text-gray-400 hover:text-white text-xl;
  }

  .widget-grid {
    @apply grid grid-cols-2 gap-2 mb-3;
  }

  .widget-item {
    @apply p-3 border border-gray-600 rounded-lg cursor-pointer;
    @apply hover:border-cyan-400/50 hover:bg-gray-700/50 transition-colors;
  }

  .widget-item.dragging {
    @apply opacity-50;
  }

  .widget-icon {
    @apply text-2xl mb-1;
  }

  .widget-name {
    @apply font-bold text-sm text-gray-300 mb-1;
  }

  .widget-desc {
    @apply text-xs text-gray-400;
  }

  .palette-footer {
    @apply pt-3 border-t border-gray-600;
  }

  .palette-btn {
    @apply w-full px-3 py-2 bg-cyan-500/20 border border-cyan-400/30;
    @apply rounded text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors;
  }

  .selected-widget-info {
    @apply px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg;
  }

  .widget-title {
    @apply font-bold text-sm text-cyan-400;
  }

  .widget-details {
    @apply flex items-center gap-1 text-xs text-gray-400;
  }

  .detail-separator {
    @apply text-gray-600;
  }

  .edit-tools {
    @apply flex-1 justify-center;
  }

  .tool-group {
    @apply flex items-center gap-1;
  }

  .tool-btn {
    @apply w-8 h-8 flex items-center justify-center rounded;
    @apply bg-gray-800 border border-gray-600 text-gray-300 text-sm;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .tool-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .tool-btn.active {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
  }

  .tool-btn.delete {
    @apply border-red-400/50 text-red-400;
    @apply hover:bg-red-500/20 hover:border-red-400;
  }

  .tool-separator {
    @apply w-px h-6 bg-gray-600;
  }

  .layout-tools {
    @apply p-3;
  }

  .tool-section {
    @apply mb-3 last:mb-0;
  }

  .tool-section h4 {
    @apply text-sm font-bold text-gray-300 mb-2;
  }

  .align-grid {
    @apply grid grid-cols-3 gap-1;
  }

  .align-grid button {
    @apply w-8 h-8 flex items-center justify-center rounded;
    @apply bg-gray-700 border border-gray-600 text-gray-300;
    @apply hover:bg-gray-600 hover:border-cyan-400/50 transition-colors;
  }

  .distribute-btns {
    @apply flex gap-2;
  }

  .distribute-btns button {
    @apply px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs;
    @apply hover:bg-gray-600 hover:border-cyan-400/50 transition-colors;
  }

  .stat-display {
    @apply flex flex-col items-center;
  }

  .stat-value {
    @apply text-lg font-bold text-cyan-400;
  }

  .stat-label {
    @apply text-xs text-gray-400;
  }

  .collision-indicator {
    @apply text-red-400 text-lg animate-pulse;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .dashboard-toolbar {
      @apply flex-wrap gap-2 p-2;
    }

    .toolbar-section {
      @apply gap-2;
    }

    .btn-text {
      @apply hidden;
    }

    .selected-widget-info {
      @apply order-last w-full;
    }

    .dropdown-content {
      @apply min-w-[250px];
    }

    .widget-grid {
      @apply grid-cols-1;
    }
  }
</style>