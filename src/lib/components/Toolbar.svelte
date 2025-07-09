<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { themeStore } from '$lib/stores/themeStore.js';
	import { layoutStore } from '$lib/stores/layoutStore.js';
	import { widgetStore } from '$lib/stores/widgetStore.js';
	
	const dispatch = createEventDispatcher();
	
	// Props
	export let isConnected = false;
	
	// Theme state
	let currentTheme = $derived(themeStore.theme);
	
	// Widget types for dropdown
	const widgetTypes = [
		{ value: 'gauge', label: 'Gauge', icon: '⊙' },
		{ value: 'graph', label: 'Graph', icon: '📈' },
		{ value: 'simple', label: 'Simple', icon: '🔢' },
		{ value: 'meter', label: 'Meter', icon: '📊' },
		{ value: 'multi-resource', label: 'Multi-Resource', icon: '🔄' }
	];
	
	// Layout presets
	const layoutPresets = [
		{ id: 'default', name: 'Default', icon: '🏠' },
		{ id: 'performance', name: 'Performance', icon: '⚡' },
		{ id: 'thermal', name: 'Thermal', icon: '🌡️' },
		{ id: 'compact', name: 'Compact', icon: '📱' }
	];
	
	// Dropdown states
	let showWidgetDropdown = $state(false);
	let showLayoutDropdown = $state(false);
	let showOptionsDropdown = $state(false);
	
	// Widget count
	let widgetCount = $derived(layoutStore.widgets.length);
	
	// Handle actions
	function handleAddWidget(type: string) {
		dispatch('addWidget', { type });
		showWidgetDropdown = false;
	}
	
	function handleLoadPreset(presetId: string) {
		layoutStore.loadPreset(presetId);
		showLayoutDropdown = false;
	}
	
	function handleThemeToggle() {
		themeStore.toggleTheme();
	}
	
	function handleSaveLayout() {
		dispatch('saveLayout');
	}
	
	function handleResetLayout() {
		if (confirm('Are you sure you want to reset the layout? This will remove all widgets.')) {
			dispatch('resetLayout');
		}
	}
	
	function handleImportExport() {
		dispatch('importExport');
	}
	
	// Close dropdowns when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (!(event.target as Element).closest('.dropdown')) {
			showWidgetDropdown = false;
			showLayoutDropdown = false;
			showOptionsDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="toolbar">
	<div class="toolbar-section">
		<!-- Logo/Title -->
		<div class="logo">
			<span class="logo-icon">🎯</span>
			<span class="logo-text">SenseCanvas</span>
		</div>
		
		<!-- Connection Status -->
		<div class="connection-status" class:connected={isConnected}>
			<span class="status-dot"></span>
			<span class="status-text">
				{isConnected ? 'Connected' : 'Disconnected'}
			</span>
		</div>
	</div>
	
	<div class="toolbar-section">
		<!-- Widget Controls -->
		<div class="dropdown" class:active={showWidgetDropdown}>
			<button 
				class="toolbar-button primary"
				onclick={() => showWidgetDropdown = !showWidgetDropdown}
				aria-expanded={showWidgetDropdown}
			>
				<span class="button-icon">+</span>
				<span class="button-text">Add Widget</span>
			</button>
			
			{#if showWidgetDropdown}
				<div class="dropdown-menu">
					{#each widgetTypes as widget}
						<button 
							class="dropdown-item"
							onclick={() => handleAddWidget(widget.value)}
						>
							<span class="item-icon">{widget.icon}</span>
							<span class="item-text">{widget.label}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		
		<!-- Layout Controls -->
		<div class="dropdown" class:active={showLayoutDropdown}>
			<button 
				class="toolbar-button"
				onclick={() => showLayoutDropdown = !showLayoutDropdown}
				aria-expanded={showLayoutDropdown}
			>
				<span class="button-icon">📐</span>
				<span class="button-text">Layout</span>
			</button>
			
			{#if showLayoutDropdown}
				<div class="dropdown-menu">
					<div class="dropdown-section">
						<div class="dropdown-label">Presets</div>
						{#each layoutPresets as preset}
							<button 
								class="dropdown-item"
								onclick={() => handleLoadPreset(preset.id)}
							>
								<span class="item-icon">{preset.icon}</span>
								<span class="item-text">{preset.name}</span>
							</button>
						{/each}
					</div>
					
					<div class="dropdown-divider"></div>
					
					<button class="dropdown-item" onclick={handleImportExport}>
						<span class="item-icon">💾</span>
						<span class="item-text">Import/Export</span>
					</button>
				</div>
			{/if}
		</div>
		
		<!-- Options -->
		<div class="dropdown" class:active={showOptionsDropdown}>
			<button 
				class="toolbar-button"
				onclick={() => showOptionsDropdown = !showOptionsDropdown}
				aria-expanded={showOptionsDropdown}
			>
				<span class="button-icon">⚙️</span>
			</button>
			
			{#if showOptionsDropdown}
				<div class="dropdown-menu">
					<button class="dropdown-item" onclick={handleThemeToggle}>
						<span class="item-icon">{currentTheme === 'dark' ? '☀️' : '🌙'}</span>
						<span class="item-text">Toggle Theme</span>
					</button>
					
					<button class="dropdown-item" onclick={handleSaveLayout}>
						<span class="item-icon">💾</span>
						<span class="item-text">Save Layout</span>
					</button>
					
					<div class="dropdown-divider"></div>
					
					<button class="dropdown-item danger" onclick={handleResetLayout}>
						<span class="item-icon">🗑️</span>
						<span class="item-text">Reset Layout</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
	
	<div class="toolbar-section">
		<!-- Widget Counter -->
		<div class="widget-counter">
			<span class="counter-value">{widgetCount}</span>
			<span class="counter-label">widgets</span>
		</div>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--color-surface-100);
		border-bottom: 1px solid var(--color-surface-200);
		position: sticky;
		top: 0;
		z-index: 100;
		gap: 1rem;
	}
	
	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: var(--theme-text-primary);
	}
	
	.logo-icon {
		font-size: 1.5rem;
	}
	
	.logo-text {
		font-size: 1.125rem;
	}
	
	.connection-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--color-surface-200);
		border-radius: 6px;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}
	
	.connection-status.connected {
		background: rgba(34, 197, 94, 0.1);
		color: #166534;
	}
	
	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #ef4444;
		transition: all 0.2s ease;
	}
	
	.connection-status.connected .status-dot {
		background: #22c55e;
		animation: pulse 2s infinite;
	}
	
	.toolbar-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--color-surface-200);
		border: 1px solid var(--color-surface-300);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--theme-text-primary);
	}
	
	.toolbar-button:hover {
		background: var(--color-surface-300);
		transform: translateY(-1px);
	}
	
	.toolbar-button.primary {
		background: var(--theme-accent-primary);
		color: white;
		border-color: var(--theme-accent-primary);
	}
	
	.toolbar-button.primary:hover {
		background: var(--theme-accent-secondary);
	}
	
	.button-icon {
		font-size: 1rem;
	}
	
	.dropdown {
		position: relative;
	}
	
	.dropdown.active .toolbar-button {
		background: var(--color-surface-300);
	}
	
	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		background: var(--color-surface-100);
		border: 1px solid var(--color-surface-200);
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		min-width: 200px;
		z-index: 1000;
		overflow: hidden;
	}
	
	.dropdown-section {
		padding: 0.5rem 0;
	}
	
	.dropdown-label {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--theme-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		color: var(--theme-text-primary);
		text-align: left;
	}
	
	.dropdown-item:hover {
		background: var(--color-surface-200);
	}
	
	.dropdown-item.danger {
		color: var(--theme-error);
	}
	
	.dropdown-item.danger:hover {
		background: rgba(239, 68, 68, 0.1);
	}
	
	.dropdown-divider {
		height: 1px;
		background: var(--color-surface-200);
		margin: 0.5rem 0;
	}
	
	.item-icon {
		font-size: 1rem;
		width: 1.25rem;
		text-align: center;
	}
	
	.widget-counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background: var(--color-surface-200);
		border-radius: 6px;
	}
	
	.counter-value {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--theme-text-primary);
		line-height: 1;
	}
	
	.counter-label {
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		line-height: 1;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.toolbar {
			flex-direction: column;
			gap: 0.5rem;
		}
		
		.toolbar-section {
			gap: 0.5rem;
		}
		
		.logo-text {
			display: none;
		}
		
		.button-text {
			display: none;
		}
		
		.dropdown-menu {
			right: 0;
			left: auto;
		}
	}
</style>