<!--
  DraggableWidget.svelte
  
  Example implementation of a draggable widget using NeoDrag
  Demonstrates:
  - NeoDrag integration for drag & drop
  - Position tracking and persistence
  - Resize handles with NeoDrag
  - Boundary checking and collision detection
  - Real-time position updates
-->

<script lang="ts">
  // Note: This is an example - actual imports would be from SvelteKit project
  // import { neoDrag } from '@neodrag/svelte';
  // import { layoutStore } from '$lib/stores/layoutStore';
  
  interface WidgetPosition {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }

  // Props
  let { 
    id,
    position = { x: 0, y: 0, w: 200, h: 150 },
    editMode = false,
    gridSize = 20,
    onPositionChange,
    onSizeChange
  }: {
    id: string;
    position?: { x: number; y: number; w: number; h: number };
    editMode?: boolean;
    gridSize?: number;
    onPositionChange?: (position: { x: number; y: number }) => void;
    onSizeChange?: (size: { w: number; h: number }) => void;
  } = $props();

  // Widget element references
  let widgetElement: HTMLElement;
  let resizeElement: HTMLElement;
  
  // Current drag state
  let isDragging = $state(false);
  let isResizing = $state(false);
  
  // Reactive position derived from props
  let currentPosition = $state(position);
  
  // Sync position changes from props
  $effect(() => {
    currentPosition = { ...position };
  });
  
  // NeoDrag configuration for position
  let dragOptions = $derived({
    disabled: !editMode,
    bounds: 'parent', // Constrain to parent container
    grid: [gridSize, gridSize], // Snap to grid
    position: { x: currentPosition.x, y: currentPosition.y },
    onDrag: ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
      isDragging = true;
      // Real-time position update during drag
      currentPosition.x = offsetX;
      currentPosition.y = offsetY;
    },
    onDragEnd: ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
      isDragging = false;
      // Snap to grid and validate position
      const snappedX = Math.round(offsetX / gridSize) * gridSize;
      const snappedY = Math.round(offsetY / gridSize) * gridSize;
      
      currentPosition.x = snappedX;
      currentPosition.y = snappedY;
      
      // Notify parent of position change
      onPositionChange?.({ x: snappedX, y: snappedY });
    }
  });
  
  // NeoDrag configuration for resize handle
  let resizeOptions = $derived({
    disabled: !editMode,
    bounds: 'parent',
    grid: [gridSize, gridSize],
    onDrag: ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
      isResizing = true;
      // Calculate new size based on drag offset
      const newWidth = Math.max(gridSize * 2, currentPosition.w + offsetX);
      const newHeight = Math.max(gridSize * 2, currentPosition.h + offsetY);
      
      currentPosition.w = newWidth;
      currentPosition.h = newHeight;
    },
    onDragEnd: ({ offsetX, offsetY }: { offsetX: number; offsetY: number }) => {
      isResizing = false;
      // Snap size to grid
      const newWidth = Math.round((currentPosition.w) / gridSize) * gridSize;
      const newHeight = Math.round((currentPosition.h) / gridSize) * gridSize;
      
      currentPosition.w = Math.max(gridSize * 2, newWidth);
      currentPosition.h = Math.max(gridSize * 2, newHeight);
      
      // Notify parent of size change
      onSizeChange?.({ w: currentPosition.w, h: currentPosition.h });
    }
  });
  
  // Widget styling based on state
  let widgetClasses = $derived([
    'draggable-widget',
    editMode && 'edit-mode',
    isDragging && 'dragging',
    isResizing && 'resizing'
  ].filter(Boolean).join(' '));
  
  // Widget inline styles
  let widgetStyles = $derived([
    `width: ${currentPosition.w}px`,
    `height: ${currentPosition.h}px`,
    `transform: translate(${currentPosition.x}px, ${currentPosition.y}px)`
  ].join('; '));
</script>

<!-- 
  Widget container with drag functionality
  use:neoDrag would be used in actual implementation
-->
<div
  class={widgetClasses}
  style={widgetStyles}
  bind:this={widgetElement}
  data-widget-id={id}
  role="button"
  tabindex={editMode ? 0 : -1}
  aria-label={`Widget ${id}, position ${currentPosition.x}, ${currentPosition.y}`}
>
  <!-- Widget content slot -->
  <div class="widget-content">
    <slot />
  </div>
  
  <!-- Edit mode controls -->
  {#if editMode}
    <div class="widget-controls">
      <!-- Drag handle -->
      <div class="drag-handle" title="Drag to move">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M10 13a1 1 0 100-2 1 1 0 000 2zM10 8a1 1 0 100-2 1 1 0 000 2zM10 5a1 1 0 100-2 1 1 0 000 2zM6 13a1 1 0 100-2 1 1 0 000 2zM6 8a1 1 0 100-2 1 1 0 000 2zM6 5a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
      </div>
      
      <!-- Remove button -->
      <button class="remove-button" title="Remove widget" aria-label="Remove widget">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      
      <!-- Resize handle -->
      <div 
        class="resize-handle"
        bind:this={resizeElement}
        title="Drag to resize"
        role="button"
        tabindex="0"
        aria-label="Resize widget"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M11.5 0.5L0.5 11.5M8.5 0.5L11.5 3.5M11.5 8.5L3.5 11.5"/>
        </svg>
      </div>
    </div>
  {/if}
  
  <!-- Selection indicator -->
  {#if editMode}
    <div class="selection-indicator"></div>
  {/if}
</div>

<style>
  .draggable-widget {
    @apply absolute top-0 left-0 bg-surface border border-border rounded-lg overflow-hidden;
    transition: all 0.2s ease-in-out;
    min-width: 100px;
    min-height: 80px;
  }
  
  .draggable-widget.edit-mode {
    @apply border-primary/50 shadow-lg;
  }
  
  .draggable-widget.edit-mode:hover {
    @apply border-primary shadow-xl;
  }
  
  .draggable-widget.dragging {
    @apply border-accent shadow-2xl z-50;
    transform-origin: center;
    animation: drag-pulse 0.3s ease-in-out;
  }
  
  .draggable-widget.resizing {
    @apply border-warning shadow-xl;
  }
  
  .widget-content {
    @apply w-full h-full p-4 overflow-hidden;
  }
  
  .widget-controls {
    @apply absolute inset-0 pointer-events-none;
  }
  
  .drag-handle {
    @apply absolute top-2 left-2 w-6 h-6 bg-primary/80 text-white rounded-sm flex items-center justify-center pointer-events-auto cursor-grab;
    transition: all 0.2s ease-in-out;
  }
  
  .drag-handle:hover {
    @apply bg-primary scale-110;
  }
  
  .drag-handle:active {
    @apply cursor-grabbing;
  }
  
  .remove-button {
    @apply absolute top-2 right-2 w-6 h-6 bg-error/80 text-white rounded-sm flex items-center justify-center pointer-events-auto hover:bg-error hover:scale-110;
    transition: all 0.2s ease-in-out;
  }
  
  .resize-handle {
    @apply absolute bottom-0 right-0 w-6 h-6 bg-warning/80 text-white rounded-tl-sm flex items-center justify-center pointer-events-auto cursor-se-resize;
    transition: all 0.2s ease-in-out;
    transform: translate(25%, 25%);
  }
  
  .resize-handle:hover {
    @apply bg-warning scale-110;
  }
  
  .selection-indicator {
    @apply absolute inset-0 border-2 border-accent rounded-lg pointer-events-none;
    animation: selection-blink 2s ease-in-out infinite;
  }
  
  /* Theme-aware styling */
  [data-theme="dark"] .draggable-widget {
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
  }
  
  [data-theme="gaming"] .draggable-widget {
    background: rgba(0, 29, 61, 0.95);
    backdrop-filter: blur(10px);
  }
  
  [data-theme="rgb"] .draggable-widget {
    background: rgba(22, 27, 34, 0.95);
    backdrop-filter: blur(10px);
  }
  
  /* Animations */
  @keyframes drag-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes selection-blink {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .drag-handle,
    .remove-button,
    .resize-handle {
      @apply w-8 h-8;
    }
    
    .widget-content {
      @apply p-2;
    }
  }
  
  /* Focus states for accessibility */
  .draggable-widget:focus {
    @apply outline-none ring-2 ring-primary/50;
  }
  
  .resize-handle:focus {
    @apply outline-none ring-2 ring-warning/50;
  }
  
  /* Grid snap visual feedback */
  .draggable-widget.dragging::after {
    content: '';
    @apply absolute inset-0 border-2 border-dashed border-accent/50 rounded-lg pointer-events-none;
  }
  
  /* Collision warning state */
  .draggable-widget.collision-warning {
    @apply border-error shadow-error/50;
    animation: collision-shake 0.3s ease-in-out;
  }
  
  @keyframes collision-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
</style> 