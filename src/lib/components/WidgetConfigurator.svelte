<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { validateWidgetForm, validateAlertForm, type WidgetFormInput, type AlertFormInput } from '$schemas/widgetConfig.js';
	import type { WidgetConfig, AlertCondition } from '$types/widget.js';

	// Props
	let { isOpen = $bindable(false), widget = $bindable<WidgetConfig | null>(null), mode = $bindable<'create' | 'edit'>('create') } = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		save: WidgetConfig;
		cancel: void;
		close: void;
	}>();

	// Form state using Svelte 5 runes
	let activeTab = $state<'basic' | 'appearance' | 'alerts' | 'preview'>('basic');
	let formData = $state<WidgetFormInput>({
		title: '',
		type: 'gauge',
		sensorPath: 'cpu.usage',
		colors: ['#22c55e', '#f59e0b', '#ef4444'],
		fontSize: 16,
		fontWeight: 'normal',
		borderRadius: 8,
		borderThickness: 1,
		enableAlerts: false,
		alertThreshold: 80,
		alertSeverity: 'medium'
	});

	let alertsData = $state<AlertFormInput[]>([]);
	let formErrors = $state<Record<string, string>>({});
	let alertErrors = $state<Record<string, string>>({});

	// Computed values
	let isValid = $derived(() => {
		const validation = validateWidgetForm(formData);
		return validation.success && Object.keys(formErrors).length === 0;
	});

	let previewConfig = $derived<Partial<WidgetConfig>>(() => ({
		id: widget?.id || `preview-${Date.now()}`,
		type: formData.type,
		title: formData.title,
		sensorPath: formData.sensorPath,
		appearance: {
			colors: formData.colors,
			typography: {
				fontSize: formData.fontSize,
				fontWeight: formData.fontWeight,
				color: formData.colors[0]
			},
			borders: {
				thickness: formData.borderThickness,
				style: 'solid',
				radius: formData.borderRadius
			},
			chartParams: {
				segments: formData.type === 'gauge' ? 60 : undefined,
				startAngle: formData.type === 'gauge' ? 0 : undefined,
				endAngle: formData.type === 'gauge' ? 270 : undefined,
				strokeWidth: formData.type === 'graph' ? 2 : undefined,
				barThickness: formData.type === 'meter' ? 8 : undefined,
				showLabels: true,
				animationDuration: 500
			}
		},
		alerts: alertsData.map(alert => ({
			id: `alert-${Date.now()}-${Math.random()}`,
			name: alert.name,
			sensorPath: alert.sensorPath,
			operator: alert.operator,
			threshold: alert.threshold,
			unit: alert.unit,
			enabled: true,
			triggered: false,
			notificationEnabled: alert.notificationEnabled,
			severity: alert.severity
		})) as AlertCondition[],
		size: { w: 4, h: 3 },
		position: { x: 0, y: 0 },
		minSize: { w: 2, h: 2 },
		maxSize: { w: 8, h: 6 },
		createdAt: Date.now(),
		updatedAt: Date.now()
	}));

	// Available sensor paths (from sensorStore)
	const sensorPaths = [
		'cpu.usage',
		'cpu.temperature',
		'cpu.frequency',
		'cpu.voltage',
		'gpu.usage',
		'gpu.temperature',
		'gpu.memory',
		'gpu.fanSpeed',
		'memory.usage',
		'memory.available',
		'storage.usage',
		'storage.temperature',
		'motherboard.temperature'
	];

	// Widget type definitions
	const widgetTypes = [
		{ value: 'gauge', label: 'Gauge', description: 'Circular or arc gauge for single values' },
		{ value: 'graph', label: 'Graph', description: 'Line, area, or bar chart for time series' },
		{ value: 'simple', label: 'Simple', description: 'Minimal single-value display' },
		{ value: 'meter', label: 'Meter', description: 'Horizontal progress bar' },
		{ value: 'multi-resource', label: 'Multi-Resource', description: 'Multiple sensors in one widget' }
	];

	// Initialize form data when widget changes
	$effect(() => {
		if (widget && mode === 'edit') {
			formData = {
				title: widget.title,
				type: widget.type,
				sensorPath: widget.sensorPath,
				colors: widget.appearance.colors,
				fontSize: widget.appearance.typography.fontSize,
				fontWeight: widget.appearance.typography.fontWeight as any,
				borderRadius: widget.appearance.borders.radius,
				borderThickness: widget.appearance.borders.thickness,
				enableAlerts: widget.alerts.length > 0,
				alertThreshold: widget.alerts[0]?.threshold || 80,
				alertSeverity: widget.alerts[0]?.severity || 'medium'
			};

			alertsData = widget.alerts.map(alert => ({
				name: alert.name,
				sensorPath: alert.sensorPath,
				operator: alert.operator,
				threshold: alert.threshold,
				unit: alert.unit,
				severity: alert.severity,
				notificationEnabled: alert.notificationEnabled
			}));
		}
	});

	// Validate form on changes
	$effect(() => {
		const validation = validateWidgetForm(formData);
		if (!validation.success) {
			formErrors = validation.error.issues.reduce((acc, issue) => {
				acc[issue.path[0]] = issue.message;
				return acc;
			}, {} as Record<string, string>);
		} else {
			formErrors = {};
		}
	});

	// Functions
	function handleSave() {
		if (!isValid) return;

		const config: WidgetConfig = {
			id: widget?.id || `widget-${Date.now()}`,
			type: formData.type,
			title: formData.title,
			sensorPath: formData.sensorPath,
			appearance: {
				colors: formData.colors,
				typography: {
					fontSize: formData.fontSize,
					fontWeight: formData.fontWeight,
					color: formData.colors[0]
				},
				borders: {
					thickness: formData.borderThickness,
					style: 'solid',
					radius: formData.borderRadius
				},
				chartParams: {
					segments: formData.type === 'gauge' ? 60 : undefined,
					startAngle: formData.type === 'gauge' ? 0 : undefined,
					endAngle: formData.type === 'gauge' ? 270 : undefined,
					strokeWidth: formData.type === 'graph' ? 2 : undefined,
					barThickness: formData.type === 'meter' ? 8 : undefined,
					showLabels: true,
					animationDuration: 500
				}
			},
			alerts: alertsData.map(alert => ({
				id: `alert-${Date.now()}-${Math.random()}`,
				name: alert.name,
				sensorPath: alert.sensorPath,
				operator: alert.operator,
				threshold: alert.threshold,
				unit: alert.unit,
				enabled: true,
				triggered: false,
				notificationEnabled: alert.notificationEnabled,
				severity: alert.severity
			})) as AlertCondition[],
			size: widget?.size || { w: 4, h: 3 },
			position: widget?.position || { x: 0, y: 0 },
			minSize: { w: 2, h: 2 },
			maxSize: { w: 8, h: 6 },
			createdAt: widget?.createdAt || Date.now(),
			updatedAt: Date.now()
		};

		dispatch('save', config);
		handleClose();
	}

	function handleCancel() {
		dispatch('cancel');
		handleClose();
	}

	function handleClose() {
		isOpen = false;
		activeTab = 'basic';
		formErrors = {};
		alertErrors = {};
		dispatch('close');
	}

	function addAlert() {
		alertsData.push({
			name: `Alert ${alertsData.length + 1}`,
			sensorPath: formData.sensorPath,
			operator: 'gt',
			threshold: 80,
			unit: '%',
			severity: 'medium',
			notificationEnabled: true
		});
	}

	function removeAlert(index: number) {
		alertsData.splice(index, 1);
	}

	function addColor() {
		if (formData.colors.length < 10) {
			formData.colors.push('#6b7280');
		}
	}

	function removeColor(index: number) {
		if (formData.colors.length > 1) {
			formData.colors.splice(index, 1);
		}
	}

	// Handle keyboard shortcuts
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleCancel();
		} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			handleSave();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="widget-config-title">
		<div class="modal-container">
			<div class="modal-header">
				<h2 id="widget-config-title" class="modal-title">
					{mode === 'create' ? 'Create Widget' : 'Edit Widget'}
				</h2>
				<button class="close-button" onclick={handleClose} aria-label="Close modal">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<!-- Tab Navigation -->
				<nav class="tab-nav" role="tablist">
					<button
						class="tab-button"
						class:active={activeTab === 'basic'}
						onclick={() => activeTab = 'basic'}
						role="tab"
						aria-selected={activeTab === 'basic'}
					>
						Basic
					</button>
					<button
						class="tab-button"
						class:active={activeTab === 'appearance'}
						onclick={() => activeTab = 'appearance'}
						role="tab"
						aria-selected={activeTab === 'appearance'}
					>
						Appearance
					</button>
					<button
						class="tab-button"
						class:active={activeTab === 'alerts'}
						onclick={() => activeTab = 'alerts'}
						role="tab"
						aria-selected={activeTab === 'alerts'}
					>
						Alerts
					</button>
					<button
						class="tab-button"
						class:active={activeTab === 'preview'}
						onclick={() => activeTab = 'preview'}
						role="tab"
						aria-selected={activeTab === 'preview'}
					>
						Preview
					</button>
				</nav>

				<!-- Tab Content -->
				<div class="tab-content" role="tabpanel">
					{#if activeTab === 'basic'}
						<div class="form-section">
							<div class="form-group">
								<label for="widget-title">Widget Title</label>
								<input
									id="widget-title"
									type="text"
									bind:value={formData.title}
									class="form-input"
									class:error={formErrors.title}
									placeholder="Enter widget title"
									maxlength="200"
								/>
								{#if formErrors.title}
									<span class="error-message">{formErrors.title}</span>
								{/if}
							</div>

							<div class="form-group">
								<label for="widget-type">Widget Type</label>
								<select
									id="widget-type"
									bind:value={formData.type}
									class="form-select"
									class:error={formErrors.type}
								>
									{#each widgetTypes as type}
										<option value={type.value}>{type.label}</option>
									{/each}
								</select>
								{#if formErrors.type}
									<span class="error-message">{formErrors.type}</span>
								{/if}
								<p class="form-help">
									{widgetTypes.find(t => t.value === formData.type)?.description}
								</p>
							</div>

							<div class="form-group">
								<label for="sensor-path">Sensor Path</label>
								<select
									id="sensor-path"
									bind:value={formData.sensorPath}
									class="form-select"
									class:error={formErrors.sensorPath}
								>
									{#each sensorPaths as path}
										<option value={path}>{path}</option>
									{/each}
								</select>
								{#if formErrors.sensorPath}
									<span class="error-message">{formErrors.sensorPath}</span>
								{/if}
							</div>
						</div>

					{:else if activeTab === 'appearance'}
						<div class="form-section">
							<div class="form-group">
								<label>Colors</label>
								<div class="color-inputs">
									{#each formData.colors as color, index}
										<div class="color-input-group">
											<input
												type="color"
												bind:value={color}
												class="color-input"
												title="Color {index + 1}"
											/>
											<button
												class="remove-color-btn"
												onclick={() => removeColor(index)}
												disabled={formData.colors.length <= 1}
												aria-label="Remove color {index + 1}"
											>
												×
											</button>
										</div>
									{/each}
									{#if formData.colors.length < 10}
										<button class="add-color-btn" onclick={addColor} aria-label="Add color">
											+
										</button>
									{/if}
								</div>
							</div>

							<div class="form-group">
								<label for="font-size">Font Size</label>
								<input
									id="font-size"
									type="range"
									min="8"
									max="72"
									bind:value={formData.fontSize}
									class="range-input"
								/>
								<span class="range-value">{formData.fontSize}px</span>
							</div>

							<div class="form-group">
								<label for="font-weight">Font Weight</label>
								<select
									id="font-weight"
									bind:value={formData.fontWeight}
									class="form-select"
								>
									<option value="light">Light</option>
									<option value="normal">Normal</option>
									<option value="medium">Medium</option>
									<option value="semibold">Semibold</option>
									<option value="bold">Bold</option>
								</select>
							</div>

							<div class="form-group">
								<label for="border-radius">Border Radius</label>
								<input
									id="border-radius"
									type="range"
									min="0"
									max="50"
									bind:value={formData.borderRadius}
									class="range-input"
								/>
								<span class="range-value">{formData.borderRadius}px</span>
							</div>

							<div class="form-group">
								<label for="border-thickness">Border Thickness</label>
								<input
									id="border-thickness"
									type="range"
									min="0"
									max="10"
									bind:value={formData.borderThickness}
									class="range-input"
								/>
								<span class="range-value">{formData.borderThickness}px</span>
							</div>
						</div>

					{:else if activeTab === 'alerts'}
						<div class="form-section">
							<div class="form-group">
								<label class="checkbox-label">
									<input
										type="checkbox"
										bind:checked={formData.enableAlerts}
										class="checkbox-input"
									/>
									Enable Alerts
								</label>
							</div>

							{#if formData.enableAlerts}
								<div class="alerts-section">
									<div class="alerts-header">
										<h3>Alert Conditions</h3>
										<button class="add-alert-btn" onclick={addAlert}>
											Add Alert
										</button>
									</div>

									{#each alertsData as alert, index}
										<div class="alert-item">
											<div class="alert-header">
												<input
													type="text"
													bind:value={alert.name}
													class="form-input"
													placeholder="Alert name"
												/>
												<button
													class="remove-alert-btn"
													onclick={() => removeAlert(index)}
													aria-label="Remove alert"
												>
													×
												</button>
											</div>

											<div class="alert-config">
												<select bind:value={alert.sensorPath} class="form-select">
													{#each sensorPaths as path}
														<option value={path}>{path}</option>
													{/each}
												</select>

												<select bind:value={alert.operator} class="form-select">
													<option value="gt">Greater than</option>
													<option value="gte">Greater than or equal</option>
													<option value="lt">Less than</option>
													<option value="lte">Less than or equal</option>
													<option value="eq">Equal to</option>
												</select>

												<input
													type="number"
													bind:value={alert.threshold}
													class="form-input"
													placeholder="Threshold"
												/>

												<input
													type="text"
													bind:value={alert.unit}
													class="form-input"
													placeholder="Unit"
													maxlength="10"
												/>

												<select bind:value={alert.severity} class="form-select">
													<option value="low">Low</option>
													<option value="medium">Medium</option>
													<option value="high">High</option>
													<option value="critical">Critical</option>
												</select>

												<label class="checkbox-label">
													<input
														type="checkbox"
														bind:checked={alert.notificationEnabled}
														class="checkbox-input"
													/>
													Notify
												</label>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

					{:else if activeTab === 'preview'}
						<div class="preview-section">
							<h3>Widget Preview</h3>
							<div class="preview-container">
								<div class="preview-widget">
									<!-- Widget preview content would go here -->
									<div class="preview-placeholder">
										<h4 style="font-size: {formData.fontSize}px; font-weight: {formData.fontWeight};">
											{formData.title || 'Widget Title'}
										</h4>
										<div class="preview-content" style="border-radius: {formData.borderRadius}px; border-width: {formData.borderThickness}px;">
											<div class="preview-value" style="color: {formData.colors[0]};">
												{formData.type === 'gauge' ? '75%' : formData.type === 'graph' ? 'Graph' : formData.type === 'meter' ? '▬▬▬▬▬░░░' : '42.3°C'}
											</div>
											<div class="preview-sensor-path">{formData.sensorPath}</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<div class="modal-footer">
				<button class="cancel-button" onclick={handleCancel}>
					Cancel
				</button>
				<button class="save-button" onclick={handleSave} disabled={!isValid}>
					{mode === 'create' ? 'Create Widget' : 'Save Changes'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-container {
		background: var(--theme-bg-primary, white);
		border-radius: 0.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		color: var(--theme-text-primary, #1f2937);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--theme-border-primary, #e5e7eb);
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.25rem;
		color: var(--theme-text-secondary, #6b7280);
		transition: all 0.2s;
	}

	.close-button:hover {
		background: var(--theme-bg-secondary, #f3f4f6);
		color: var(--theme-text-primary, #1f2937);
	}

	.modal-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.tab-nav {
		display: flex;
		border-bottom: 1px solid var(--theme-border-primary, #e5e7eb);
		padding: 0 1.5rem;
	}

	.tab-button {
		background: none;
		border: none;
		padding: 1rem 1.5rem;
		cursor: pointer;
		font-weight: 500;
		color: var(--theme-text-secondary, #6b7280);
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-button:hover {
		color: var(--theme-text-primary, #1f2937);
		background: var(--theme-bg-secondary, #f3f4f6);
	}

	.tab-button.active {
		color: var(--theme-accent-primary, #3b82f6);
		border-bottom-color: var(--theme-accent-primary, #3b82f6);
	}

	.tab-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: 500;
		color: var(--theme-text-primary, #1f2937);
	}

	.form-input,
	.form-select {
		padding: 0.75rem;
		border: 1px solid var(--theme-border-primary, #d1d5db);
		border-radius: 0.375rem;
		font-size: 0.875rem;
		transition: all 0.2s;
		background: var(--theme-bg-primary, white);
		color: var(--theme-text-primary, #1f2937);
	}

	.form-input:focus,
	.form-select:focus {
		outline: none;
		border-color: var(--theme-accent-primary, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-input.error,
	.form-select.error {
		border-color: var(--theme-error, #ef4444);
	}

	.form-help {
		font-size: 0.75rem;
		color: var(--theme-text-secondary, #6b7280);
		margin: 0;
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--theme-error, #ef4444);
	}

	.color-inputs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.color-input-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.color-input {
		width: 3rem;
		height: 3rem;
		border: 1px solid var(--theme-border-primary, #d1d5db);
		border-radius: 0.375rem;
		cursor: pointer;
		padding: 0;
	}

	.remove-color-btn,
	.add-color-btn {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--theme-border-primary, #d1d5db);
		border-radius: 0.375rem;
		background: var(--theme-bg-secondary, #f3f4f6);
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.remove-color-btn:hover,
	.add-color-btn:hover {
		background: var(--theme-bg-tertiary, #e5e7eb);
	}

	.remove-color-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.range-input {
		width: 100%;
		margin: 0.5rem 0;
	}

	.range-value {
		font-size: 0.875rem;
		color: var(--theme-text-secondary, #6b7280);
		font-weight: 500;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-input {
		width: 1rem;
		height: 1rem;
		accent-color: var(--theme-accent-primary, #3b82f6);
	}

	.alerts-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.alerts-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.alerts-header h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.add-alert-btn {
		padding: 0.5rem 1rem;
		background: var(--theme-accent-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.add-alert-btn:hover {
		background: var(--theme-accent-secondary, #2563eb);
	}

	.alert-item {
		border: 1px solid var(--theme-border-primary, #e5e7eb);
		border-radius: 0.375rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.alert-header {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.alert-header input {
		flex: 1;
	}

	.remove-alert-btn {
		background: var(--theme-error, #ef4444);
		color: white;
		border: none;
		border-radius: 0.375rem;
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.remove-alert-btn:hover {
		background: var(--theme-error-dark, #dc2626);
	}

	.alert-config {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
		gap: 0.5rem;
		align-items: center;
	}

	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-section h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.preview-container {
		border: 1px solid var(--theme-border-primary, #e5e7eb);
		border-radius: 0.375rem;
		padding: 2rem;
		background: var(--theme-bg-secondary, #f9fafb);
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}

	.preview-widget {
		background: var(--theme-bg-primary, white);
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		width: 200px;
		text-align: center;
	}

	.preview-placeholder {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preview-content {
		border: 1px solid var(--theme-border-primary, #e5e7eb);
		padding: 1rem;
		background: var(--theme-bg-secondary, #f9fafb);
	}

	.preview-value {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.preview-sensor-path {
		font-size: 0.75rem;
		color: var(--theme-text-secondary, #6b7280);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--theme-border-primary, #e5e7eb);
	}

	.cancel-button {
		padding: 0.75rem 1.5rem;
		border: 1px solid var(--theme-border-primary, #d1d5db);
		background: var(--theme-bg-primary, white);
		color: var(--theme-text-primary, #1f2937);
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.cancel-button:hover {
		background: var(--theme-bg-secondary, #f3f4f6);
	}

	.save-button {
		padding: 0.75rem 1.5rem;
		background: var(--theme-accent-primary, #3b82f6);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.save-button:hover:not(:disabled) {
		background: var(--theme-accent-secondary, #2563eb);
	}

	.save-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.modal-container {
			max-width: 100%;
			max-height: 100vh;
			margin: 0;
		}

		.alert-config {
			grid-template-columns: 1fr;
		}

		.tab-nav {
			flex-wrap: wrap;
			padding: 0;
		}

		.tab-button {
			flex: 1;
			min-width: 25%;
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
			animation: none !important;
		}
	}

	@media (prefers-contrast: high) {
		.modal-container {
			border: 2px solid var(--theme-text-primary, #1f2937);
		}
	}
</style>