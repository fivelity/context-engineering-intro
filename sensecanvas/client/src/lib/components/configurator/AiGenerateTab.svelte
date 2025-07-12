<!--
SenseCanvas AI Widget Generation Tab Component
AI-powered widget generation using natural language prompts and Google Genkit integration.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WidgetConfig } from '../../types/widgets.js';
  
  interface Props {
    onGenerated: (widget: Partial<WidgetConfig>) => void;
  }

  let { onGenerated }: Props = $props();

  const dispatch = createEventDispatcher();

  // ✅ Using Svelte 5 runes for AI generation state
  let prompt = $state('');
  let isGenerating = $state(false);
  let error = $state<string | null>(null);
  let rateLimitMessage = $state<string | null>(null);
  let generationHistory = $state<Array<{ prompt: string; result: any; timestamp: number }>>([]);

  // AI generation presets and examples
  const promptExamples = [
    {
      category: 'CPU Monitoring',
      examples: [
        'Create a red CPU temperature gauge with warning alerts',
        'Make a minimalist CPU usage graph showing the last 5 minutes',
        'Design a cyberpunk-themed CPU frequency display'
      ]
    },
    {
      category: 'GPU Monitoring', 
      examples: [
        'Create a gaming-themed GPU usage gauge with RGB colors',
        'Make a VRAM usage text display for streaming setup',
        'Design a multi-sensor widget showing GPU temp and usage'
      ]
    },
    {
      category: 'System Overview',
      examples: [
        'Create a comprehensive system overview with CPU, GPU, and memory',
        'Make a temperature dashboard for all components',
        'Design a performance monitoring widget for gaming'
      ]
    }
  ];

  // ✅ Derived validation state
  let canGenerate = $derived(() => {
    return prompt.trim().length >= 10 && !isGenerating && !rateLimitMessage;
  });

  let promptSuggestions = $derived(() => {
    if (prompt.length < 3) return [];
    
    const searchTerm = prompt.toLowerCase();
    const suggestions = [];
    
    for (const category of promptExamples) {
      for (const example of category.examples) {
        if (example.toLowerCase().includes(searchTerm)) {
          suggestions.push({ text: example, category: category.category });
        }
      }
    }
    
    return suggestions.slice(0, 5);
  });

  // Generate widget using AI
  async function generateWidget() {
    if (!canGenerate()) return;

    isGenerating = true;
    error = null;
    
    try {
      const response = await fetch('/api/ai/generate-widget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          context: {
            timestamp: Date.now(),
            user_preferences: {
              theme: 'cyberpunk',
              complexity: 'moderate'
            }
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          rateLimitMessage = data.message || 'Rate limit exceeded. Please wait before generating again.';
          setTimeout(() => { rateLimitMessage = null; }, 10000);
          return;
        }
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Add to history
      generationHistory.unshift({
        prompt: prompt,
        result: result.widget,
        timestamp: Date.now()
      });
      
      // Limit history to 10 items
      if (generationHistory.length > 10) {
        generationHistory = generationHistory.slice(0, 10);
      }

      onGenerated(result.widget);
      
      // Clear prompt on successful generation
      prompt = '';
      
    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed';
      console.error('AI Generation Error:', err);
    } finally {
      isGenerating = false;
    }
  }

  // Use a previous generation
  function useGeneration(widget: any) {
    onGenerated(widget);
  }

  // Clear generation history
  function clearHistory() {
    if (confirm('Clear all generation history?')) {
      generationHistory = [];
    }
  }

  // Handle keyboard shortcuts
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey && canGenerate()) {
      event.preventDefault();
      generateWidget();
    }
  }

  // Use example prompt
  function useExample(example: string) {
    prompt = example;
  }

  // Format timestamp for display
  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
</script>

<div class="ai-generate-tab">
  <!-- Main Generation Interface -->
  <div class="generation-interface">
    <div class="interface-header">
      <h3 class="tab-title">🤖 AI Widget Generator</h3>
      <p class="tab-description">
        Describe your ideal widget in natural language and let AI create it for you.
      </p>
    </div>

    <!-- Prompt Input -->
    <div class="prompt-section">
      <div class="prompt-input-wrapper">
        <textarea
          bind:value={prompt}
          placeholder="Describe your widget... (e.g., 'Create a red CPU temperature gauge with warning alerts at 75°C')"
          class="prompt-input"
          rows="3"
          onkeydown={handleKeyDown}
          disabled={isGenerating}
        ></textarea>
        
        <div class="input-footer">
          <div class="character-count">
            <span class="count">{prompt.length}</span>
            <span class="min-threshold" class:met={prompt.length >= 10}>/ 10 min</span>
          </div>
          
          <button 
            class="generate-btn"
            onclick={generateWidget}
            disabled={!canGenerate()}
          >
            {#if isGenerating}
              <span class="loading-spinner"></span>
              Generating...
            {:else}
              ✨ Generate Widget
            {/if}
          </button>
        </div>
      </div>

      <!-- Prompt Suggestions -->
      {#if promptSuggestions.length > 0}
        <div class="suggestions">
          <h4 class="suggestions-title">Suggestions:</h4>
          <div class="suggestion-list">
            {#each promptSuggestions as suggestion}
              <button 
                class="suggestion-item"
                onclick={() => useExample(suggestion.text)}
              >
                <span class="suggestion-category">{suggestion.category}</span>
                <span class="suggestion-text">{suggestion.text}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Status Messages -->
    {#if error}
      <div class="status-message error">
        <span class="status-icon">❌</span>
        <span class="status-text">{error}</span>
        <button class="dismiss-btn" onclick={() => error = null}>×</button>
      </div>
    {/if}

    {#if rateLimitMessage}
      <div class="status-message warning">
        <span class="status-icon">⏳</span>
        <span class="status-text">{rateLimitMessage}</span>
      </div>
    {/if}

    <!-- Example Prompts -->
    <div class="examples-section">
      <h4 class="section-title">💡 Example Prompts</h4>
      <div class="examples-grid">
        {#each promptExamples as category}
          <div class="example-category">
            <h5 class="category-title">{category.category}</h5>
            <div class="category-examples">
              {#each category.examples as example}
                <button 
                  class="example-btn"
                  onclick={() => useExample(example)}
                  title="Click to use this example"
                >
                  "{example}"
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Generation History -->
  {#if generationHistory.length > 0}
    <div class="history-section">
      <div class="history-header">
        <h4 class="section-title">📜 Recent Generations</h4>
        <button class="clear-history-btn" onclick={clearHistory}>
          🗑️ Clear History
        </button>
      </div>
      
      <div class="history-list">
        {#each generationHistory as generation}
          <div class="history-item">
            <div class="history-meta">
              <span class="history-time">{formatTime(generation.timestamp)}</span>
              <span class="history-type">{generation.result.type || 'widget'}</span>
            </div>
            
            <div class="history-prompt">
              "{generation.prompt}"
            </div>
            
            <div class="history-result">
              <div class="result-preview">
                <span class="result-title">{generation.result.title || 'Generated Widget'}</span>
                <span class="result-sensor">{generation.result.sensorType || 'cpu'}</span>
              </div>
              
              <button 
                class="use-btn"
                onclick={() => useGeneration(generation.result)}
                title="Use this generated widget"
              >
                Use Widget
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- AI Tips -->
  <div class="tips-section">
    <h4 class="section-title">💭 Generation Tips</h4>
    <ul class="tips-list">
      <li>Be specific about colors, themes, and sensor types</li>
      <li>Mention alert thresholds if you want monitoring alerts</li>
      <li>Specify size preferences (small, medium, large, custom)</li>
      <li>Include style preferences (minimal, gaming, cyberpunk, etc.)</li>
      <li>Mention specific use cases (streaming setup, gaming rig, etc.)</li>
    </ul>
  </div>
</div>

<style>
  .ai-generate-tab {
    @apply h-full overflow-y-auto p-4 space-y-6;
  }

  .generation-interface {
    @apply space-y-4;
  }

  .interface-header {
    @apply text-center space-y-2;
  }

  .tab-title {
    @apply text-xl font-bold text-cyan-400;
  }

  .tab-description {
    @apply text-sm text-gray-400;
  }

  .prompt-section {
    @apply space-y-3;
  }

  .prompt-input-wrapper {
    @apply relative;
  }

  .prompt-input {
    @apply w-full p-3 bg-gray-800 border border-gray-600 rounded-lg;
    @apply text-white placeholder-gray-400 resize-none;
    @apply focus:border-cyan-400 focus:outline-none;
    transition: border-color 0.2s ease;
  }

  .prompt-input:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .input-footer {
    @apply flex justify-between items-center mt-2;
  }

  .character-count {
    @apply text-xs text-gray-400;
  }

  .count {
    @apply text-gray-300;
  }

  .min-threshold {
    @apply text-gray-500;
  }

  .min-threshold.met {
    @apply text-green-400;
  }

  .generate-btn {
    @apply px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg;
    @apply text-cyan-400 hover:bg-cyan-500/30 transition-colors;
    @apply flex items-center gap-2;
  }

  .generate-btn:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .loading-spinner {
    @apply w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin;
  }

  .suggestions {
    @apply bg-gray-800/50 border border-gray-600 rounded-lg p-3;
  }

  .suggestions-title {
    @apply text-sm font-bold text-gray-300 mb-2;
  }

  .suggestion-list {
    @apply space-y-1;
  }

  .suggestion-item {
    @apply w-full text-left p-2 hover:bg-gray-700/50 rounded;
    @apply transition-colors;
  }

  .suggestion-category {
    @apply text-xs text-cyan-400 font-medium;
  }

  .suggestion-text {
    @apply block text-sm text-gray-300;
  }

  .status-message {
    @apply flex items-center gap-2 p-3 rounded-lg;
  }

  .status-message.error {
    @apply bg-red-900/30 border border-red-400/30 text-red-300;
  }

  .status-message.warning {
    @apply bg-yellow-900/30 border border-yellow-400/30 text-yellow-300;
  }

  .status-icon {
    @apply text-lg;
  }

  .status-text {
    @apply flex-1 text-sm;
  }

  .dismiss-btn {
    @apply text-xl hover:opacity-75;
  }

  .examples-section {
    @apply bg-gray-800/30 border border-gray-600 rounded-lg p-4;
  }

  .section-title {
    @apply text-lg font-bold text-gray-300 mb-3;
  }

  .examples-grid {
    @apply space-y-4;
  }

  .example-category {
    @apply space-y-2;
  }

  .category-title {
    @apply text-sm font-bold text-cyan-400;
  }

  .category-examples {
    @apply space-y-1;
  }

  .example-btn {
    @apply block w-full text-left p-2 text-sm text-gray-300;
    @apply hover:bg-gray-700/50 rounded transition-colors;
    @apply border-l-2 border-transparent hover:border-cyan-400;
  }

  .history-section {
    @apply bg-gray-800/20 border border-gray-600 rounded-lg p-4;
  }

  .history-header {
    @apply flex justify-between items-center mb-3;
  }

  .clear-history-btn {
    @apply px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded;
  }

  .history-list {
    @apply space-y-3 max-h-64 overflow-y-auto;
  }

  .history-item {
    @apply bg-gray-800/50 border border-gray-600 rounded-lg p-3;
  }

  .history-meta {
    @apply flex justify-between items-center text-xs text-gray-400 mb-1;
  }

  .history-prompt {
    @apply text-sm text-gray-300 italic mb-2;
  }

  .history-result {
    @apply flex justify-between items-center;
  }

  .result-preview {
    @apply flex flex-col;
  }

  .result-title {
    @apply text-sm font-medium text-cyan-400;
  }

  .result-sensor {
    @apply text-xs text-gray-400;
  }

  .use-btn {
    @apply px-2 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded text-xs;
    @apply text-cyan-400 hover:bg-cyan-500/30 transition-colors;
  }

  .tips-section {
    @apply bg-gray-800/20 border border-gray-600 rounded-lg p-4;
  }

  .tips-list {
    @apply space-y-1 text-sm text-gray-400;
  }

  .tips-list li {
    @apply flex items-start gap-2;
  }

  .tips-list li::before {
    @apply content-['•'] text-cyan-400 font-bold;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .ai-generate-tab {
      @apply p-2 space-y-4;
    }

    .examples-grid {
      @apply space-y-3;
    }

    .input-footer {
      @apply flex-col gap-2 items-stretch;
    }

    .character-count {
      @apply text-center;
    }
  }
</style>