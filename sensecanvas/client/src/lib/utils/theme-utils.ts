/**
 * SenseCanvas Theme Utilities
 * Helper functions for theme management and CSS custom property generation
 */

import type { ThemeDefinition } from '../stores/theme.svelte.js';

/**
 * Apply theme to document root with CSS custom properties
 */
export function applyTheme(theme: ThemeDefinition): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color properties
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply gradient properties
  Object.entries(theme.gradients).forEach(([key, value]) => {
    root.style.setProperty(`--gradient-${key}`, value);
  });
  
  // Apply shadow properties
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
  
  // Apply animation properties
  Object.entries(theme.animations).forEach(([key, value]) => {
    root.style.setProperty(`--animation-${key}`, value);
  });
  
  // Apply effect properties
  Object.entries(theme.effects).forEach(([key, value]) => {
    root.style.setProperty(`--effect-${key}`, value);
  });
  
  // Apply theme metadata
  root.style.setProperty('--theme-id', theme.id);
  root.setAttribute('data-theme', theme.id);
}

/**
 * Generate CSS custom properties string from theme
 */
export function generateCSSProperties(theme: ThemeDefinition): string {
  const properties: string[] = [];
  
  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    properties.push(`--color-${key}: ${value};`);
  });
  
  // Gradients
  Object.entries(theme.gradients).forEach(([key, value]) => {
    properties.push(`--gradient-${key}: ${value};`);
  });
  
  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    properties.push(`--shadow-${key}: ${value};`);
  });
  
  // Animations
  Object.entries(theme.animations).forEach(([key, value]) => {
    properties.push(`--animation-${key}: ${value};`);
  });
  
  // Effects
  Object.entries(theme.effects).forEach(([key, value]) => {
    properties.push(`--effect-${key}: ${value};`);
  });
  
  return properties.join('\n  ');
}

/**
 * Merge two themes, with the second theme overriding the first
 */
export function mergeThemes(
  baseTheme: ThemeDefinition,
  overrideTheme: Partial<ThemeDefinition>
): ThemeDefinition {
  return {
    ...baseTheme,
    ...overrideTheme,
    colors: { ...baseTheme.colors, ...overrideTheme.colors },
    gradients: { ...baseTheme.gradients, ...overrideTheme.gradients },
    shadows: { ...baseTheme.shadows, ...overrideTheme.shadows },
    animations: { ...baseTheme.animations, ...overrideTheme.animations },
    effects: { ...baseTheme.effects, ...overrideTheme.effects }
  };
}

/**
 * Get contrasting text color based on background color
 */
export function getContrastColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Convert hex color to RGBA
 */
export function hexToRGBA(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent);
}

/**
 * Generate color palette variations
 */
export function generateColorPalette(baseColor: string): {
  light: string;
  lighter: string;
  base: string;
  dark: string;
  darker: string;
} {
  return {
    lighter: lightenColor(baseColor, 30),
    light: lightenColor(baseColor, 15),
    base: baseColor,
    dark: darkenColor(baseColor, 15),
    darker: darkenColor(baseColor, 30)
  };
}

/**
 * Check if a theme prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Check if user prefers dark mode
 */
export function prefersDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return mediaQuery.matches;
}

/**
 * Create a CSS filter string for theme effects
 */
export function createEffectFilter(effects: ThemeDefinition['effects']): string {
  const filters: string[] = [];
  
  if (effects.blur !== '0px') {
    filters.push(`blur(${effects.blur})`);
  }
  
  if (effects.brightness !== '100%') {
    filters.push(`brightness(${effects.brightness})`);
  }
  
  if (effects.contrast !== '100%') {
    filters.push(`contrast(${effects.contrast})`);
  }
  
  if (effects.saturate !== '100%') {
    filters.push(`saturate(${effects.saturate})`);
  }
  
  return filters.join(' ');
}

/**
 * Generate glow shadow based on color
 */
export function generateGlowShadow(color: string, intensity: number = 1): string {
  const shadows = [];
  const maxLayers = Math.ceil(intensity * 3);
  
  for (let i = 1; i <= maxLayers; i++) {
    const spread = i * 4;
    const opacity = 0.5 / i;
    shadows.push(`0 0 ${spread}px ${hexToRGBA(color, opacity)}`);
  }
  
  return shadows.join(', ');
}

/**
 * Get theme by time of day
 */
export function getTimeBasedTheme(hour: number): 'cyberpunk' | 'gaming' | 'default' {
  if (hour >= 20 || hour < 6) {
    return 'cyberpunk'; // Night theme
  } else if (hour >= 18 || hour < 9) {
    return 'gaming'; // Evening/morning theme
  } else {
    return 'default'; // Day theme
  }
}

/**
 * Export theme as JSON
 */
export function exportTheme(theme: ThemeDefinition): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Import and validate theme from JSON
 */
export function importTheme(jsonString: string): ThemeDefinition | null {
  try {
    const theme = JSON.parse(jsonString);
    
    // Basic validation
    if (!theme.id || !theme.name || !theme.colors || !theme.gradients) {
      throw new Error('Invalid theme format');
    }
    
    return theme as ThemeDefinition;
  } catch (error) {
    console.error('Failed to import theme:', error);
    return null;
  }
}