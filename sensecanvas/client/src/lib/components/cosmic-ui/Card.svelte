<script lang="ts">
  import Frame from './Frame.svelte';
  import type { ComponentProps } from 'svelte';
  
  interface CardProps extends ComponentProps<'div'> {
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'sharp' | 'hexagon' | 'octagon' | 'cyberpunk';
    glowOnHover?: boolean;
    elevated?: boolean;
  }
  
  let {
    title,
    subtitle,
    variant = 'default',
    glowOnHover = false,
    elevated = false,
    class: className = '',
    children,
    ...props
  }: CardProps = $props();
</script>

<Frame
  {variant}
  class="cosmic-card {className}"
  class:glow-hover={glowOnHover}
  class:elevated
  animated={glowOnHover}
  {...props}
>
  {#if title || subtitle}
    <header class="card-header">
      {#if title}
        <h3 class="card-title">{title}</h3>
      {/if}
      {#if subtitle}
        <p class="card-subtitle">{subtitle}</p>
      {/if}
    </header>
  {/if}
  
  <div class="card-content">
    {@render children?.()}
  </div>
</Frame>

<style>
  .cosmic-card {
    width: 100%;
    transition: all 0.3s ease;
  }
  
  .cosmic-card.glow-hover:hover {
    transform: translateY(-2px);
  }
  
  .cosmic-card.elevated {
    box-shadow: 
      0 4px 6px -1px rgba(0, 255, 255, 0.1),
      0 2px 4px -1px rgba(0, 255, 255, 0.06);
  }
  
  .card-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-dark-accent);
  }
  
  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-cyber-blue);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .card-subtitle {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0.25rem 0 0;
  }
  
  .card-content {
    color: var(--color-text-primary);
  }
</style> 