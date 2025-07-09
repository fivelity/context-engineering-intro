<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardGrid from './DashboardGrid.svelte';
	import Toolbar from './Toolbar.svelte';
	import WidgetConfigurator from './WidgetConfigurator.svelte';
	import ImportExportModal from './ImportExportModal.svelte';
	import { layoutStore } from '$lib/stores/layoutStore.js';
	import { sensorStore } from '$lib/stores/sensorStore.js';
	import { widgetStore } from '$lib/stores/widgetStore.js';
	import type { WidgetConfig } from '$lib/types/widget.js';

	// Dashboard state
	let showWidgetConfigurator = $state(false);
	let showImportExportModal = $state(false);
	let selectedWidget = $state<WidgetConfig | null>(null);
	let dashboardContainer: HTMLElement;

	// Reactive dashboard data
	let widgets = $derived(layoutStore.widgets);
	let isConnected = $derived(sensorStore.isConnected);
	let gridSize = $derived(layoutStore.gridSize);

	// Handle widget configuration
	function handleConfigureWidget(widget: WidgetConfig) {
		selectedWidget = widget;
		showWidgetConfigurator = true;
	}

	function handleCloseConfigurator() {
		showWidgetConfigurator = false;
		selectedWidget = null;
	}

	function handleSaveWidget(updatedWidget: WidgetConfig) {
		if (selectedWidget) {
			layoutStore.updateWidget(updatedWidget);
		}
		handleCloseConfigurator();
	}

	// Handle widget actions
	function handleDeleteWidget(widgetId: string) {
		layoutStore.removeWidget(widgetId);
	}

	function handleDuplicateWidget(widget: WidgetConfig) {
		const duplicatedWidget = {
			...widget,
			id: `${widget.id}-copy-${Date.now()}`,
			position: {
				x: widget.position.x + 50,
				y: widget.position.y + 50
			}
		};
		layoutStore.addWidget(duplicatedWidget);
	}

	// Handle import/export
	function handleImportExport() {
		showImportExportModal = true;
	}

	function handleCloseImportExport() {
		showImportExportModal = false;
	}

	// Add new widget
	function handleAddWidget(widgetType: string) {
		const newWidget = widgetStore.createWidget(widgetType, {
			x: Math.random() * 400,
			y: Math.random() * 300
		});
		layoutStore.addWidget(newWidget);
	}

	// Keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case 's':
					event.preventDefault();
					layoutStore.saveLayout();
					break;
				case 'e':
					event.preventDefault();
					handleImportExport();
					break;
				case 'r':
					event.preventDefault();
					layoutStore.resetLayout();
					break;
			}
		}
	}

	// Initialize dashboard
	onMount(() => {
		// Load layout if empty
		if (widgets.length === 0) {
			layoutStore.initializeDefaultLayout();
		}

		// Add keyboard event listeners
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="dashboard" bind:this={dashboardContainer}>
	<!-- Toolbar -->
	<Toolbar
		{isConnected}
		on:addWidget={(e) => handleAddWidget(e.detail.type)}
		on:importExport={handleImportExport}
		on:resetLayout={() => layoutStore.resetLayout()}
		on:saveLayout={() => layoutStore.saveLayout()}
	/>

	<!-- Main Dashboard Content -->
	<div class="dashboard-content">
		{#if !isConnected}
			<div class="connection-warning">
				<div class="warning-icon">⚠️</div>
				<div class="warning-text">
					<h3>Backend Connection Required</h3>
					<p>Please start the FastAPI backend server to enable real-time sensor monitoring.</p>
					<code>npm run start:backend</code>
				</div>
			</div>
		{/if}

		<!-- Dashboard Grid -->
		<DashboardGrid
			{widgets}
			{gridSize}
			on:configureWidget={(e) => handleConfigureWidget(e.detail)}
			on:deleteWidget={(e) => handleDeleteWidget(e.detail)}
			on:duplicateWidget={(e) => handleDuplicateWidget(e.detail)}
			on:updateWidget={(e) => layoutStore.updateWidget(e.detail)}
		/>

		<!-- Empty State -->
		{#if widgets.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📊</div>
				<h3>Welcome to SenseCanvas</h3>
				<p>Add your first widget to start monitoring your PC hardware sensors.</p>
				<button 
					class="btn-primary"
					onclick={() => handleAddWidget('gauge')}
				>
					Add CPU Usage Widget
				</button>
			</div>
		{/if}
	</div>

	<!-- Floating Action Button -->
	<button 
		class="fab"
		onclick={() => handleAddWidget('gauge')}
		aria-label="Add widget"
		title="Add widget"
	>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 5v14M5 12h14"/>
		</svg>
	</button>

	<!-- Modals -->
	{#if showWidgetConfigurator && selectedWidget}
		<WidgetConfigurator
			widget={selectedWidget}
			on:save={(e) => handleSaveWidget(e.detail)}
			on:close={handleCloseConfigurator}
		/>
	{/if}

	{#if showImportExportModal}
		<ImportExportModal
			on:close={handleCloseImportExport}
			on:import={(e) => layoutStore.importLayout(e.detail)}
			on:export={() => layoutStore.exportLayout()}
		/>
	{/if}
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--color-surface-50);
		position: relative;
	}

	.dashboard-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.connection-warning {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(249, 115, 22, 0.1);
		border: 1px solid rgba(249, 115, 22, 0.3);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		max-width: 400px;
		z-index: 10;
	}

	.warning-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.warning-text h3 {
		margin: 0 0 0.5rem 0;
		color: var(--theme-text-primary);
	}

	.warning-text p {
		margin: 0 0 1rem 0;
		color: var(--theme-text-secondary);
	}

	.warning-text code {
		background: var(--color-surface-200);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: var(--theme-font-mono, monospace);
		font-size: 0.875rem;
	}

	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		color: var(--theme-text-secondary);
		z-index: 5;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state h3 {
		margin: 0 0 0.5rem 0;
		color: var(--theme-text-primary);
	}

	.empty-state p {
		margin: 0 0 1.5rem 0;
		max-width: 300px;
	}

	.btn-primary {
		background: var(--theme-accent-primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-primary:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.fab {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--theme-accent-primary);
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		z-index: 1000;
	}

	.fab:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.fab:active {
		transform: scale(0.95);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.connection-warning {
			max-width: 90%;
			padding: 1.5rem;
		}

		.empty-state {
			max-width: 90%;
		}

		.fab {
			bottom: 1rem;
			right: 1rem;
			width: 48px;
			height: 48px;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.btn-primary:hover,
		.fab:hover {
			transform: none;
		}
	}
</style>