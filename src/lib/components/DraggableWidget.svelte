<script lang="ts">
	import { onMount, onDestroy, getContext } from 'svelte';
	import { draggable } from '@neodrag/svelte';
	import { layoutStore } from '$stores/layoutStore.js';
	import { getWidgetGridStyles, pixelToGrid, gridToPixel } from '$utils/gridUtils.js';
	import type { WidgetConfig } from '$types/widget.js';

	// Props
	export let widget: WidgetConfig;
	export let selected = false;
	export let readonly = false;

	// Get grid context
	const gridContext = getContext('dashboardGrid');

	// Widget state
	let widgetElement = $state<HTMLElement | null>(null);
	let isDragging = $state(false);
	let isResizing = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });

	// Reactive position and size
	let position = $derived(widget.position);
	let pixelPosition = $derived(() => {
		const config = gridContext?.config || layoutStore.gridConfig;
		return gridToPixel(position.x, position.y, config.cellSize, config.gap);
	});

	// Grid styles for CSS positioning
	let gridStyles = $derived(getWidgetGridStyles(position));

	// Resize handles
	let resizeHandles = $state({
		se: false, // southeast (bottom-right)
		sw: false, // southwest (bottom-left)
		ne: false, // northeast (top-right)
		nw: false  // northwest (top-left)
	});

	// Touch/mouse state
	let touchStartData = $state<{ x: number; y: number; time: number } | null>(null);

	onMount(() => {
		if (!widgetElement || readonly) return;

		// Setup draggable
		const dragInstance = draggable(widgetElement, {
			position: pixelPosition,
			grid: gridContext?.snapToGrid ? [
				gridContext.config.cellSize + gridContext.config.gap,
				gridContext.config.cellSize + gridContext.config.gap
			] : undefined,
			bounds: 'parent',
			handle: '.widget-header',
			cancel: '.widget-content, .resize-handle',
			onDragStart: (data) => {
				isDragging = true;
				gridContext?.startDrag?.(widget.id);
				widgetElement?.classList.add('dragging');
			},
			onDrag: (data) => {
				dragOffset = data.offset;
			},
			onDragEnd: (data) => {
				isDragging = false;
				gridContext?.endDrag?.();
				widgetElement?.classList.remove('dragging');

				// Convert pixel position back to grid coordinates
				const config = gridContext?.config || layoutStore.gridConfig;
				const gridPos = pixelToGrid(data.offset.x, data.offset.y, config.cellSize, config.gap);
				
				// Update widget position
				const newPosition = {
					x: Math.max(0, gridPos.x),
					y: Math.max(0, gridPos.y),
					w: position.w,
					h: position.h
				};

				layoutStore.moveWidget(widget.id, newPosition);
			}
		});

		return () => {
			dragInstance.destroy();
		};
	});

	// Handle resize
	function startResize(handle: string, event: MouseEvent | TouchEvent) {
		if (readonly) return;

		event.preventDefault();
		event.stopPropagation();

		isResizing = true;
		resizeHandles[handle as keyof typeof resizeHandles] = true;

		const startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const startY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const startW = position.w;
		const startH = position.h;

		function handleMove(e: MouseEvent | TouchEvent) {
			const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
			const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;

			const deltaX = currentX - startX;
			const deltaY = currentY - startY;

			const config = gridContext?.config || layoutStore.gridConfig;
			const cellSize = config.cellSize + config.gap;

			let newW = startW;
			let newH = startH;

			// Calculate new size based on handle
			if (handle.includes('e')) { // east (right)
				newW = Math.max(widget.minSize.w, startW + Math.round(deltaX / cellSize));
			}
			if (handle.includes('w')) { // west (left)
				newW = Math.max(widget.minSize.w, startW - Math.round(deltaX / cellSize));
			}
			if (handle.includes('s')) { // south (bottom)
				newH = Math.max(widget.minSize.h, startH + Math.round(deltaY / cellSize));
			}
			if (handle.includes('n')) { // north (top)
				newH = Math.max(widget.minSize.h, startH - Math.round(deltaY / cellSize));
			}

			// Constrain to max size
			newW = Math.min(widget.maxSize.w, newW);
			newH = Math.min(widget.maxSize.h, newH);

			// Update widget size
			layoutStore.resizeWidget(widget.id, { w: newW, h: newH });
		}

		function handleEnd() {
			isResizing = false;
			resizeHandles = { se: false, sw: false, ne: false, nw: false };
			
			document.removeEventListener('mousemove', handleMove);
			document.removeEventListener('mouseup', handleEnd);
			document.removeEventListener('touchmove', handleMove);
			document.removeEventListener('touchend', handleEnd);
		}

		document.addEventListener('mousemove', handleMove);
		document.addEventListener('mouseup', handleEnd);
		document.addEventListener('touchmove', handleMove);
		document.addEventListener('touchend', handleEnd);
	}

	// Handle context menu
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		
		// Dispatch custom event for parent to handle
		widgetElement?.dispatchEvent(new CustomEvent('widgetcontextmenu', {
			detail: { widget, x: event.clientX, y: event.clientY }
		}));
	}

	// Handle touch interactions
	function handleTouchStart(event: TouchEvent) {
		touchStartData = {
			x: event.touches[0].clientX,
			y: event.touches[0].clientY,
			time: Date.now()
		};
	}

	function handleTouchEnd(event: TouchEvent) {
		if (!touchStartData) return;

		const deltaX = Math.abs(event.changedTouches[0].clientX - touchStartData.x);
		const deltaY = Math.abs(event.changedTouches[0].clientY - touchStartData.y);
		const deltaTime = Date.now() - touchStartData.time;

		// Detect long press (500ms+) with minimal movement
		if (deltaTime > 500 && deltaX < 10 && deltaY < 10) {
			// Trigger context menu
			widgetElement?.dispatchEvent(new CustomEvent('widgetcontextmenu', {
				detail: { 
					widget, 
					x: event.changedTouches[0].clientX, 
					y: event.changedTouches[0].clientY 
				}
			}));
		}

		touchStartData = null;
	}

	// Handle click for selection
	function handleClick(event: MouseEvent) {
		if (isDragging || isResizing) return;

		// Dispatch selection event
		widgetElement?.dispatchEvent(new CustomEvent('widgetselect', {
			detail: { widget }
		}));
	}

	// Handle keyboard interactions
	function handleKeydown(event: KeyboardEvent) {
		if (!selected) return;

		switch (event.key) {
			case 'Delete':
			case 'Backspace':
				event.preventDefault();
				layoutStore.removeWidget(widget.id);
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				// Open widget configurator
				widgetElement?.dispatchEvent(new CustomEvent('widgetconfigure', {
					detail: { widget }
				}));
				break;
		}
	}
</script>

<div
	bind:this={widgetElement}
	class="widget-container"
	class:selected
	class:dragging={isDragging}
	class:resizing={isResizing}
	class:readonly
	style:grid-column={gridStyles.gridColumn}
	style:grid-row={gridStyles.gridRow}
	on:contextmenu={handleContextMenu}
	on:touchstart={handleTouchStart}
	on:touchend={handleTouchEnd}
	on:click={handleClick}
	on:keydown={handleKeydown}
	role="gridcell"
	tabindex={selected ? 0 : -1}
	aria-label={`Widget: ${widget.title}`}
	aria-selected={selected}
	data-widget-id={widget.id}
	data-widget-type={widget.type}
>
	<!-- Widget Header -->
	<div class="widget-header" data-drag-handle>
		<h3 class="widget-title">{widget.title}</h3>
		<div class="widget-actions">
			{#if !readonly}
				<button
					class="action-btn"
					type="button"
					aria-label="Configure widget"
					on:click={(e) => {
						e.stopPropagation();
						widgetElement?.dispatchEvent(new CustomEvent('widgetconfigure', {
							detail: { widget }
						}));
					}}
				>
					⚙️
				</button>
				<button
					class="action-btn"
					type="button"
					aria-label="Remove widget"
					on:click={(e) => {
						e.stopPropagation();
						layoutStore.removeWidget(widget.id);
					}}
				>
					✕
				</button>
			{/if}
		</div>
	</div>

	<!-- Widget Content -->
	<div class="widget-content">
		<slot {widget} {isDragging} {isResizing} />
	</div>

	<!-- Resize Handles -->
	{#if !readonly && selected}
		<div class="resize-handles">
			<!-- Southeast handle (bottom-right) -->
			<button
				class="resize-handle se"
				type="button"
				aria-label="Resize widget"
				on:mousedown={(e) => startResize('se', e)}
				on:touchstart={(e) => startResize('se', e)}
			></button>
		</div>
	{/if}
</div>

<style>
	.widget-container {
		position: relative;
		background: var(--theme-bg-secondary);
		border: 2px solid var(--theme-border-primary);
		border-radius: 0.5rem;
		overflow: hidden;
		transition: all 0.2s ease;
		cursor: pointer;
		min-height: 96px;
		min-width: 128px;
		z-index: 1;
	}

	.widget-container:hover {
		border-color: var(--theme-accent-primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.widget-container.selected {
		border-color: var(--theme-accent-primary);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-500) / 0.3);
		z-index: 2;
	}

	.widget-container.dragging {
		transform: scale(1.02);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		z-index: 50;
		cursor: grabbing;
	}

	.widget-container.resizing {
		z-index: 3;
	}

	.widget-container.readonly {
		cursor: default;
	}

	.widget-container.readonly:hover {
		border-color: var(--theme-border-primary);
		box-shadow: none;
	}

	.widget-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem;
		background: var(--theme-bg-primary);
		border-bottom: 1px solid var(--theme-border-primary);
		cursor: grab;
		user-select: none;
	}

	.widget-header:active {
		cursor: grabbing;
	}

	.widget-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--theme-text-primary);
		margin: 0;
		truncate: true;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.widget-actions {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.widget-container:hover .widget-actions,
	.widget-container.selected .widget-actions {
		opacity: 1;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0.25rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
		line-height: 1;
		color: var(--theme-text-secondary);
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		background: var(--theme-bg-secondary);
		color: var(--theme-text-primary);
	}

	.widget-content {
		padding: 0.75rem;
		height: calc(100% - 3rem);
		overflow: hidden;
		position: relative;
	}

	.resize-handles {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.resize-handle {
		position: absolute;
		background: var(--theme-accent-primary);
		border: 2px solid var(--theme-bg-primary);
		border-radius: 50%;
		width: 12px;
		height: 12px;
		pointer-events: all;
		cursor: nw-resize;
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: 10;
	}

	.widget-container.selected .resize-handle {
		opacity: 1;
	}

	.resize-handle.se {
		bottom: -6px;
		right: -6px;
		cursor: se-resize;
	}

	.resize-handle:hover {
		background: var(--theme-accent-secondary);
		transform: scale(1.2);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.widget-container {
			min-height: 80px;
			min-width: 120px;
		}

		.widget-header {
			padding: 0.375rem;
		}

		.widget-content {
			padding: 0.5rem;
			height: calc(100% - 2.5rem);
		}

		.widget-actions {
			opacity: 1; /* Always show on mobile */
		}

		.resize-handle {
			width: 16px;
			height: 16px;
		}

		.resize-handle.se {
			bottom: -8px;
			right: -8px;
		}
	}

	/* Accessibility */
	.widget-container:focus {
		outline: 2px solid var(--theme-accent-primary);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.widget-container,
		.widget-actions,
		.resize-handle,
		.action-btn {
			transition: none;
		}

		.widget-container.dragging {
			transform: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.widget-container {
			border-width: 3px;
		}

		.widget-container:focus {
			outline-width: 3px;
		}
	}
</style>