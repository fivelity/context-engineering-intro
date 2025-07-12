<script lang="ts">
  import { onMount } from 'svelte';
  import { setupSvgRenderer, type Paths } from './frame.js';
  
  interface FrameProps {
    paths?: Paths;
    className?: string;
    enableBackdropBlur?: boolean;
    enableViewBox?: boolean;
    children?: any;
  }
  
  let {
    paths = [],
    className = '',
    enableBackdropBlur = false,
    enableViewBox = false,
    children,
    ...props
  }: FrameProps = $props();
  
  let svgElement: SVGSVGElement;
  let renderer: { destroy: () => void } | null = null;
  
  onMount(() => {
    if (svgElement && paths.length > 0) {
      renderer = setupSvgRenderer({
        el: svgElement,
        paths,
        enableBackdropBlur,
        enableViewBox
      });
    }
    
    return () => {
      renderer?.destroy();
    };
  });
</script>

<div class="cosmic-frame {className}" {...props}>
  <!-- SVG Frame -->
  <svg 
    bind:this={svgElement}
    class="cosmic-frame-svg absolute inset-0 w-full h-full pointer-events-none"
  ></svg>
  
  <!-- Content -->
  <div class="relative z-10 p-4">
    {@render children?.()}
  </div>
</div>

<style>
  .cosmic-frame {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
  }
</style> 