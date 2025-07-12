<!--
SenseCanvas Edit Mode Overlay Component
Visual overlay showing edit mode hints, guidelines, and quick actions.
-->

<script lang="ts">
  import { dashboardStore } from '../../stores/dashboard.svelte.js';

  interface Props {
    visible?: boolean;
    className?: string;
  }

  let { visible = true, className = '' }: Props = $props();

  // ✅ Using Svelte 5 runes for overlay state
  let showHints = $state(true);
  let showShortcuts = $state(false);
  let animationId = $state(0);

  // ✅ Derived overlay visibility
  let isVisible = $derived(() => visible && dashboardStore.isEditMode);

  let overlayClasses = $derived(() => {
    const classes = ['edit-mode-overlay', className];
    if (!isVisible()) classes.push('hidden');
    if (showShortcuts) classes.push('shortcuts-open');
    return classes.join(' ');
  });

  // Keyboard shortcuts reference
  const shortcuts = [
    { key: 'Double-click', action: 'Add widget at cursor position' },
    { key: 'Delete/Backspace', action: 'Delete selected widget' },
    { key: 'Ctrl+C', action: 'Copy selected widget' },
    { key: 'Ctrl+V', action: 'Paste widget' },
    { key: 'Ctrl+D', action: 'Duplicate selected widget' },
    { key: 'Ctrl+G', action: 'Toggle grid visibility' },
    { key: 'Ctrl+Shift+G', action: 'Toggle snap to grid' },
    { key: 'Ctrl+E', action: 'Toggle edit mode' },
    { key: 'Ctrl+S', action: 'Export dashboard' },
    { key: 'Ctrl+O', action: 'Import dashboard' },
    { key: 'Escape', action: 'Deselect widgets' }
  ];

  // Quick tips for beginners
  const tips = [
    'Double-click on empty space to add a widget',
    'Drag widgets from the toolbar to the grid',
    'Use Ctrl+D to quickly duplicate widgets',
    'Hold Shift while dragging to disable snap-to-grid',
    'Right-click widgets for context menu options'
  ];

  // ✅ Using $effect for animation cycling
  $effect(() => {
    if (!isVisible()) return;

    const interval = setInterval(() => {
      animationId = (animationId + 1) % 100;
    }, 3000);

    return () => clearInterval(interval);
  });

  function dismissHints() {
    showHints = false;
  }

  function toggleShortcuts() {
    showShortcuts = !showShortcuts;
  }

  function addRandomWidget() {
    const types = ['gauge', 'graph', 'text', 'multi-sensor'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    dashboardStore.addWidget(randomType);
  }

  function openWidgetLibrary() {
    // Emit event to parent to open widget library
    const event = new CustomEvent('widgetLibraryRequested');
    document.dispatchEvent(event);
  }

  function resetDashboard() {
    if (confirm('Reset dashboard to default layout?')) {
      dashboardStore.clearDashboard();
      // Add some default widgets
      dashboardStore.addWidget('gauge', { x: 100, y: 100 });
      dashboardStore.addWidget('graph', { x: 350, y: 100 });
      dashboardStore.addWidget('text', { x: 100, y: 350 });
      dashboardStore.addWidget('multi-sensor', { x: 350, y: 350 });
    }
  }
</script>

<div class={overlayClasses}>
  <!-- Grid Guidelines -->
  <div class="grid-guidelines">
    <div class="guideline-overlay"></div>
  </div>

  <!-- Edit Mode Hints -->
  {#if showHints}
    <div class="hints-panel">
      <div class="hints-header">
        <h3>✏️ Edit Mode Active</h3>
        <button onclick={dismissHints} class="dismiss-btn" title="Dismiss hints">×</button>
      </div>
      
      <div class="hints-content">
        <div class="tip-item">
          💡 <strong>Tip:</strong> {tips[animationId % tips.length]}
        </div>
        
        <div class="quick-actions">
          <button class="quick-btn" onclick={addRandomWidget}>
            🎲 Add Random Widget
          </button>
          <button class="quick-btn" onclick={openWidgetLibrary}>
            🧩 Widget Library
          </button>
          <button class="quick-btn" onclick={resetDashboard}>
            🔄 Reset Layout
          </button>
        </div>
        
        <div class="hints-footer">
          <button class="shortcut-toggle" onclick={toggleShortcuts}>
            ⌨️ Keyboard Shortcuts
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Keyboard Shortcuts Panel -->
  {#if showShortcuts}
    <div class="shortcuts-panel">
      <div class="shortcuts-header">
        <h3>⌨️ Keyboard Shortcuts</h3>
        <button onclick={() => showShortcuts = false} class="close-btn">×</button>
      </div>
      
      <div class="shortcuts-content">
        <div class="shortcuts-grid">
          {#each shortcuts as shortcut}
            <div class="shortcut-item">
              <kbd class="shortcut-key">{shortcut.key}</kbd>
              <span class="shortcut-action">{shortcut.action}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Widget Drop Zones -->
  <div class="drop-zones">
    <div class="drop-zone corner top-left" title="Drop widgets here">
      <div class="drop-zone-content">
        <div class="drop-icon">📊</div>
        <div class="drop-text">Drop Zone</div>
      </div>
    </div>
    
    <div class="drop-zone corner top-right" title="Drop widgets here">
      <div class="drop-zone-content">
        <div class="drop-icon">📈</div>
        <div class="drop-text">Drop Zone</div>
      </div>
    </div>
    
    <div class="drop-zone corner bottom-left" title="Drop widgets here">
      <div class="drop-zone-content">
        <div class="drop-icon">📝</div>
        <div class="drop-text">Drop Zone</div>
      </div>
    </div>
    
    <div class="drop-zone corner bottom-right" title="Drop widgets here">
      <div class="drop-zone-content">
        <div class="drop-icon">🔢</div>
        <div class="drop-text">Drop Zone</div>
      </div>
    </div>
  </div>

  <!-- Selection Helper -->
  {#if dashboardStore.selectedWidgetId}
    <div class="selection-helper">
      <div class="helper-content">
        <span class="helper-icon">🎯</span>
        <span class="helper-text">Widget Selected</span>
        <div class="helper-actions">
          <button class="helper-btn" onclick={() => dashboardStore.duplicateWidget(dashboardStore.selectedWidgetId!)}>
            📋 Duplicate
          </button>
          <button class="helper-btn danger" onclick={() => dashboardStore.removeWidget(dashboardStore.selectedWidgetId!)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Empty State Message -->
  {#if dashboardStore.stats.totalWidgets === 0}
    <div class="empty-state">
      <div class="empty-icon">🎨</div>
      <h2 class="empty-title">Your Canvas Awaits</h2>
      <p class="empty-description">
        Start building your dashboard by adding widgets from the toolbar or double-clicking anywhere on the grid.
      </p>
      <div class="empty-actions">
        <button class="empty-btn primary" onclick={addRandomWidget}>
          ✨ Add First Widget
        </button>
        <button class="empty-btn" onclick={openWidgetLibrary}>
          🧩 Browse Library
        </button>
      </div>
    </div>
  {/if}

  <!-- Performance Overlay -->
  {#if dashboardStore.stats.totalWidgets > 20}
    <div class="performance-warning">
      <div class="warning-content">
        <span class="warning-icon">⚡</span>
        <span class="warning-text">
          High widget count ({dashboardStore.stats.totalWidgets}) may impact performance
        </span>
        <button class="warning-btn" onclick={() => {}}>
          Optimize
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .edit-mode-overlay {
    @apply absolute inset-0 pointer-events-none z-40;
    transition: opacity 0.3s ease;
  }

  .edit-mode-overlay.hidden {
    @apply opacity-0;
  }

  .grid-guidelines {
    @apply absolute inset-0;
  }

  .guideline-overlay {
    @apply w-full h-full;
    background-image: 
      linear-gradient(to right, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .hints-panel {
    @apply absolute top-4 left-4 bg-black/80 backdrop-blur-sm;
    @apply border border-cyan-400/30 rounded-lg p-4 pointer-events-auto;
    @apply max-w-sm;
  }

  .hints-header {
    @apply flex justify-between items-center mb-3;
  }

  .hints-header h3 {
    @apply text-lg font-bold text-cyan-400;
  }

  .dismiss-btn,
  .close-btn {
    @apply text-gray-400 hover:text-white text-xl cursor-pointer;
  }

  .hints-content {
    @apply space-y-3;
  }

  .tip-item {
    @apply text-sm text-gray-300 p-2 bg-gray-800/50 rounded;
    animation: tip-pulse 3s ease-in-out infinite;
  }

  .quick-actions {
    @apply flex flex-wrap gap-2;
  }

  .quick-btn {
    @apply px-2 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded text-xs;
    @apply text-cyan-400 hover:bg-cyan-500/30 transition-colors pointer-events-auto;
  }

  .hints-footer {
    @apply pt-2 border-t border-gray-700;
  }

  .shortcut-toggle {
    @apply text-xs text-gray-400 hover:text-cyan-400 transition-colors pointer-events-auto;
  }

  .shortcuts-panel {
    @apply absolute top-4 right-4 bg-black/90 backdrop-blur-sm;
    @apply border border-cyan-400/30 rounded-lg p-4 pointer-events-auto;
    @apply max-w-md max-h-96 overflow-y-auto;
  }

  .shortcuts-header {
    @apply flex justify-between items-center mb-3;
  }

  .shortcuts-header h3 {
    @apply text-lg font-bold text-cyan-400;
  }

  .shortcuts-grid {
    @apply space-y-2;
  }

  .shortcut-item {
    @apply flex items-center gap-3 text-sm;
  }

  .shortcut-key {
    @apply bg-gray-800 border border-gray-600 rounded px-2 py-1;
    @apply text-cyan-400 font-mono text-xs min-w-[120px];
  }

  .shortcut-action {
    @apply text-gray-300;
  }

  .drop-zones {
    @apply absolute inset-0;
  }

  .drop-zone {
    @apply absolute w-32 h-32 border-2 border-dashed border-cyan-400/30;
    @apply bg-cyan-950/20 rounded-lg flex items-center justify-center;
    @apply opacity-0 hover:opacity-100 transition-opacity;
  }

  .drop-zone.top-left {
    @apply top-4 left-4;
  }

  .drop-zone.top-right {
    @apply top-4 right-4;
  }

  .drop-zone.bottom-left {
    @apply bottom-4 left-4;
  }

  .drop-zone.bottom-right {
    @apply bottom-4 right-4;
  }

  .drop-zone-content {
    @apply text-center text-cyan-400;
  }

  .drop-icon {
    @apply text-2xl mb-1;
  }

  .drop-text {
    @apply text-xs font-medium;
  }

  .selection-helper {
    @apply absolute bottom-4 left-1/2 transform -translate-x-1/2;
    @apply bg-black/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3;
    @apply pointer-events-auto;
  }

  .helper-content {
    @apply flex items-center gap-3;
  }

  .helper-icon {
    @apply text-lg;
  }

  .helper-text {
    @apply text-sm font-medium text-cyan-400;
  }

  .helper-actions {
    @apply flex gap-2;
  }

  .helper-btn {
    @apply px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs;
    @apply hover:bg-gray-700 transition-colors;
  }

  .helper-btn.danger {
    @apply border-red-400/50 text-red-400 hover:bg-red-500/20;
  }

  .empty-state {
    @apply absolute inset-0 flex flex-col items-center justify-center;
    @apply text-center pointer-events-auto;
  }

  .empty-icon {
    @apply text-6xl mb-4 opacity-50;
  }

  .empty-title {
    @apply text-2xl font-bold text-cyan-400 mb-2;
  }

  .empty-description {
    @apply text-gray-400 mb-6 max-w-md;
  }

  .empty-actions {
    @apply flex gap-3;
  }

  .empty-btn {
    @apply px-4 py-2 border border-gray-600 rounded-lg;
    @apply hover:bg-gray-800 transition-colors;
  }

  .empty-btn.primary {
    @apply bg-cyan-500/20 border-cyan-400 text-cyan-400;
    @apply hover:bg-cyan-500/30;
  }

  .performance-warning {
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
    @apply bg-yellow-900/80 border border-yellow-400/50 rounded-lg p-3;
    @apply pointer-events-auto;
  }

  .warning-content {
    @apply flex items-center gap-3;
  }

  .warning-icon {
    @apply text-yellow-400 text-lg;
  }

  .warning-text {
    font-size: 0.875rem;
    color: #fde047;
  }

  .warning-btn {
    padding: 0.125rem 0.5rem;
    background-color: rgba(234, 179, 8, 0.2);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 0.25rem;
    font-size: 0.75rem;
    color: #fde047;
    transition: background-color 0.2s ease;
  }

  .warning-btn:hover {
    background-color: rgba(234, 179, 8, 0.3);
  }

  @keyframes tip-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .hints-panel,
      .shortcuts-panel {
    max-width: 20rem;
  }

  .drop-zone {
    width: 5rem;
    height: 5rem;
  }

  .drop-icon {
    font-size: 1.125rem;
  }

  .drop-text {
    font-size: 0.75rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .empty-actions {
    flex-direction: column;
  }
  }
</style>