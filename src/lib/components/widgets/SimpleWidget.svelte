<script lang="ts">
	import { sensorStore } from '$stores/sensorStore.js';
	import { cls, getSensorClass } from '$utils/classnames.js';
	import type { WidgetConfig } from '$types/widget.js';

	// Props
	export let widget: WidgetConfig;
	export let isDragging = false;
	export let isResizing = false;

	// Widget configuration
	let config = $derived(widget);
	let appearance = $derived(config.appearance);
	let chartParams = $derived(appearance.chartParams);

	// Sensor data binding
	let sensorValue = $derived(() => {
		if (!config.sensorPath) return 0;
		return sensorStore.getSensorValue(config.sensorPath);
	});

	// Historical data for trend indication
	let sensorHistory = $derived(() => {
		return sensorStore.getHistoryForSensor(config.sensorPath, 5);
	});

	// Calculate trend
	let trend = $derived(() => {
		if (sensorHistory.length < 2) return 'stable';
		
		const recent = sensorHistory.slice(-2);
		const diff = recent[1].value - recent[0].value;
		const threshold = 1; // Minimum change to consider significant
		
		if (Math.abs(diff) < threshold) return 'stable';
		return diff > 0 ? 'up' : 'down';
	});

	// Unit display
	let unit = $derived(() => {
		const sensorType = config.sensorPath.split('.')[1];
		switch (sensorType) {
			case 'temperature': return '°C';
			case 'usage': return '%';
			case 'frequency': return 'MHz';
			case 'voltage': return 'V';
			case 'fanSpeed': return 'RPM';
			case 'available': return 'GB';
			case 'total': return 'GB';
			default: return '%';
		}
	});

	// Format display value
	let displayValue = $derived(() => {
		const value = sensorValue();
		
		if (unit === 'MHz' && value > 1000) {
			return `${(value / 1000).toFixed(1)} GHz`;
		} else if (unit === 'GB') {
			return `${value.toFixed(1)} ${unit}`;
		} else if (unit === 'RPM') {
			return `${Math.round(value)} ${unit}`;
		} else {
			return `${Math.round(value)}${unit}`;
		}
	});

	// Color thresholds for different sensor types
	let colorThresholds = $derived(() => {
		const sensorType = config.sensorPath.split('.')[1];
		
		switch (sensorType) {
			case 'temperature':
				return { low: 50, medium: 70, high: 85 };
			case 'usage':
				return { low: 30, medium: 60, high: 85 };
			case 'voltage':
				return { low: 0.5, medium: 1.0, high: 1.5 };
			default:
				return { low: 30, medium: 60, high: 85 };
		}
	});

	// Dynamic styling based on value
	let valueClass = $derived(() => {
		const value = sensorValue();
		return getSensorClass(value, colorThresholds, 'simple-value');
	});

	// Background color for the value
	let backgroundColor = $derived(() => {
		const value = sensorValue();
		const colors = appearance.colors;
		
		if (value >= colorThresholds.high) {
			return colors[2] || '#fef2f2'; // Light red background
		} else if (value >= colorThresholds.medium) {
			return colors[1] || '#fefceb'; // Light yellow background
		} else {
			return colors[0] || '#f0fdf4'; // Light green background
		}
	});

	// Text color
	let textColor = $derived(() => {
		const value = sensorValue();
		
		if (value >= colorThresholds.high) {
			return '#dc2626'; // Red text
		} else if (value >= colorThresholds.medium) {
			return '#d97706'; // Orange text
		} else {
			return '#16a34a'; // Green text
		}
	});

	// Trend icon
	let trendIcon = $derived(() => {
		switch (trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			default: return '→';
		}
	});

	// Animation duration
	let animationDuration = $derived(chartParams?.animationDuration || 250);

	// Accessibility label
	let ariaLabel = $derived(() => {
		return `${config.title}: ${displayValue()}, trend ${trend}`;
	});

	// Connection status
	let isConnected = $derived(sensorStore.isConnected);
	let connectionStatus = $derived(sensorStore.status);
</script>

<div 
	class="simple-widget"
	class:dragging={isDragging}
	class:resizing={isResizing}
	class:disconnected={!isConnected}
	role="img"
	aria-label={ariaLabel}
>
	{#if isConnected}
		<div class="simple-content">
			<!-- Main value display -->
			<div 
				class="value-container"
				style:background-color={backgroundColor}
				style:transition="all {animationDuration}ms ease"
			>
				<div 
					class={cls('value-text', valueClass)}
					style:color={textColor}
					style:font-size="{appearance.typography.fontSize}px"
					style:font-weight={appearance.typography.fontWeight}
				>
					{displayValue}
				</div>
				
				<!-- Trend indicator -->
				{#if chartParams?.showLabels !== false && sensorHistory.length > 1}
					<div class="trend-indicator" title="Trend: {trend}">
						{trendIcon}
					</div>
				{/if}
			</div>

			<!-- Additional info -->
			<div class="info-row">
				<!-- Min/Max values -->
				{#if sensorHistory.length > 0}
					{@const values = sensorHistory.map(h => h.value)}
					{@const min = Math.min(...values)}
					{@const max = Math.max(...values)}
					<div class="min-max">
						<span class="min-value" title="Minimum">↓{Math.round(min)}{unit}</span>
						<span class="max-value" title="Maximum">↑{Math.round(max)}{unit}</span>
					</div>
				{/if}

				<!-- Last update time -->
				<div class="last-update" title="Last updated: {new Date(sensorStore.lastUpdate).toLocaleTimeString()}">
					{sensorStore.lastUpdate ? new Date(sensorStore.lastUpdate).toLocaleTimeString() : '--:--:--'}
				</div>
			</div>
		</div>
	{:else}
		<!-- Connection status -->
		<div class="simple-disconnected">
			<div class="disconnected-icon">
				{#if connectionStatus === 'reconnecting'}
					⟳
				{:else}
					⚠️
				{/if}
			</div>
			<div class="disconnected-text">
				{connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
			</div>
		</div>
	{/if}

	<!-- Alert indicators -->
	{#if config.alerts.some(alert => alert.enabled && alert.triggered)}
		<div class="alert-indicator" aria-label="Alert active">
			🚨
		</div>
	{/if}
</div>

<style>
	.simple-widget {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: all 0.2s ease;
	}

	.simple-widget.dragging {
		opacity: 0.8;
	}

	.simple-widget.resizing {
		border: 2px dashed var(--theme-accent-primary);
	}

	.simple-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.5rem;
	}

	.value-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		border-radius: 0.5rem;
		padding: 1rem;
		margin-bottom: 0.5rem;
		transition: all 0.3s ease;
	}

	.value-text {
		font-family: var(--theme-font-mono, 'JetBrains Mono', monospace);
		font-weight: 700;
		text-align: center;
		line-height: 1;
		transition: all 0.3s ease;
	}

	.trend-indicator {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-size: 1rem;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.value-container:hover .trend-indicator {
		opacity: 1;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		padding: 0 0.25rem;
	}

	.min-max {
		display: flex;
		gap: 0.5rem;
	}

	.min-value,
	.max-value {
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: var(--theme-bg-secondary);
		font-family: var(--theme-font-mono, monospace);
		font-size: 0.7rem;
	}

	.min-value {
		color: var(--sensor-performance-low);
	}

	.max-value {
		color: var(--sensor-thermal-high);
	}

	.last-update {
		font-family: var(--theme-font-mono, monospace);
		opacity: 0.6;
	}

	.simple-disconnected {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--theme-text-secondary);
		text-align: center;
	}

	.disconnected-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		opacity: 0.7;
	}

	.disconnected-text {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.alert-indicator {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		font-size: 0.875rem;
		animation: pulse 2s infinite;
		z-index: 10;
	}

	/* Sensor value color classes */
	:global(.simple-value-low) {
		color: var(--sensor-thermal-low);
	}

	:global(.simple-value-medium) {
		color: var(--sensor-thermal-medium);
	}

	:global(.simple-value-high) {
		color: var(--sensor-thermal-high);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.simple-content {
			padding: 0.25rem;
		}

		.value-container {
			padding: 0.75rem;
			margin-bottom: 0.25rem;
		}

		.info-row {
			font-size: 0.7rem;
		}

		.min-value,
		.max-value {
			font-size: 0.625rem;
		}

		.trend-indicator {
			font-size: 0.875rem;
		}

		.disconnected-icon {
			font-size: 1.5rem;
		}

		.disconnected-text {
			font-size: 0.75rem;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.simple-widget,
		.value-container,
		.value-text,
		.trend-indicator {
			transition: none;
			animation: none;
		}

		.alert-indicator {
			animation: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.value-container {
			border: 2px solid var(--theme-border-primary);
		}

		.value-text {
			font-weight: 900;
		}

		.simple-widget.resizing {
			border-width: 3px;
		}
	}
</style>