<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { layoutStore } from '$lib/stores/layoutStore.js';
	
	const dispatch = createEventDispatcher();
	
	// Modal state
	let activeTab = $state<'export' | 'import'>('export');
	let importText = $state('');
	let exportText = $state('');
	let importError = $state('');
	let exportSuccess = $state(false);
	
	// Generate export data
	function generateExportData() {
		const layoutData = layoutStore.exportLayout();
		exportText = JSON.stringify(layoutData, null, 2);
	}
	
	// Handle import
	function handleImport() {
		try {
			const data = JSON.parse(importText);
			dispatch('import', data);
			dispatch('close');
		} catch (error) {
			importError = 'Invalid JSON format. Please check your input.';
		}
	}
	
	// Handle export to clipboard
	async function handleCopyToClipboard() {
		try {
			await navigator.clipboard.writeText(exportText);
			exportSuccess = true;
			setTimeout(() => {
				exportSuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
		}
	}
	
	// Handle file download
	function handleDownload() {
		const blob = new Blob([exportText], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `sensecanvas-layout-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
	
	// Handle file upload
	function handleFileUpload(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				importText = e.target?.result as string;
				importError = '';
			};
			reader.readAsText(file);
		}
	}
	
	// Close modal
	function handleClose() {
		dispatch('close');
	}
	
	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
	
	// Initialize export data
	generateExportData();
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" onclick={handleClose}>
	<div class="modal" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>Import/Export Layout</h2>
			<button class="close-button" onclick={handleClose} aria-label="Close modal">
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 6L6 18M6 6l12 12"/>
				</svg>
			</button>
		</div>
		
		<div class="modal-content">
			<!-- Tab Navigation -->
			<div class="tab-nav">
				<button 
					class="tab-button"
					class:active={activeTab === 'export'}
					onclick={() => activeTab = 'export'}
				>
					<span class="tab-icon">📤</span>
					Export
				</button>
				<button 
					class="tab-button"
					class:active={activeTab === 'import'}
					onclick={() => activeTab = 'import'}
				>
					<span class="tab-icon">📥</span>
					Import
				</button>
			</div>
			
			<!-- Export Tab -->
			{#if activeTab === 'export'}
				<div class="tab-content">
					<div class="section">
						<h3>Export Dashboard Layout</h3>
						<p>Copy your dashboard configuration to share or backup.</p>
						
						<div class="export-actions">
							<button class="btn-primary" onclick={handleCopyToClipboard}>
								<span class="btn-icon">📋</span>
								{exportSuccess ? 'Copied!' : 'Copy to Clipboard'}
							</button>
							<button class="btn-secondary" onclick={handleDownload}>
								<span class="btn-icon">💾</span>
								Download as File
							</button>
						</div>
						
						<div class="code-container">
							<textarea 
								class="code-textarea"
								bind:value={exportText}
								readonly
								placeholder="Export data will appear here..."
							></textarea>
						</div>
					</div>
				</div>
			{/if}
			
			<!-- Import Tab -->
			{#if activeTab === 'import'}
				<div class="tab-content">
					<div class="section">
						<h3>Import Dashboard Layout</h3>
						<p>Paste your dashboard configuration or upload a file to restore a layout.</p>
						
						<div class="import-actions">
							<div class="file-upload">
								<input 
									type="file" 
									accept=".json"
									onchange={handleFileUpload}
									id="file-upload"
									class="file-input"
								>
								<label for="file-upload" class="btn-secondary">
									<span class="btn-icon">📁</span>
									Upload File
								</label>
							</div>
						</div>
						
						<div class="code-container">
							<textarea 
								class="code-textarea"
								bind:value={importText}
								placeholder="Paste your layout JSON here..."
							></textarea>
						</div>
						
						{#if importError}
							<div class="error-message">
								<span class="error-icon">⚠️</span>
								{importError}
							</div>
						{/if}
						
						<div class="import-warning">
							<span class="warning-icon">⚠️</span>
							<span>Importing will replace your current layout. Make sure to export first if you want to keep it.</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
		
		<div class="modal-footer">
			<button class="btn-secondary" onclick={handleClose}>Cancel</button>
			
			{#if activeTab === 'import'}
				<button 
					class="btn-primary"
					onclick={handleImport}
					disabled={!importText.trim()}
				>
					Import Layout
				</button>
			{/if}
		</div>
	</div>
</div>

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
	
	.modal {
		background: var(--color-surface-50);
		border-radius: 12px;
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
		overflow: hidden;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-surface-200);
	}
	
	.modal-header h2 {
		margin: 0;
		color: var(--theme-text-primary);
		font-size: 1.25rem;
		font-weight: 600;
	}
	
	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		color: var(--theme-text-secondary);
		transition: all 0.2s ease;
	}
	
	.close-button:hover {
		background: var(--color-surface-200);
		color: var(--theme-text-primary);
	}
	
	.modal-content {
		flex: 1;
		overflow: auto;
	}
	
	.tab-nav {
		display: flex;
		border-bottom: 1px solid var(--color-surface-200);
	}
	
	.tab-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--theme-text-secondary);
		transition: all 0.2s ease;
		position: relative;
	}
	
	.tab-button:hover {
		background: var(--color-surface-100);
		color: var(--theme-text-primary);
	}
	
	.tab-button.active {
		color: var(--theme-accent-primary);
		background: var(--color-surface-100);
	}
	
	.tab-button.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--theme-accent-primary);
	}
	
	.tab-icon {
		font-size: 1rem;
	}
	
	.tab-content {
		padding: 1.5rem;
	}
	
	.section h3 {
		margin: 0 0 0.5rem 0;
		color: var(--theme-text-primary);
		font-size: 1.125rem;
		font-weight: 600;
	}
	
	.section p {
		margin: 0 0 1.5rem 0;
		color: var(--theme-text-secondary);
		font-size: 0.875rem;
	}
	
	.export-actions,
	.import-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.file-upload {
		position: relative;
	}
	
	.file-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	
	.btn-primary,
	.btn-secondary {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 0.2s ease;
		text-decoration: none;
	}
	
	.btn-primary {
		background: var(--theme-accent-primary);
		color: white;
	}
	
	.btn-primary:hover:not(:disabled) {
		background: var(--theme-accent-secondary);
		transform: translateY(-1px);
	}
	
	.btn-primary:disabled {
		background: var(--color-surface-300);
		color: var(--theme-text-secondary);
		cursor: not-allowed;
	}
	
	.btn-secondary {
		background: var(--color-surface-200);
		color: var(--theme-text-primary);
		border: 1px solid var(--color-surface-300);
	}
	
	.btn-secondary:hover {
		background: var(--color-surface-300);
		transform: translateY(-1px);
	}
	
	.btn-icon {
		font-size: 1rem;
	}
	
	.code-container {
		background: var(--color-surface-100);
		border: 1px solid var(--color-surface-200);
		border-radius: 8px;
		overflow: hidden;
	}
	
	.code-textarea {
		width: 100%;
		height: 200px;
		padding: 1rem;
		border: none;
		background: none;
		font-family: var(--theme-font-mono, 'JetBrains Mono', monospace);
		font-size: 0.875rem;
		color: var(--theme-text-primary);
		resize: vertical;
		outline: none;
	}
	
	.code-textarea::placeholder {
		color: var(--theme-text-secondary);
	}
	
	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		color: #991b1b;
		font-size: 0.875rem;
	}
	
	.error-icon {
		font-size: 1rem;
	}
	
	.import-warning {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgba(249, 115, 22, 0.1);
		border: 1px solid rgba(249, 115, 22, 0.3);
		border-radius: 6px;
		color: #9a3412;
		font-size: 0.875rem;
	}
	
	.warning-icon {
		font-size: 1rem;
		margin-top: 0.125rem;
	}
	
	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--color-surface-200);
	}
	
	/* Responsive design */
	@media (max-width: 768px) {
		.modal {
			max-width: 100%;
			max-height: 90vh;
		}
		
		.export-actions,
		.import-actions {
			flex-direction: column;
		}
		
		.modal-footer {
			flex-direction: column;
		}
	}
</style>