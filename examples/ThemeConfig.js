// Theme configuration and switching implementation
// Demonstrates CSS custom property management and theme persistence

// Available themes for SenseCanvas
export const themes = {
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#0a0a0a',
      surface: '#1a1a1a',
      primary: '#00ff88',
      secondary: '#ff8c00',
      accent: '#00ffff',
      text: '#ffffff',
      textMuted: '#a0a0a0',
      border: '#333333',
      error: '#ff4444',
      warning: '#ffaa00',
      success: '#00ff88'
    }
  },
  
  light: {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#ffffff',
      surface: '#f8f9fa',
      primary: '#0066cc',
      secondary: '#6c757d',
      accent: '#17a2b8',
      text: '#212529',
      textMuted: '#6c757d',
      border: '#dee2e6',
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745'
    }
  },
  
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    colors: {
      background: '#000814',
      surface: '#001d3d',
      primary: '#00ff88',
      secondary: '#ff006e',
      accent: '#ffbe0b',
      text: '#ffffff',
      textMuted: '#8ecae6',
      border: '#219ebc',
      error: '#ff006e',
      warning: '#ffbe0b',
      success: '#00ff88'
    }
  },
  
  rgb: {
    id: 'rgb',
    name: 'RGB',
    colors: {
      background: '#0d1117',
      surface: '#161b22',
      primary: '#ff0066',
      secondary: '#00ff66',
      accent: '#6600ff',
      text: '#ffffff',
      textMuted: '#7d8590',
      border: '#30363d',
      error: '#ff4444',
      warning: '#ffaa00',
      success: '#00ff66'
    }
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    colors: {
      background: '#fafafa',
      surface: '#ffffff',
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#0ea5e9',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981'
    }
  }
};

// Current theme state
let currentTheme = 'dark';

// Theme management functions
export const themeManager = {
  // Get current theme
  getCurrentTheme() {
    return currentTheme;
  },
  
  // Get theme configuration
  getTheme(themeId) {
    return themes[themeId] || themes.dark;
  },
  
  // Get all available themes
  getAllThemes() {
    return Object.values(themes);
  },
  
  // Initialize theme from localStorage or system preference
  initTheme() {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('sensecanvas-theme');
      if (stored && themes[stored]) {
        currentTheme = stored;
      } else {
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark' : 'light';
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      currentTheme = 'dark';
    }
    
    this.applyTheme(currentTheme);
  },
  
  // Apply theme to document
  applyTheme(themeId) {
    const theme = this.getTheme(themeId);
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', themeId);
    
    // Update current theme
    currentTheme = themeId;
    
    // Persist to localStorage
    try {
      localStorage.setItem('sensecanvas-theme', themeId);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeId, colors: theme.colors }
    }));
  },
  
  // Switch to next theme in cycle
  cycleTheme() {
    const themeIds = Object.keys(themes);
    const currentIndex = themeIds.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeIds.length;
    const nextTheme = themeIds[nextIndex];
    
    this.applyTheme(nextTheme);
    return nextTheme;
  },
  
  // Toggle between light and dark theme
  toggleLightDark() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  },
  
  // Get color value for current theme
  getColor(colorKey) {
    const theme = this.getTheme(currentTheme);
    return theme.colors[colorKey];
  },
  
  // Check if current theme is dark
  isDark() {
    return ['dark', 'gaming', 'rgb'].includes(currentTheme);
  },
  
  // Generate CSS variables string for inline styles
  getCSSVariables() {
    const theme = this.getTheme(currentTheme);
    return Object.entries(theme.colors)
      .map(([key, value]) => `--color-${key}: ${value}`)
      .join('; ');
  },
  
  // Create theme-aware color palette for widgets
  getWidgetColors(type = 'default') {
    const theme = this.getTheme(currentTheme);
    
    switch (type) {
      case 'temperature':
        return {
          low: theme.colors.primary,
          medium: theme.colors.warning,
          high: theme.colors.error
        };
        
      case 'usage':
        return {
          low: theme.colors.success,
          medium: theme.colors.warning,
          high: theme.colors.error
        };
        
      case 'performance':
        return {
          excellent: theme.colors.success,
          good: theme.colors.primary,
          warning: theme.colors.warning,
          critical: theme.colors.error
        };
        
      default:
        return {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          accent: theme.colors.accent
        };
    }
  }
};

// CSS class utilities for theme-aware styling
export const themeClasses = {
  // Background classes
  bg: {
    primary: 'bg-[--color-background]',
    surface: 'bg-[--color-surface]',
    accent: 'bg-[--color-accent]'
  },
  
  // Text classes
  text: {
    primary: 'text-[--color-text]',
    muted: 'text-[--color-textMuted]',
    accent: 'text-[--color-accent]'
  },
  
  // Border classes
  border: {
    default: 'border-[--color-border]',
    accent: 'border-[--color-accent]'
  },
  
  // Generate dynamic classes based on current theme
  dynamic: {
    widget: () => {
      const isDark = themeManager.isDark();
      return {
        container: `${isDark ? 'bg-gray-900/50' : 'bg-white/50'} backdrop-blur-sm`,
        border: `border ${isDark ? 'border-gray-700' : 'border-gray-200'}`,
        text: isDark ? 'text-white' : 'text-gray-900'
      };
    },
    
    button: (variant = 'primary') => {
      const colors = themeManager.getWidgetColors();
      const isDark = themeManager.isDark();
      
      switch (variant) {
        case 'primary':
          return `bg-[--color-primary] text-white hover:opacity-80`;
        case 'secondary':
          return `bg-[--color-secondary] text-white hover:opacity-80`;
        case 'ghost':
          return `bg-transparent border border-[--color-border] text-[--color-text] hover:bg-[--color-surface]`;
        default:
          return `bg-[--color-surface] text-[--color-text] hover:bg-[--color-primary]/10`;
      }
    }
  }
};

// Auto-initialize theme when module loads (browser only)
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      themeManager.initTheme();
    });
  } else {
    themeManager.initTheme();
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a theme
    const storedTheme = localStorage.getItem('sensecanvas-theme');
    if (!storedTheme) {
      themeManager.applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

// Export current theme for reactive consumption
export { currentTheme }; 
