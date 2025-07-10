<!--
  DashboardGrid.svelte
  
  Example implementation of a dashboard grid layout for SenseCanvas
  Demonstrates:
  - CSS Grid with dynamic sizing
  - Grid snapping and positioning
  - Widget collision detection
  - Responsive layout
  - Theme-aware styling
-->

<script lang="ts">
  // Note: This is an example - actual imports would be from SvelteKit project
  // import { layoutStore } from '$lib/stores/layoutStore';
  // import type { WidgetPosition } from '$lib/types/widget';
  
  interface WidgetPosition {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }

  // Props
  let { 
    widgets = [] as WidgetPosition[],
    gridSize = 20,
    showGrid = false,
    editMode = false,
    onWidgetMove,
    onWidgetResize
  }: {
    widgets?: WidgetPosition[];
    gridSize?: number;
    showGrid?: boolean;
    editMode?: boolean;
    onWidgetMove?: (id: string, position: { x: number; y: number }) => void;
    onWidgetResize?: (id: string, size: { w: number; h: number }) => void;
  } = $props();

  // Grid dimensions (calculated from container size)
  let gridCols = $derived(Math.floor(1200 / gridSize)); // Assume 1200px container
  let gridRows = $derived(Math.floor(800 / gridSize));  // Assume 800px container
  
  // Grid container element
  let gridContainer: HTMLElement;
  
  // Calculate grid template based on gridSize
  let gridTemplate = $derived({
    gridTemplateColumns: `repeat(${gridCols}, ${gridSize}px)`,
    gridTemplateRows: `repeat(${gridRows}, ${gridSize}px)`,
    gap: '2px'
  });
  
  // Convert widget position to CSS Grid placement
  function getGridPlacement(widget: WidgetPosition) {
    return {
      gridColumnStart: Math.floor(widget.x / gridSize) + 1,
      gridColumnEnd: Math.floor(widget.x / gridSize) + widget.w + 1,
      gridRowStart: Math.floor(widget.y / gridSize) + 1,
      gridRowEnd: Math.floor(widget.y / gridSize) + widget.h + 1
    };
  }
  
  // Check if position is valid (no collisions, within bounds)
  function isValidPosition(widget: WidgetPosition, excludeId?: string): boolean {
    // Check bounds
    if (widget.x < 0 || widget.y < 0) return false;
    if (widget.x + widget.w * gridSize > gridCols * gridSize) return false;
    if (widget.y + widget.h * gridSize > gridRows * gridSize) return false;
    
    // Check collisions with other widgets
    return !widgets.some(w => {
      if (w.id === excludeId) return false;
      
      return !(
        widget.x >= w.x + w.w * gridSize ||
        widget.x + widget.w * gridSize <= w.x ||
        widget.y >= w.y + w.h * gridSize ||
        widget.y + widget.h * gridSize <= w.y
      );
    });
  }
  
  // Snap coordinates to grid
  function snapToGrid(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }
  
  // Handle widget drag start
  function handleDragStart(event: DragEvent, widget: WidgetPosition) {
    if (!editMode) return;
    
    event.dataTransfer?.setData('application/json', JSON.stringify({
      type: 'widget-move',
      widgetId: widget.id,
      startX: widget.x,
      startY: widget.y
    }));
  }
  
  // Handle grid drop
  function handleDrop(event: DragEvent) {
    if (!editMode) return;
    
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;
    
    const { type, widgetId, startX, startY } = JSON.parse(data);
    if (type !== 'widget-move') return;
    
    const rect = gridContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const snapped = snapToGrid(x, y);
    const widget = widgets.find(w => w.id === widgetId);
    
    if (widget) {
      const newPosition = { ...widget, x: snapped.x, y: snapped.y };
      
      if (isValidPosition(newPosition, widgetId)) {
        onWidgetMove?.(widgetId, { x: snapped.x, y: snapped.y });
      }
    }
  }
  
  // Prevent default drag over to allow drop
  function handleDragOver(event: DragEvent) {
    if (editMode) {
      event.preventDefault();
    }
  }
  
  // Generate grid dots for visual guide
  function generateGridDots() {
    const dots = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        dots.push({ x: col * gridSize, y: row * gridSize });
      }
    }
    return dots;
  }
  
  let gridDots = $derived(showGrid ? generateGridDots() : []);
</script>

<div 
  class="dashboard-grid"
  class:edit-mode={editMode}
  class:show-grid={showGrid}
  bind:this={gridContainer}
  style={`
    ${Object.entries(gridTemplate).map(([key, value]) => 
      `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
    ).join('; ')};
    width: ${gridCols * gridSize}px;
    height: ${gridRows * gridSize}px;
  `}
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  role="grid"
  aria-label="Dashboard widget grid"
>
  <!-- Grid overlay dots -->
  {#if showGrid}
    <div class="grid-overlay">
      {#each gridDots as dot}
        <div 
          class="grid-dot"
          style={`left: ${dot.x}px; top: ${dot.y}px;`}
        ></div>
      {/each}
    </div>
  {/if}
  
  <!-- Widget slots -->
  {#each widgets as widget (widget.id)}
    <div
      class="widget-container"
      class:draggable={editMode}
      style={`
        ${Object.entries(getGridPlacement(widget)).map(([key, value]) => 
          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`
        ).join('; ')};
      `}
      draggable={editMode}
      on:dragstart={(e) => handleDragStart(e, widget)}
      role="gridcell"
      aria-label={`Widget ${widget.id}`}
      data-widget-id={widget.id}
    >
      <!-- Widget content slot -->
      <slot name="widget" {widget} />
      
      <!-- Edit mode controls -->
      {#if editMode}
        <div class="widget-controls">
          <button 
            class="resize-handle top-left"
            aria-label="Resize widget"
          ></button>
          <button 
            class="resize-handle top-right"
            aria-label="Resize widget"
          ></button>
          <button 
            class="resize-handle bottom-left"
            aria-label="Resize widget"
          ></button>
          <button 
            class="resize-handle bottom-right"
            aria-label="Resize widget"
          ></button>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .dashboard-grid {
    @apply relative bg-background border border-border rounded-lg overflow-hidden;
    display: grid;
    position: relative;
    min-height: 400px;
  }
  
  .dashboard-grid.edit-mode {
    @apply border-primary border-2;
  }
  
  .grid-overlay {
    @apply absolute inset-0 pointer-events-none z-0;
  }
  
  .grid-dot {
    @apply absolute w-1 h-1 bg-border/50 rounded-full;
    transform: translate(-50%, -50%);
  }
  
  .widget-container {
    @apply relative z-10 bg-surface border border-border rounded-md overflow-hidden;
    transition: all 0.2s ease-in-out;
  }
  
  .widget-container.draggable {
    @apply cursor-grab border-primary/50;
  }
  
  .widget-container.draggable:hover {
    @apply border-primary shadow-lg;
  }
  
  .widget-container.draggable:active {
    @apply cursor-grabbing;
  }
  
  .widget-controls {
    @apply absolute inset-0 pointer-events-none;
  }
  
  .resize-handle {
    @apply absolute w-3 h-3 bg-primary border border-white/20 rounded-sm pointer-events-auto;
    transition: all 0.2s ease-in-out;
  }
  
  .resize-handle:hover {
    @apply bg-primary/80 scale-110;
  }
  
  .resize-handle.top-left {
    @apply top-0 left-0 cursor-nw-resize;
    transform: translate(-50%, -50%);
  }
  
  .resize-handle.top-right {
    @apply top-0 right-0 cursor-ne-resize;
    transform: translate(50%, -50%);
  }
  
  .resize-handle.bottom-left {
    @apply bottom-0 left-0 cursor-sw-resize;
    transform: translate(-50%, 50%);
  }
  
  .resize-handle.bottom-right {
    @apply bottom-0 right-0 cursor-se-resize;
    transform: translate(50%, 50%);
  }
  
  /* Theme-aware grid styling */
  [data-theme="dark"] .dashboard-grid {
    background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(26, 26, 26, 0.9) 100%);
  }
  
  [data-theme="gaming"] .dashboard-grid {
    background: linear-gradient(135deg, rgba(0, 8, 20, 0.95) 0%, rgba(0, 29, 61, 0.95) 100%);
  }
  
  [data-theme="rgb"] .dashboard-grid {
    background: linear-gradient(135deg, rgba(13, 17, 23, 0.95) 0%, rgba(22, 27, 34, 0.95) 100%);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .dashboard-grid {
      min-height: 300px;
    }
    
    .resize-handle {
      @apply w-4 h-4;
    }
  }
  
  /* Animation for widget placement */
  .widget-container {
    animation: widget-appear 0.3s ease-out;
  }
  
  @keyframes widget-appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style> 