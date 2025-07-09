<script lang="ts">
	import { onMount } from 'svelte';
	import { sensorStore } from '$lib/stores/sensorStore.js';
	import { layoutStore } from '$lib/stores/layoutStore.js';
	import { widgetStore } from '$lib/stores/widgetStore.js';
	import '../styles/app.css';

	// Initialize stores on app startup
	onMount(() => {
		// Connect to sensor WebSocket
		sensorStore.connect();
		
		// Load saved layout
		layoutStore.loadLayout();
		
		// Initialize widget presets
		widgetStore.initializePresets();
		
		// Cleanup on destroy
		return () => {
			sensorStore.disconnect();
		};
	});
</script>

<div class="app" data-theme="dark">
	<slot />
</div>

<style>
	.app {
		min-height: 100vh;
		background: var(--color-surface-50);
		color: var(--color-surface-900);
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	:global(html) {
		background: var(--color-surface-50);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: var(--theme-font-family-base);
		background: var(--color-surface-50);
		color: var(--color-surface-900);
	}

	/* Theme variables */
	:global([data-theme="light"]) {
		--color-surface-50: #fafafa;
		--color-surface-100: #f5f5f5;
		--color-surface-200: #e5e5e5;
		--color-surface-300: #d4d4d4;
		--color-surface-400: #a3a3a3;
		--color-surface-500: #737373;
		--color-surface-600: #525252;
		--color-surface-700: #404040;
		--color-surface-800: #262626;
		--color-surface-900: #171717;
		--theme-accent-primary: #3b82f6;
		--theme-accent-secondary: #10b981;
		--theme-text-primary: #171717;
		--theme-text-secondary: #525252;
	}

	:global([data-theme="dark"]) {
		--color-surface-50: #171717;
		--color-surface-100: #262626;
		--color-surface-200: #404040;
		--color-surface-300: #525252;
		--color-surface-400: #737373;
		--color-surface-500: #a3a3a3;
		--color-surface-600: #d4d4d4;
		--color-surface-700: #e5e5e5;
		--color-surface-800: #f5f5f5;
		--color-surface-900: #fafafa;
		--theme-accent-primary: #60a5fa;
		--theme-accent-secondary: #34d399;
		--theme-text-primary: #fafafa;
		--theme-text-secondary: #d4d4d4;
	}

	/* Sensor-specific color schemes */
	:global(.sensor-temperature) {
		--sensor-low: #22c55e;
		--sensor-medium: #f59e0b;
		--sensor-high: #ef4444;
	}

	:global(.sensor-usage) {
		--sensor-low: #3b82f6;
		--sensor-medium: #8b5cf6;
		--sensor-high: #ec4899;
	}

	:global(.sensor-voltage) {
		--sensor-low: #06b6d4;
		--sensor-medium: #0891b2;
		--sensor-high: #0e7490;
	}

	:global(.sensor-fan) {
		--sensor-low: #84cc16;
		--sensor-medium: #65a30d;
		--sensor-high: #4d7c0f;
	}
</style>