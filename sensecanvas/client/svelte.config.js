import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    
    // SenseCanvas configuration
    alias: {
      $lib: 'src/lib',
      $types: 'src/lib/types',
      $components: 'src/lib/components',
      $stores: 'src/lib/stores',
      $utils: 'src/lib/utils'
    },
    

    

  },
  
  // Svelte 5 compiler options
  compilerOptions: {
    // Enable runes mode for Svelte 5
    runes: true,
    
    // Development settings
    dev: process.env.NODE_ENV === 'development',
    
    // CSS configuration
    css: 'injected'
  }
};

export default config;