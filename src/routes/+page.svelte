<script lang="ts">
	import { onMount } from 'svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import { sensorStore } from '$lib/stores/sensorStore.js';
	import { layoutStore } from '$lib/stores/layoutStore.js';

	// Connection status
	let connectionStatus = $derived(sensorStore.status);
	let lastUpdate = $derived(sensorStore.lastUpdate);

	// Format last update time
	let lastUpdateFormatted = $derived(() => {
		if (!lastUpdate) return 'Never';
		const date = new Date(lastUpdate);
		return date.toLocaleTimeString();
	});

	onMount(() => {
		// Ensure sensor store is connected
		if (!sensorStore.isConnected) {
			sensorStore.connect();
		}

		// Initialize default layout if none exists
		if (layoutStore.widgets.length === 0) {
			layoutStore.initializeDefaultLayout();
		}
	});
</script>

<svelte:head>
	<title>SenseCanvas - PC Hardware Monitor</title>
	<meta name="description" content="Real-time PC hardware monitoring dashboard with AI-powered layout suggestions" />
</svelte:head>

<main class="main-container">
	<!-- Connection Status Bar -->
	<div class="status-bar" class:connected={connectionStatus === 'connected'} class:disconnected={connectionStatus === 'disconnected'} class:reconnecting={connectionStatus === 'reconnecting'}>
		<div class="status-content">
			<div class="status-indicator">
				{#if connectionStatus === 'connected'}
					<span class="status-dot connected"></span>
					<span>Connected</span>
				{:else if connectionStatus === 'reconnecting'}
					<span class="status-dot reconnecting"></span>
					<span>Reconnecting...</span>
				{:else}
					<span class="status-dot disconnected"></span>
					<span>Disconnected</span>
				{/if}
			</div>
			<div class="last-update">
				Last update: {lastUpdateFormatted}
			</div>
		</div>
	</div>

	<!-- Main Dashboard -->
	<Dashboard />
</main>

<style>
	.main-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-surface-50);
	}

	.status-bar {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: var(--color-surface-100);
		border-bottom: 1px solid var(--color-surface-200);
		padding: 0.5rem 1rem;
		transition: all 0.3s ease;
	}

	.status-bar.connected {
		background: rgba(34, 197, 94, 0.1);
		border-bottom-color: rgba(34, 197, 94, 0.3);
	}

	.status-bar.disconnected {
		background: rgba(239, 68, 68, 0.1);
		border-bottom-color: rgba(239, 68, 68, 0.3);
	}

	.status-bar.reconnecting {
		background: rgba(249, 115, 22, 0.1);
		border-bottom-color: rgba(249, 115, 22, 0.3);
	}

	.status-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1200px;
		margin: 0 auto;
		font-size: 0.875rem;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
	}

	.status-dot.connected {
		background: #22c55e;
		animation: pulse-green 2s infinite;
	}

	.status-dot.disconnected {
		background: #ef4444;
	}

	.status-dot.reconnecting {
		background: #f97316;
		animation: pulse-orange 1s infinite;
	}

	.last-update {
		color: var(--theme-text-secondary);
		font-size: 0.75rem;
	}

	@keyframes pulse-green {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes pulse-orange {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.status-content {
			flex-direction: column;
			gap: 0.25rem;
		}
	}
</style>