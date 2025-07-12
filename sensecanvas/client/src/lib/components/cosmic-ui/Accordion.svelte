<script lang="ts">
  import Frame from './Frame.svelte';
  import type { Paths } from './frame.js';
  
  interface AccordionProps {
    items: Array<{
      title: string;
      content: string;
    }>;
    defaultValue?: string[];
    className?: string;
  }
  
  let {
    items = [],
    defaultValue = [],
    className = ''
  }: AccordionProps = $props();
  
  let openItems = $state(new Set(defaultValue));
  
  function toggleItem(title: string) {
    if (openItems.has(title)) {
      openItems.delete(title);
    } else {
      openItems.add(title);
    }
    openItems = new Set(openItems); // Trigger reactivity
  }
  
  // Frame paths for accordion items
  const accordionFramePaths: Paths = [
    {
      "show": true,
      "style": {
        "strokeWidth": "1",
        "stroke": "var(--color-primary)",
        "fill": "var(--color-primary)/20"
      },
      "path": [
        ["M", "15", "0"],
        ["L", "100% - 0", "0"],
        ["L", "100% - 0", "100% - 7"],
        ["L", "0% + 0", "100% - 7"],
        ["L", "0% + 0", "0% + 15"],
        ["L", "15", "0"]
      ]
    },
    {
      "show": true,
      "style": {
        "strokeWidth": "1",
        "stroke": "var(--color-primary)",
        "fill": "transparent"
      },
      "path": [
        ["M", "7", "100% - 7"],
        ["L", "100% - 8", "100% - 7"],
        ["L", "100% - 14", "100% + 0"],
        ["L", "12", "100% + 0"],
        ["L", "7", "100% - 7"]
      ]
    }
  ];
</script>

<div class="flex flex-col gap-3 {className}">
  {#each items as item (item.title)}
    <div 
      class="relative px-6 pt-3 pb-5"
      class:open={openItems.has(item.title)}
    >
      <Frame paths={accordionFramePaths} />
      
      <div class="relative">
        <!-- Trigger -->
        <h3>
          <button
            class="flex items-center font-bold cursor-pointer w-full group py-2 -my-2 transition-[padding] duration-100"
            onclick={() => toggleItem(item.title)}
          >
            <svg class="size-4.5 me-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            {item.title}
            <svg 
              class="ms-auto size-4 transition-transform"
              class:rotate-180={openItems.has(item.title)}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </h3>
        
        <!-- Content -->
        {#if openItems.has(item.title)}
          <div class="py-2 mt-1 opacity-80 animate-in fade-in-0 zoom-in-95 duration-300">
            {item.content}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .open {
    filter: drop-shadow(0 0px 20px var(--color-primary));
  }
  
  button {
    color: var(--color-primary);
    text-shadow: 0 0 10px var(--color-primary);
  }
  
  .rotate-180 {
    transform: rotate(180deg);
  }
</style> 