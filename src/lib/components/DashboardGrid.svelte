<script lang="ts">
	import { setContext, onMount } from 'svelte';
	import { layoutStore } from '$stores/layoutStore.js';
	import { generateGridTemplate } from '$utils/gridUtils.js';
	import type { GridConfig } from '$types/widget.js';

	// Props
	export let showGrid = false;
	export let snapToGrid = true;
	export let allowOverlap = false;
	export let compactOnDrag = false;

	// Reactive grid configuration
	let gridConfig = $derived(layoutStore.gridConfig);
	let gridTemplate = $derived(generateGridTemplate(gridConfig));

	// Grid state
	let gridElement = $state<HTMLElement | null>(null);
	let gridBounds = $state({ width: 0, height: 0 });
	let isDragging = $state(false);
	let draggedWidget = $state<string | null>(null);

	// Provide grid context to child components
	setContext('dashboardGrid', {
		get config() { return gridConfig; },
		get bounds() { return gridBounds; },
		get isDragging() { return isDragging; },
		get draggedWidget() { return draggedWidget; },
		snapToGrid,
		allowOverlap,
		compactOnDrag,
		startDrag: (widgetId: string) => {
			isDragging = true;
			draggedWidget = widgetId;
		},
		endDrag: () => {
			if (compactOnDrag) {
				layoutStore.compactLayout();
			}
			isDragging = false;
			draggedWidget = null;
		}
	});

	// Update grid bounds when element resizes
	onMount(() => {
		if (!gridElement) return;

		const updateBounds = () => {
			if (gridElement) {
				const rect = gridElement.getBoundingClientRect();
				gridBounds = {
					width: rect.width,
					height: rect.height
				};
			}
		};

		// Initial bounds calculation
		updateBounds();

		// Update bounds on resize
		const resizeObserver = new ResizeObserver(updateBounds);
		resizeObserver.observe(gridElement);

		return () => {
			resizeObserver.disconnect();
		};
	});

	// Handle grid clicks for adding widgets
	function handleGridClick(event: MouseEvent) {
		if (isDragging) return;

		// Check if click was on empty grid space
		const target = event.target as HTMLElement;
		if (target === gridElement) {
			const rect = gridElement!.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Convert to grid coordinates
			const gridX = Math.floor(x / (gridConfig.cellSize + gridConfig.gap));
			const gridY = Math.floor(y / (gridConfig.cellSize + gridConfig.gap));

			// Dispatch event for parent to handle
			const detail = { gridX, gridY, pixelX: x, pixelY: y };
			gridElement!.dispatchEvent(new CustomEvent('gridclick', { detail }));
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!draggedWidget) return;

		const widget = layoutStore.getWidget(draggedWidget);
		if (!widget) return;

		let deltaX = 0;
		let deltaY = 0;

		switch (event.key) {
			case 'ArrowLeft':
				deltaX = -1;
				break;
			case 'ArrowRight':
				deltaX = 1;
				break;
			case 'ArrowUp':
				deltaY = -1;
				break;
			case 'ArrowDown':
				deltaY = 1;
				break;
			case 'Escape':
				draggedWidget = null;
				isDragging = false;
				return;
			default:
				return;
		}

		event.preventDefault();

		const newPosition = {
			...widget.position,
			x: Math.max(0, widget.position.x + deltaX),
			y: Math.max(0, widget.position.y + deltaY)
		};

		layoutStore.moveWidget(draggedWidget, newPosition);
	}

	// Calculate grid overlay pattern
	let gridOverlayStyle = $derived(() => {
		const cellSize = gridConfig.cellSize;
		const gap = gridConfig.gap;
		return `
			background-image: 
				linear-gradient(rgba(var(--color-surface-400) / 0.2) 1px, transparent 1px),
				linear-gradient(90deg, rgba(var(--color-surface-400) / 0.2) 1px, transparent 1px);
			background-size: ${cellSize + gap}px ${cellSize + gap}px;
		`;
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	bind:this={gridElement}
	class="dashboard-grid"
	class:show-grid={showGrid}
	class:is-dragging={isDragging}
	style:grid-template-columns={gridTemplate}
	style:grid-auto-rows="{gridConfig.cellSize}px"
	style:gap="{gridConfig.gap}px"
	style:padding="1rem"
	on:click={handleGridClick}
	role="grid"
	aria-label="Dashboard widget grid"
	tabindex="0"
>
	{#if showGrid}
		<div 
			class="grid-overlay" 
			style={gridOverlayStyle}
			aria-hidden="true"
		></div>
	{/if}

	<slot />
</div>

<style>
	.dashboard-grid {
		position: relative;
		width: 100%;
		height: 100%;
		display: grid;
		overflow: auto;
		scroll-behavior: smooth;
		background-color: var(--theme-bg-primary);
		border-radius: 0.5rem;
		transition: background-color 0.2s ease;
	}

	.dashboard-grid:focus {
		outline: 2px solid var(--theme-accent-primary);
		outline-offset: -2px;
	}

	.dashboard-grid.is-dragging {
		cursor: grabbing;
		user-select: none;
	}

	.dashboard-grid.show-grid {
		background-color: var(--theme-bg-secondary);
	}

	.grid-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}

	.dashboard-grid.is-dragging .grid-overlay {
		opacity: 0.8;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.dashboard-grid {
			gap: 0.25rem;
			padding: 0.5rem;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.dashboard-grid {
			scroll-behavior: auto;
		}
		
		.grid-overlay {
			transition: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.dashboard-grid:focus {
			outline-width: 3px;
		}
		
		.grid-overlay {
			opacity: 0.8;
		}
	}
</style>