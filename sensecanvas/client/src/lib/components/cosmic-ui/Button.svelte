<script lang="ts">
  import { buttonShapes } from './shapes';
  
  interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
    shape?: keyof typeof buttonShapes;
    size?: 'sm' | 'md' | 'lg';
    glowing?: boolean;
    loading?: boolean;
    disabled?: boolean;
    class?: string;
    children?: any;
    onclick?: (event: MouseEvent) => void;
    [key: string]: any;
  }
  
  let {
    variant = 'primary',
    shape = 'default',
    size = 'md',
    glowing = false,
    loading = false,
    disabled = false,
    class: className = '',
    children,
    onclick,
    ...props
  }: ButtonProps = $props();
  
  const buttonShape = $derived(buttonShapes[shape] || buttonShapes.default);
  const isDisabled = $derived(disabled || loading);
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-cyber-blue text-dark-bg hover:bg-cyber-green',
    secondary: 'bg-dark-accent text-cyber-blue hover:bg-dark-surface',
    success: 'bg-cyber-green text-dark-bg hover:bg-cyber-blue',
    danger: 'bg-neon-red text-white hover:bg-cyber-pink',
    warning: 'bg-cyber-orange text-dark-bg hover:bg-cyber-pink'
  };
</script>

<button
  class="cosmic-button {variantClasses[variant]} {sizeClasses[size]} {className}"
  class:glowing
  class:loading
  disabled={isDisabled}
  {onclick}
  {...props}
>
  <!-- Background shape -->
  <svg class="button-bg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path d={buttonShape.path} fill="currentColor" />
    {#if buttonShape.hover}
      <path class="hover-path" d={buttonShape.hover} fill="currentColor" />
    {/if}
  </svg>
  
  <!-- Content -->
  <span class="button-content">
    {#if loading}
      <span class="loading-spinner"></span>
    {/if}
    {@render children?.()}
  </span>
  
  <!-- Glow effect -->
  {#if glowing}
    <span class="glow-effect"></span>
  {/if}
</button>

<style>
  .cosmic-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
    cursor: pointer;
    overflow: hidden;
    border: none;
    min-width: 120px;
  }
  
  .cosmic-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .button-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  
  .hover-path {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .cosmic-button:hover:not(:disabled) .hover-path {
    opacity: 1;
  }
  
  .button-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  /* Loading spinner */
  .loading-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Glow effect */
  .glow-effect {
    position: absolute;
    inset: -2px;
    background: currentColor;
    filter: blur(8px);
    opacity: 0.3;
    z-index: -1;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  /* Hover effects */
  .cosmic-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  }
  
  .cosmic-button:active:not(:disabled) {
    transform: translateY(0);
  }
</style> 