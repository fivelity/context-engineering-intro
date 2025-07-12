<!--
SenseCanvas Dashboard Grid Component
CSS Grid-based dashboard with NeoDrag bounds, collision detection, and edit mode.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Widget } from '../widgets/index.js';
  import { dashboardStore } from '../../stores/dashboard.svelte.js';
  import type { WidgetConfig } from '../../types/widgets.js';

  interface Props {
    className?: string;
  }

  let { className = '' }: Props = $props();

  const dispatch = createEventDispatcher<{
    widgetAdded: { type: string; position: { x: number; y: number } };
    widgetSelected: string;
    editModeChanged: boolean;
  }>();

  // ✅ Using Svelte 5 runes for grid state
  let gridContainer = $state<HTMLElement>();
  let isDragging = $state(false);
  let dragStartPosition = $state<{ x: number; y: number } | null>(null);
  let mousePosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
  let showDropZone = $state(false);

  // ✅ Derived values for grid rendering
  let gridStyles = $derived(() => {
    const { cellSize, gap, cols, rows } = dashboardStore.gridConfig;
    const { width, height } = dashboardStore.canvasSize;
    
    return [
      `width: ${width}px`,
      `height: ${height}px`,
      `transform: scale(${dashboardStore.zoomLevel})`,
      `transform-origin: top left`,
      `background-size: ${cellSize + gap}px ${cellSize + gap}px`,
      `background-image: ${dashboardStore.showGrid ? getGridPattern() : 'none'}`
    ].join('; ');
  });

  let gridClasses = $derived(() => {
    const classes = ['dashboard-grid', className];
    if (dashboardStore.isEditMode) classes.push('edit-mode');
    if (isDragging) classes.push('dragging');
    if (showDropZone) classes.push('drop-zone-active');
    if (dashboardStore.hasCollisions) classes.push('has-collisions');
    return classes.join(' ');
  });

  let dropZonePosition = $derived(() => {
    if (!showDropZone || !dragStartPosition) return null;
    
    const { cellSize, gap } = dashboardStore.gridConfig;
    const snapSize = cellSize + gap;
    
    return {
      x: Math.floor(mousePosition.x / snapSize) * snapSize,
      y: Math.floor(mousePosition.y / snapSize) * snapSize,
      width: 200,
      height: 200
    };
  });

  // ✅ Using $effect for keyboard shortcuts
  $effect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!dashboardStore.isEditMode) return;

      // Delete selected widget
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (dashboardStore.selectedWidgetId) {
          dashboardStore.removeWidget(dashboardStore.selectedWidgetId);
        }
      }

      // Copy widget (Ctrl+C)
      if (e.key === 'c' && e.ctrlKey) {
        if (dashboardStore.selectedWidgetId) {
          dashboardStore.copyWidget(dashboardStore.selectedWidgetId);
        }
      }

      // Paste widget (Ctrl+V)
      if (e.key === 'v' && e.ctrlKey) {
        const position = getMouseGridPosition();
        dashboardStore.pasteWidget(position);
      }

      // Duplicate widget (Ctrl+D)
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        if (dashboardStore.selectedWidgetId) {
          dashboardStore.duplicateWidget(dashboardStore.selectedWidgetId);
        }
      }

      // Toggle grid (Ctrl+G)
      if (e.key === 'g' && e.ctrlKey) {
        e.preventDefault();
        dashboardStore.setShowGrid(!dashboardStore.showGrid);
      }

      // Toggle snap to grid (Ctrl+Shift+G)
      if (e.key === 'g' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        dashboardStore.setSnapToGrid(!dashboardStore.snapToGrid);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        dashboardStore.selectWidget(null);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeydown);
      return () => document.removeEventListener('keydown', handleKeydown);
    }
  });

  // ✅ Using $effect for mouse tracking
  $effect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gridContainer) return;
      
      const rect = gridContainer.getBoundingClientRect();
      const scale = dashboardStore.zoomLevel;
      
      mousePosition = {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale
      };
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  });

  function getGridPattern(): string {
    const { cellSize, gap } = dashboardStore.gridConfig;
    const size = cellSize + gap;
    
    return `
      linear-gradient(to right, rgba(34, 211, 238, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
    `;
  }

  function getMouseGridPosition(): { x: number; y: number } {
    const { cellSize, gap } = dashboardStore.gridConfig;
    const snapSize = cellSize + gap;
    
    return {
      x: Math.floor(mousePosition.x / snapSize) * snapSize,
      y: Math.floor(mousePosition.y / snapSize) * snapSize
    };
  }

  function handleGridClick(event: MouseEvent) {
    if (!dashboardStore.isEditMode) return;
    
    // Deselect widgets if clicking on empty space
    const target = event.target as HTMLElement;
    if (target === gridContainer) {
      dashboardStore.selectWidget(null);
    }
  }

  function handleGridDoubleClick(event: MouseEvent) {
    if (!dashboardStore.isEditMode) return;

    const target = event.target as HTMLElement;
    if (target === gridContainer) {
      const position = getMouseGridPosition();
      dispatch('widgetAdded', { type: 'gauge', position });
    }
  }

  function handleWidgetPositionChanged(event: CustomEvent<{ id: string; x: number; y: number }>) {
    const { id, x, y } = event.detail;
    dashboardStore.updateWidgetPosition(id, x, y);
  }

  function handleWidgetSizeChanged(event: CustomEvent<{ id: string; width: number; height: number }>) {
    const { id, width, height } = event.detail;
    dashboardStore.updateWidgetSize(id, width, height);
  }

  function handleWidgetSelected(event: CustomEvent<string>) {
    dashboardStore.selectWidget(event.detail);
    dispatch('widgetSelected', event.detail);
  }

  function handleWidgetDelete(event: CustomEvent<string>) {
    dashboardStore.removeWidget(event.detail);
  }

  function handleWidgetConfigChanged(event: CustomEvent<WidgetConfig>) {
    dashboardStore.updateWidget(event.detail.id, event.detail);
  }

  // Drag and drop for widget creation
  function handleDragOver(event: DragEvent) {
    if (!dashboardStore.isEditMode) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'copy';
    showDropZone = true;
  }

  function handleDragLeave(event: DragEvent) {
    // Only hide drop zone if leaving the grid container
    if (!gridContainer?.contains(event.relatedTarget as Node)) {
      showDropZone = false;
    }
  }

  function handleDrop(event: DragEvent) {
    if (!dashboardStore.isEditMode) return;
    
    event.preventDefault();
    showDropZone = false;
    
    const widgetType = event.dataTransfer?.getData('text/widget-type');
    if (widgetType) {
      const position = getMouseGridPosition();
      dispatch('widgetAdded', { type: widgetType, position });
    }
  }

  // Touch support for mobile
  function handleTouchStart(event: TouchEvent) {
    if (!dashboardStore.isEditMode) return;
    
    const touch = event.touches[0];
    dragStartPosition = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd() {
    dragStartPosition = null;
    isDragging = false;
  }

  // Grid zoom functions
  function zoomIn() {
    dashboardStore.setZoom(dashboardStore.zoomLevel + 0.25);
  }

  function zoomOut() {
    dashboardStore.setZoom(dashboardStore.zoomLevel - 0.25);
  }

  function resetZoom() {
    dashboardStore.setZoom(1.0);
  }

  // Grid utilities
  function centerView() {
    if (!gridContainer) return;
    
    gridContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  function fitToScreen() {
    if (!gridContainer) return;
    
    const container = gridContainer.parentElement;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const gridRect = gridContainer.getBoundingClientRect();
    
    const scaleX = containerRect.width / gridRect.width;
    const scaleY = containerRect.height / gridRect.height;
    const scale = Math.min(scaleX, scaleY, 1.0);
    
    dashboardStore.setZoom(scale);
  }
</script>

<!-- Dashboard Grid Container -->
<div 
  bind:this={gridContainer}
  class={gridClasses}
  style={gridStyles}
  onclick={handleGridClick}
  ondblclick={handleGridDoubleClick}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
  role="application"
  aria-label="Dashboard grid"
>
  <!-- Grid Background -->
  <div class="grid-background"></div>

  <!-- Widgets -->
  {#each dashboardStore.widgets as widget (widget.id)}
    <Widget
      config={widget}
      isEditMode={dashboardStore.isEditMode}
      isSelected={widget.id === dashboardStore.selectedWidgetId}
      gridBounds={dashboardStore.gridBounds}
      on:positionChanged={handleWidgetPositionChanged}
      on:sizeChanged={handleWidgetSizeChanged}
      on:selected={handleWidgetSelected}
      on:delete={handleWidgetDelete}
      on:configChanged={handleWidgetConfigChanged}
    />
  {/each}

  <!-- Drop Zone Indicator -->
  {#if showDropZone && dropZonePosition}
    <div 
      class="drop-zone-indicator"
      style="
        left: {dropZonePosition.x}px;
        top: {dropZonePosition.y}px;
        width: {dropZonePosition.width}px;
        height: {dropZonePosition.height}px;
      "
    >
      <div class="drop-zone-content">
        <div class="drop-zone-icon">📊</div>
        <div class="drop-zone-text">Drop Widget Here</div>
      </div>
    </div>
  {/if}

  <!-- Grid Controls (Edit Mode) -->
  {#if dashboardStore.isEditMode}
    <div class="grid-controls">
      <div class="control-group">
        <button 
          class="control-btn"
          onclick={zoomOut}
          disabled={dashboardStore.zoomLevel <= 0.25}
          title="Zoom Out"
        >
          🔍−
        </button>
        
        <span class="zoom-display">
          {Math.round(dashboardStore.zoomLevel * 100)}%
        </span>
        
        <button 
          class="control-btn"
          onclick={zoomIn}
          disabled={dashboardStore.zoomLevel >= 2.0}
          title="Zoom In"
        >
          🔍+
        </button>
        
        <button 
          class="control-btn"
          onclick={resetZoom}
          title="Reset Zoom"
        >
          🎯
        </button>
      </div>

      <div class="control-group">
        <button 
          class="control-btn"
          class:active={dashboardStore.showGrid}
          onclick={() => dashboardStore.setShowGrid(!dashboardStore.showGrid)}
          title="Toggle Grid"
        >
          #
        </button>
        
        <button 
          class="control-btn"
          class:active={dashboardStore.snapToGrid}
          onclick={() => dashboardStore.setSnapToGrid(!dashboardStore.snapToGrid)}
          title="Snap to Grid"
        >
          🧲
        </button>
        
        <button 
          class="control-btn"
          onclick={centerView}
          title="Center View"
        >
          🎯
        </button>
        
        <button 
          class="control-btn"
          onclick={fitToScreen}
          title="Fit to Screen"
        >
          📐
        </button>
      </div>
    </div>
  {/if}

  <!-- Grid Stats (Edit Mode) -->
  {#if dashboardStore.isEditMode}
    <div class="grid-stats">
      <div class="stat-item">
        <span class="stat-label">Widgets:</span>
        <span class="stat-value">{dashboardStore.stats.totalWidgets}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Utilization:</span>
        <span class="stat-value">{dashboardStore.stats.gridUtilization.toFixed(1)}%</span>
      </div>
      {#if dashboardStore.hasCollisions}
        <div class="stat-item collision-warning">
          <span class="stat-label">⚠️ Collisions Detected</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dashboard-grid {
    @apply relative bg-gray-950 overflow-hidden;
    position: relative;
    min-width: 100%;
    min-height: 100%;
  }

  .grid-background {
    @apply absolute inset-0 pointer-events-none;
    background-repeat: repeat;
  }

  .edit-mode {
    @apply cursor-crosshair;
  }

  .edit-mode:hover {
    @apply bg-gray-950/95;
  }

  .dragging {
    @apply cursor-grabbing;
  }

  .has-collisions {
    @apply border-2 border-red-400/50;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
  }

  .drop-zone-active {
    @apply bg-cyan-950/20;
  }

  .drop-zone-indicator {
    @apply absolute border-2 border-dashed border-cyan-400 bg-cyan-950/30;
    @apply rounded-lg flex items-center justify-center;
    animation: drop-zone-pulse 1s ease-in-out infinite;
    z-index: 1000;
  }

  .drop-zone-content {
    @apply text-center text-cyan-400;
  }

  .drop-zone-icon {
    @apply text-2xl mb-1;
  }

  .drop-zone-text {
    @apply text-sm font-medium;
  }

  .grid-controls {
    @apply absolute top-4 right-4 flex flex-col gap-2;
    @apply bg-black/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3;
  }

  .control-group {
    @apply flex items-center gap-2;
  }

  .control-btn {
    @apply w-8 h-8 flex items-center justify-center rounded;
    @apply bg-gray-800 border border-gray-600 text-gray-300 text-sm;
    @apply hover:bg-gray-700 hover:border-cyan-400/50 transition-colors;
  }

  .control-btn.active {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
  }

  .control-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .zoom-display {
    @apply text-xs text-gray-400 min-w-[3rem] text-center;
  }

  .grid-stats {
    @apply absolute bottom-4 right-4 flex flex-col gap-1;
    @apply bg-black/70 backdrop-blur-sm border border-gray-700 rounded-lg p-3;
  }

  .stat-item {
    @apply flex justify-between gap-2 text-xs;
  }

  .stat-label {
    @apply text-gray-400;
  }

  .stat-value {
    @apply text-cyan-400 font-mono;
  }

  .collision-warning {
    @apply text-red-400 font-bold;
  }

  .collision-warning .stat-label {
    @apply text-red-400;
  }

  @keyframes drop-zone-pulse {
    0%, 100% { 
      border-color: #22d3ee; 
      background-color: rgba(6, 182, 212, 0.1);
    }
    50% { 
      border-color: #06b6d4; 
      background-color: rgba(6, 182, 212, 0.2);
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .grid-controls {
      @apply top-2 right-2 p-2;
    }

    .control-btn {
      @apply w-6 h-6 text-xs;
    }

    .grid-stats {
      @apply bottom-2 right-2 p-2;
    }

    .stat-item {
      @apply text-xs;
    }
  }
</style>