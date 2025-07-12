import tailwindcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcss({
      config: './tailwind.config.js',
      // Enable the new Tailwind CSS 4 features
      experimental: {
        optimizeUniversalDefaults: true
      }
    }),
    // Add autoprefixer for better browser compatibility
    require('autoprefixer')
  ],
}; 