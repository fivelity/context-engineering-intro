<!--
  CosmicFrame.svelte
  
  Svelte adaptation of Cosmic UI Frame component
  Demonstrates:
  - SVG-first design approach from Cosmic UI
  - Customizable SVG paths for sci-fi aesthetic
  - Frame component for sensor widget containers
  - Cosmic UI color system integration
  - Dynamic path rendering with reactive updates
-->

<script lang="ts">
  import { onMount } from 'svelte';
  
  interface PathData {
    show: boolean;
    style: {
      strokeWidth: string;
      stroke: string;
      fill: string;
    };
    path: string[][];
  }

  // Props
  let { 
    paths = [] as PathData[],
    className = "",
    ...restProps 
  }: {
    paths?: PathData[];
    className?: string;
    [key: string]: any;
  } = $props();

  let svgElement: SVGSVGElement;

  // Convert Cosmic UI path format to SVG path string
  function pathToString(pathArray: string[][]): string {
    return pathArray.map(segment => segment.join(' ')).join(' ');
  }

  // Process percentage-based coordinates for responsive frames
  function processPath(pathString: string, width: number, height: number): string {
    return pathString
      .replace(/(\d+)%/g, (match, percent) => {
        const num = parseFloat(percent);
        return `${(num / 100) * width}`;
      })
      .replace(/100% - (\d+)/g, (match, offset) => {
        return `${width - parseFloat(offset)}`;
      })
      .replace(/50% \+ (\d+)/g, (match, offset) => {
        return `${width / 2 + parseFloat(offset)}`;
      })
      .replace(/50% - (\d+)/g, (match, offset) => {
        return `${width / 2 - parseFloat(offset)}`;
      });
  }

  // Reactive frame dimensions
  let frameWidth = $state(300);
  let frameHeight = $state(200);

  // Update dimensions when component mounts or resizes
  onMount(() => {
    if (svgElement && svgElement.parentElement) {
      const updateDimensions = () => {
        const rect = svgElement.parentElement!.getBoundingClientRect();
        frameWidth = rect.width || 300;
        frameHeight = rect.height || 200;
      };

      updateDimensions();
      
      // Watch for resize
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(svgElement.parentElement);
      
      return () => resizeObserver.disconnect();
    }
  });

  // Process paths reactively
  const processedPaths = $derived(
    paths.map(pathData => ({
      ...pathData,
      processedPath: processPath(
        pathToString(pathData.path), 
        frameWidth, 
        frameHeight
      )
    }))
  );
</script>

<!-- Cosmic UI Frame SVG -->
<svg
  bind:this={svgElement}
  class="absolute inset-0 size-full {className}"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {frameWidth} {frameHeight}"
  {...restProps}
>
  {#each processedPaths as pathData}
    {#if pathData.show}
      <path
        d={pathData.processedPath}
        stroke-width={pathData.style.strokeWidth}
        stroke={pathData.style.stroke}
        fill={pathData.style.fill}
        class="transition-all duration-300"
      />
    {/if}
  {/each}
</svg>

<style>
  /* Cosmic UI CSS Variables for SenseCanvas */
  :global(:root) {
    --color-primary: rgb(20, 160, 230);
    --color-primary-foreground: rgb(255, 255, 255);
    --color-accent: rgb(202, 65, 34);
    --color-accent-foreground: rgb(255, 255, 255);
    --color-secondary: color-mix(in oklab, var(--color-primary), white 50%);
    --color-success: rgb(20, 184, 166);
    --color-background: color-mix(in oklab, var(--color-primary), black 80%);
    --color-foreground: white;
    
    /* Frame-specific colors */
    --color-frame-1-stroke: var(--color-primary);
    --color-frame-1-fill: transparent;
    --color-frame-2-stroke: var(--color-accent);
    --color-frame-2-fill: rgba(202, 65, 34, 0.1);
    --color-frame-3-stroke: var(--color-success);
    --color-frame-3-fill: transparent;
    --color-frame-4-stroke: var(--color-primary);
    --color-frame-4-fill: rgba(20, 160, 230, 0.05);
    --color-frame-5-stroke: rgba(255, 255, 255, 0.3);
    --color-frame-5-fill: rgba(255, 255, 255, 0.02);
  }
</style> 