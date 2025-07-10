/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk theme
        cyberpunk: {
          primary: '#7c3aed',
          secondary: '#fbbf24',
          accent: '#ec4899',
          background: '#0f0f23',
          surface: '#1e1b4b',
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
          border: '#475569',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
        // Neon theme
        neon: {
          primary: '#00ffff',
          secondary: '#ff8c00',
          accent: '#ff1493',
          background: '#000000',
          surface: '#111111',
          text: '#ffffff',
          'text-muted': '#cccccc',
          border: '#333333',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0000',
        },
        // Gaming theme
        gaming: {
          primary: '#00ff88',
          secondary: '#0ea5e9',
          accent: '#a855f7',
          background: '#0a0e1a',
          surface: '#1a202c',
          text: '#f7fafc',
          'text-muted': '#a0aec0',
          border: '#4a5568',
          success: '#38a169',
          warning: '#ed8936',
          error: '#e53e3e',
        },
        // Corporate theme
        corporate: {
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#06b6d4',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          'text-muted': '#94a3b8',
          border: '#475569',
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
        },
        // Matrix theme
        matrix: {
          primary: '#00ff00',
          secondary: '#000000',
          accent: '#008000',
          background: '#000000',
          surface: '#001100',
          text: '#00ff00',
          'text-muted': '#008000',
          border: '#004400',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0000',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        orbitron: ['Orbitron', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 5px currentColor',
        'glow': '0 0 10px currentColor',
        'glow-lg': '0 0 20px currentColor',
        'glow-xl': '0 0 30px currentColor',
        'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 20px currentColor',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 2s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1',
            filter: 'drop-shadow(0 0 5px currentColor)'
          },
          '50%': { 
            opacity: '0.7',
            filter: 'drop-shadow(0 0 20px currentColor)'
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glitch': {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        'sci-fi': '0 10px 0 10px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-glow': {
          'text-shadow': '0 0 10px currentColor',
        },
        '.text-glow-lg': {
          'text-shadow': '0 0 20px currentColor, 0 0 30px currentColor',
        },
        '.border-glow': {
          'box-shadow': '0 0 10px currentColor',
        },
        '.sci-fi-border': {
          'clip-path': 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        },
        '.scanlines': {
          'position': 'relative',
          '&::before': {
            'content': '""',
            'position': 'absolute',
            'inset': '0',
            'background': 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
            'pointer-events': 'none',
          },
        },
      }
      addUtilities(newUtilities)
    }
  ],
}