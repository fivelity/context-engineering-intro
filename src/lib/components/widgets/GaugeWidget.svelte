<script lang="ts">
	import { Chart, Layer, Arc, Text } from 'layerchart';
	import { SpringValue } from 'layerchart/animate';
	import { sensorStore } from '$stores/sensorStore.js';
	import { cls, getSensorClass } from '$utils/classnames.js';
	import type { WidgetConfig } from '$types/widget.js';

	// Props
	export let widget: WidgetConfig;
	export let isDragging = false;
	export let isResizing = false;

	// Widget configuration with defaults
	let config = $derived(widget);
	let appearance = $derived(config.appearance);
	let chartParams = $derived(appearance.chartParams);

	// Sensor data binding
	let sensorValue = $derived(() => {
		if (!config.sensorPath) return 0;
		return sensorStore.getSensorValue(config.sensorPath);
	});

	// Chart configuration
	let segments = $derived(chartParams?.segments || 60);
	let startAngle = $derived((chartParams?.startAngle || 0) * (Math.PI / 180));
	let endAngle = $derived((chartParams?.endAngle || 270) * (Math.PI / 180));
	let showLabels = $derived(chartParams?.showLabels ?? true);
	let animationDuration = $derived(chartParams?.animationDuration || 750);

	// Color thresholds for different sensor types
	let colorThresholds = $derived(() => {
		const sensorType = config.sensorPath.split('.')[1]; // e.g., 'temperature', 'usage'
		
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

	// Dynamic color based on value and thresholds
	let gaugeColor = $derived(() => {
		const value = sensorValue();
		const colors = appearance.colors;
		
		if (value >= colorThresholds.high) {
			return colors[2] || '#ef4444'; // Red for high/critical
		} else if (value >= colorThresholds.medium) {
			return colors[1] || '#f97316'; // Orange for medium
		} else {
			return colors[0] || '#22c55e'; // Green for low/good
		}
	});

	// Inactive segment color
	let inactiveColor = $derived(() => {
		return 'rgba(var(--color-surface-400) / 0.2)';
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
			default: return '%';
		}
	});

	// Format display value
	let displayValue = $derived(() => {
		const value = sensorValue();
		if (unit === 'MHz') {
			return `${Math.round(value)} ${unit}`;
		} else if (unit === 'RPM') {
			return `${Math.round(value)} ${unit}`;
		} else {
			return `${Math.round(value)}${unit}`;
		}
	});

	// Calculate total angle range
	let totalAngle = $derived(endAngle - startAngle);
	let segmentAngle = $derived(totalAngle / segments);

	// Accessibility label
	let ariaLabel = $derived(() => {
		return `${config.title}: ${displayValue()}`;
	});
</script>

<div 
	class="gauge-widget"
	class:dragging={isDragging}
	class:resizing={isResizing}
	role="img"
	aria-label={ariaLabel}
>
	{#if sensorStore.isConnected}
		<Chart>
			<Layer center>
				<SpringValue 
					value={sensorValue()} 
					let:value
					options={{ duration: animationDuration }}
				>
					<!-- Gauge segments -->
					{#each Array(segments) as _, i}
						{@const currentAngle = startAngle + (i * segmentAngle)}
						{@const nextAngle = startAngle + ((i + 1) * segmentAngle)}
						{@const segmentProgress = (i / segments) * 100}
						{@const isActive = segmentProgress < value}
						
						<Arc
							startAngle={currentAngle}
							endAngle={nextAngle}
							innerRadius={-20}
							outerRadius={10}
							padAngle={0.01}
							class={cls(isActive ? 'gauge-segment-active' : 'gauge-segment-inactive')}
							style:fill={isActive ? gaugeColor : inactiveColor}
						/>
					{/each}

					<!-- Center text display -->
					{#if showLabels}
						<Text
							value={displayValue}
							textAnchor="middle"
							verticalAnchor="middle"
							class="gauge-text"
							style:font-size="{appearance.typography.fontSize}px"
							style:font-weight={appearance.typography.fontWeight}
							style:fill={appearance.typography.color}
						/>
					{/if}
				</SpringValue>
			</Layer>
		</Chart>
	{:else}
		<!-- Connection status indicator -->
		<div class="gauge-disconnected">
			<div class="disconnected-icon">⚠️</div>
			<div class="disconnected-text">Disconnected</div>
		</div>
	{/if}

	<!-- Alert indicators -->
	{#if config.alerts.some(alert => alert.enabled && alert.triggered)}
		<div class="alert-indicator" aria-label="Alert active">
			🚨
		</div>
	{/if}

	<!-- Loading overlay -->
	{#if sensorStore.status === 'reconnecting'}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
		</div>
	{/if}
</div>

<style>
	.gauge-widget {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: all 0.2s ease;
	}

	.gauge-widget.dragging {
		opacity: 0.8;
	}

	.gauge-widget.resizing {
		border: 2px dashed var(--theme-accent-primary);
	}

	:global(.gauge-segment-active) {
		transition: fill 0.3s ease;
	}

	:global(.gauge-segment-inactive) {
		transition: fill 0.3s ease;
	}

	:global(.gauge-text) {
		font-family: var(--theme-font-mono, 'JetBrains Mono', monospace);
		font-weight: 600;
		text-anchor: middle;
		dominant-baseline: middle;
		user-select: none;
	}

	.gauge-disconnected {
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
		top: 0.5rem;
		right: 0.5rem;
		font-size: 1rem;
		animation: pulse 2s infinite;
		z-index: 10;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-surface-900) / 0.5);
		border-radius: inherit;
		z-index: 20;
	}

	.loading-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid transparent;
		border-top-color: var(--theme-accent-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		:global(.gauge-text) {
			font-size: 1rem !important;
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
		.gauge-widget,
		:global(.gauge-segment-active),
		:global(.gauge-segment-inactive),
		.loading-spinner {
			transition: none;
			animation: none;
		}

		.alert-indicator {
			animation: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.gauge-widget.resizing {
			border-width: 3px;
		}
		
		:global(.gauge-text) {
			font-weight: 700;
		}
	}
</style>