import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // SenseCanvas sci-fi color palette
        'cyber-blue': '#00ffff',
        'cyber-green': '#00ff88',
        'cyber-purple': '#9d4edd',
        'cyber-pink': '#ff006e',
        'cyber-orange': '#ff6b35',
        'neon-red': '#ff073a',
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1a1a1a',
        'dark-accent': '#2a2a2a'
      },
      fontFamily: {
        'cyber': ['Orbitron', 'monospace'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite alternate'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)'
          }
        },
        'slide-up': {
          'from': {
            transform: 'translateY(100%)',
            opacity: '0'
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'slide-down': {
          'from': {
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'fade-in': {
          'from': {
            opacity: '0'
          },
          'to': {
            opacity: '1'
          }
        },
        'neon-pulse': {
          'from': {
            'text-shadow': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
          },
          'to': {
            'text-shadow': '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
          }
        }
      },
      backdropBlur: {
        'xs': '2px'
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 255, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
        'cyber': '0 4px 20px rgba(0, 255, 255, 0.3)'
      }
    }
  },
  plugins: []
} satisfies Config;