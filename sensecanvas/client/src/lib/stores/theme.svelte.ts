/**
 * SenseCanvas Theme Management Store
 * TailwindCSS 4+ custom properties with Svelte 5 runes for theme switching.
 */

import { browser } from '$app/environment';

// Theme definitions with TailwindCSS 4+ custom properties
export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  category: 'sci-fi' | 'gaming' | 'professional' | 'colorful';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };
  animations: {
    duration: string;
    ease: string;
    hover: string;
  };
  effects: {
    blur: string;
    brightness: string;
    contrast: string;
    saturate: string;
  };
}

// Theme configurations
const themes: Record<string, ThemeDefinition> = {
  default: {
    id: 'default',
    name: 'Cyber Default',
    description: 'Clean cyberpunk aesthetic with cyan accents',
    category: 'sci-fi',
    colors: {
      primary: '#22d3ee',      // cyan-400
      secondary: '#06b6d4',    // cyan-500
      accent: '#0891b2',       // cyan-600
      background: '#0f172a',   // slate-900
      surface: '#1e293b',      // slate-800
      text: '#f8fafc',         // slate-50
      textSecondary: '#94a3b8', // slate-400
      border: '#374151',       // gray-700
      success: '#10b981',      // emerald-500
      warning: '#f59e0b',      // amber-500
      error: '#ef4444',        // red-500
      info: '#3b82f6'          // blue-500
    },
    gradients: {
      primary: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
      secondary: 'linear-gradient(135deg, #1e293b, #374151)',
      accent: 'linear-gradient(90deg, #22d3ee, #a855f7)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(34, 211, 238, 0.05)',
      md: '0 4px 6px -1px rgba(34, 211, 238, 0.1)',
      lg: '0 10px 15px -3px rgba(34, 211, 238, 0.1)',
      glow: '0 0 20px rgba(34, 211, 238, 0.3)'
    },
    animations: {
      duration: '300ms',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'transform 150ms ease'
    },
    effects: {
      blur: 'blur(4px)',
      brightness: 'brightness(1.1)',
      contrast: 'contrast(1.1)',
      saturate: 'saturate(1.1)'
    }
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'High-contrast neon with purple and pink accents',
    category: 'sci-fi',
    colors: {
      primary: '#a855f7',      // purple-500
      secondary: '#ec4899',    // pink-500
      accent: '#06b6d4',       // cyan-500
      background: '#0c0a09',   // stone-950
      surface: '#1c1917',      // stone-900
      text: '#fafaf9',         // stone-50
      textSecondary: '#a8a29e', // stone-400
      border: '#44403c',       // stone-700
      success: '#22c55e',      // green-500
      warning: '#eab308',      // yellow-500
      error: '#ef4444',        // red-500
      info: '#8b5cf6'          // violet-500
    },
    gradients: {
      primary: 'linear-gradient(135deg, #a855f7, #ec4899)',
      secondary: 'linear-gradient(135deg, #1c1917, #44403c)',
      accent: 'linear-gradient(90deg, #a855f7, #06b6d4, #ec4899)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(168, 85, 247, 0.1)',
      md: '0 4px 6px -1px rgba(168, 85, 247, 0.2)',
      lg: '0 10px 15px -3px rgba(168, 85, 247, 0.2)',
      glow: '0 0 30px rgba(168, 85, 247, 0.5)'
    },
    animations: {
      duration: '400ms',
      ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      hover: 'transform 200ms ease'
    },
    effects: {
      blur: 'blur(6px)',
      brightness: 'brightness(1.2)',
      contrast: 'contrast(1.3)',
      saturate: 'saturate(1.5)'
    }
  },

  gaming: {
    id: 'gaming',
    name: 'RGB Gaming',
    description: 'Dynamic RGB colors for gaming setups',
    category: 'gaming',
    colors: {
      primary: '#22c55e',      // green-500
      secondary: '#eab308',    // yellow-500
      accent: '#dc2626',       // red-600
      background: '#111827',   // gray-900
      surface: '#1f2937',      // gray-800
      text: '#f9fafb',         // gray-50
      textSecondary: '#9ca3af', // gray-400
      border: '#4b5563',       // gray-600
      success: '#10b981',      // emerald-500
      warning: '#f59e0b',      // amber-500
      error: '#ef4444',        // red-500
      info: '#3b82f6'          // blue-500
    },
    gradients: {
      primary: 'linear-gradient(135deg, #22c55e, #eab308)',
      secondary: 'linear-gradient(135deg, #1f2937, #4b5563)',
      accent: 'linear-gradient(90deg, #22c55e, #eab308, #dc2626)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(34, 197, 94, 0.1)',
      md: '0 4px 6px -1px rgba(34, 197, 94, 0.2)',
      lg: '0 10px 15px -3px rgba(34, 197, 94, 0.2)',
      glow: '0 0 25px rgba(34, 197, 94, 0.4)'
    },
    animations: {
      duration: '250ms',
      ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      hover: 'transform 100ms ease-out'
    },
    effects: {
      blur: 'blur(3px)',
      brightness: 'brightness(1.15)',
      contrast: 'contrast(1.2)',
      saturate: 'saturate(1.3)'
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Clean Minimal',
    description: 'Subtle and professional design',
    category: 'professional',
    colors: {
      primary: '#6b7280',      // gray-500
      secondary: '#9ca3af',    // gray-400
      accent: '#374151',       // gray-700
      background: '#f9fafb',   // gray-50
      surface: '#ffffff',      // white
      text: '#111827',         // gray-900
      textSecondary: '#6b7280', // gray-500
      border: '#e5e7eb',       // gray-200
      success: '#059669',      // emerald-600
      warning: '#d97706',      // amber-600
      error: '#dc2626',        // red-600
      info: '#2563eb'          // blue-600
    },
    gradients: {
      primary: 'linear-gradient(135deg, #6b7280, #9ca3af)',
      secondary: 'linear-gradient(135deg, #ffffff, #f3f4f6)',
      accent: 'linear-gradient(90deg, #6b7280, #374151)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      glow: '0 0 15px rgba(107, 114, 128, 0.2)'
    },
    animations: {
      duration: '200ms',
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hover: 'transform 150ms ease'
    },
    effects: {
      blur: 'blur(2px)',
      brightness: 'brightness(1.05)',
      contrast: 'contrast(1.05)',
      saturate: 'saturate(0.9)'
    }
  },

  rgb: {
    id: 'rgb',
    name: 'Rainbow RGB',
    description: 'Full spectrum RGB with animated colors',
    category: 'colorful',
    colors: {
      primary: '#ff0080',      // hot pink
      secondary: '#00ff80',    // spring green  
      accent: '#8000ff',       // electric violet
      background: '#0a0a0a',   // near black
      surface: '#1a1a1a',      // dark gray
      text: '#ffffff',         // white
      textSecondary: '#cccccc', // light gray
      border: '#333333',       // medium gray
      success: '#00ff00',      // lime
      warning: '#ffff00',      // yellow
      error: '#ff0000',        // red
      info: '#00ffff'          // cyan
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff0080, #00ff80)',
      secondary: 'linear-gradient(135deg, #1a1a1a, #333333)',
      accent: 'linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #80ff00, #00ff00, #00ff80, #00ffff, #0080ff, #0000ff, #8000ff, #ff00ff, #ff0080)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(255, 0, 128, 0.1)',
      md: '0 4px 6px -1px rgba(255, 0, 128, 0.2)',
      lg: '0 10px 15px -3px rgba(255, 0, 128, 0.2)',
      glow: '0 0 40px rgba(255, 0, 128, 0.6)'
    },
    animations: {
      duration: '500ms',
      ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      hover: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)'
    },
    effects: {
      blur: 'blur(8px)',
      brightness: 'brightness(1.3)',
      contrast: 'contrast(1.4)',
      saturate: 'saturate(2)'
    }
  }
};

// Theme store using Svelte 5 runes
class ThemeStore {
  // ✅ Using Svelte 5 runes for reactive state
  private _currentTheme = $state<string>('default');
  private _autoSwitch = $state<boolean>(false);
  private _userPreferences = $state<Record<string, any>>({});

  constructor() {
    // Load theme from localStorage on client
    if (browser) {
      this.loadFromStorage();
      this.applyTheme(this._currentTheme);
    }
  }

  initialize() {
    // Theme is already initialized in constructor
    // This method is for compatibility with components
  }

  // ✅ Derived theme data
  get currentTheme(): ThemeDefinition {
    return themes[this._currentTheme] || themes.default;
  }

  get currentThemeId(): string {
    return this._currentTheme;
  }

  get availableThemes(): ThemeDefinition[] {
    return Object.values(themes);
  }

  getThemeList(): ThemeDefinition[] {
    return Object.values(themes);
  }

  get themesByCategory(): Record<string, ThemeDefinition[]> {
    return this.availableThemes.reduce((acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    }, {} as Record<string, ThemeDefinition[]>);
  }

  get autoSwitch(): boolean {
    return this._autoSwitch;
  }

  get userPreferences(): Record<string, any> {
    return this._userPreferences;
  }

  // Theme switching
  setTheme(themeId: string): void {
    if (!themes[themeId]) {
      console.warn(`Theme '${themeId}' not found, falling back to default`);
      themeId = 'default';
    }

    this._currentTheme = themeId;
    this.applyTheme(themeId);
    this.saveToStorage();
    
    console.log(`Theme switched to: ${themes[themeId].name}`);
  }

  // Auto theme switching
  setAutoSwitch(enabled: boolean): void {
    this._autoSwitch = enabled;
    this.saveToStorage();
    
    if (enabled) {
      this.startAutoSwitch();
    } else {
      this.stopAutoSwitch();
    }
  }

  // User preferences
  updatePreferences(preferences: Record<string, any>): void {
    this._userPreferences = { ...this._userPreferences, ...preferences };
    this.saveToStorage();
  }

  // Apply theme to DOM using CSS custom properties
  private applyTheme(themeId: string): void {
    if (!browser) return;

    const theme = themes[themeId];
    if (!theme) return;

    const root = document.documentElement;

    // Apply color custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply gradient custom properties
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Apply shadow custom properties
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply animation custom properties
    Object.entries(theme.animations).forEach(([key, value]) => {
      root.style.setProperty(`--animation-${key}`, value);
    });

    // Apply effect custom properties
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value);
    });

    // Set theme data attribute for CSS selectors
    root.setAttribute('data-theme', themeId);

    // Trigger custom theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { themeId, theme }
    }));
  }

  // Auto-switching functionality
  private autoSwitchInterval: number | null = null;
  
  private startAutoSwitch(): void {
    if (!browser) return;
    
    this.stopAutoSwitch();
    
    const themeIds = Object.keys(themes);
    let currentIndex = themeIds.indexOf(this._currentTheme);
    
    this.autoSwitchInterval = window.setInterval(() => {
      currentIndex = (currentIndex + 1) % themeIds.length;
      this.setTheme(themeIds[currentIndex]);
    }, 10000); // Switch every 10 seconds
  }

  private stopAutoSwitch(): void {
    if (this.autoSwitchInterval) {
      clearInterval(this.autoSwitchInterval);
      this.autoSwitchInterval = null;
    }
  }

  // Persistence
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('sensecanvas-theme');
      if (stored) {
        const data = JSON.parse(stored);
        this._currentTheme = data.currentTheme || 'default';
        this._autoSwitch = data.autoSwitch || false;
        this._userPreferences = data.userPreferences || {};
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        currentTheme: this._currentTheme,
        autoSwitch: this._autoSwitch,
        userPreferences: this._userPreferences
      };
      localStorage.setItem('sensecanvas-theme', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }

  // Theme utilities
  getColorValue(colorKey: string): string {
    return (this.currentTheme.colors as any)[colorKey] || '#000000';
  }

  getGradientValue(gradientKey: string): string {
    return (this.currentTheme.gradients as any)[gradientKey] || '';
  }

  isLight(): boolean {
    // Simple check based on background color
    const bg = this.currentTheme.colors.background;
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128;
  }

  // Export theme configuration
  exportTheme(): string {
    return JSON.stringify({
      currentTheme: this._currentTheme,
      customizations: this._userPreferences,
      timestamp: Date.now()
    }, null, 2);
  }

  // Import theme configuration
  importTheme(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      if (config.currentTheme && themes[config.currentTheme]) {
        this.setTheme(config.currentTheme);
        if (config.customizations) {
          this.updatePreferences(config.customizations);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }
}

// Global theme store instance
export const themeStore = new ThemeStore();

// Utility functions
export function getThemeColor(colorKey: string): string {
  return themeStore.getColorValue(colorKey);
}

export function getThemeGradient(gradientKey: string): string {
  return themeStore.getGradientValue(gradientKey);
}

export function getCurrentTheme(): ThemeDefinition {
  return themeStore.currentTheme;
}

// Theme-aware component helper
export function createThemeAwareComponent(baseClasses: string, themeClasses: Record<string, string> = {}) {
  return $derived(() => {
    const currentThemeId = themeStore.currentThemeId;
    const themeSpecificClasses = themeClasses[currentThemeId] || '';
    return `${baseClasses} ${themeSpecificClasses}`.trim();
  });
}