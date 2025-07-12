/**
 * SenseCanvas Theme Types
 * TypeScript types for theme system and customization
 */

// Base theme configuration
export type ThemeMode = 'default' | 'cyberpunk' | 'gaming' | 'minimal' | 'rgb';

export interface ThemeConfig {
  mode: ThemeMode;
  customColors?: Record<string, string>;
  fontSize?: 'sm' | 'md' | 'lg';
  animations?: boolean;
  effects?: boolean;
  autoSwitch?: boolean;
  timeBasedSwitching?: boolean;
}

// Color palette definitions
export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryDisabled: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  secondaryDisabled: string;
  
  // Accent colors
  accent: string;
  accentHover: string;
  accentActive: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundAccent: string;
  backgroundOverlay: string;
  
  // Surface colors
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  surfaceDisabled: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderHover: string;
  borderActive: string;
  borderDisabled: string;
  
  // Status colors
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  error: string;
  errorBackground: string;
  info: string;
  infoBackground: string;
  
  // Cyber/sci-fi specific colors
  cyber: {
    blue: string;
    green: string;
    purple: string;
    pink: string;
    orange: string;
    red: string;
  };
  
  // Glow and neon effects
  glow: {
    primary: string;
    secondary: string;
    accent: string;
    warning: string;
    error: string;
  };
}

// Typography configuration
export interface Typography {
  // Font families
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
    cyber: string;
  };
  
  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  
  // Font weights
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  
  // Line heights
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  
  // Letter spacing
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

// Spacing system
export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

// Border radius configuration
export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// Shadow configuration
export interface Shadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  
  // Cyber/glow shadows
  glow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Colored shadows
  colored: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  };
}

// Animation configuration
export interface Animations {
  // Duration
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  
  // Timing functions
  timing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
  
  // Keyframes
  keyframes: {
    fadeIn: string;
    fadeOut: string;
    slideUp: string;
    slideDown: string;
    slideLeft: string;
    slideRight: string;
    scale: string;
    rotate: string;
    pulse: string;
    glow: string;
    neonPulse: string;
    cyberSweep: string;
  };
}

// Complete theme definition
export interface Theme {
  name: string;
  mode: ThemeMode;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  animations: Animations;
  
  // Theme-specific properties
  cyber?: {
    scanlineOpacity: number;
    glitchIntensity: number;
    hologramEffect: boolean;
    particleEffects: boolean;
  };
  
  gaming?: {
    rgbAnimation: boolean;
    performanceMode: boolean;
    highContrast: boolean;
    frameIndicators: boolean;
  };
  
  minimal?: {
    hideDecorations: boolean;
    reduceColors: boolean;
    simplifyShapes: boolean;
    monochrome: boolean;
  };
}

// Theme presets
export const DEFAULT_THEME: Theme = {
  name: 'Default',
  mode: 'default',
  colors: {
    primary: '#0066cc',
    primaryHover: '#0052a3',
    primaryActive: '#003d7a',
    primaryDisabled: '#b3d9ff',
    
    secondary: '#6c757d',
    secondaryHover: '#545b62',
    secondaryActive: '#3d4349',
    secondaryDisabled: '#d1d3d4',
    
    accent: '#00ff88',
    accentHover: '#00e075',
    accentActive: '#00c263',
    
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundAccent: '#e9ecef',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    
    surface: '#ffffff',
    surfaceHover: '#f8f9fa',
    surfaceActive: '#e9ecef',
    surfaceDisabled: '#f1f3f4',
    
    text: '#212529',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    textDisabled: '#ced4da',
    textInverse: '#ffffff',
    
    border: '#dee2e6',
    borderHover: '#ced4da',
    borderActive: '#adb5bd',
    borderDisabled: '#e9ecef',
    
    success: '#28a745',
    successBackground: '#d4edda',
    warning: '#ffc107',
    warningBackground: '#fff3cd',
    error: '#dc3545',
    errorBackground: '#f8d7da',
    info: '#17a2b8',
    infoBackground: '#d1ecf1',
    
    cyber: {
      blue: '#00ffff',
      green: '#00ff88',
      purple: '#9d4edd',
      pink: '#ff006e',
      orange: '#ff6b35',
      red: '#ff073a'
    },
    
    glow: {
      primary: '0 0 20px rgba(0, 102, 204, 0.5)',
      secondary: '0 0 20px rgba(108, 117, 125, 0.5)',
      accent: '0 0 20px rgba(0, 255, 136, 0.5)',
      warning: '0 0 20px rgba(255, 193, 7, 0.5)',
      error: '0 0 20px rgba(220, 53, 69, 0.5)'
    }
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: 'Roboto, sans-serif',
      mono: 'JetBrains Mono, Consolas, Monaco, monospace',
      cyber: 'Orbitron, monospace'
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },
    
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    
    glow: {
      sm: '0 0 5px currentColor',
      md: '0 0 10px currentColor',
      lg: '0 0 20px currentColor',
      xl: '0 0 30px currentColor'
    },
    
    colored: {
      primary: '0 4px 20px rgba(0, 102, 204, 0.3)',
      secondary: '0 4px 20px rgba(108, 117, 125, 0.3)',
      accent: '0 4px 20px rgba(0, 255, 136, 0.3)',
      success: '0 4px 20px rgba(40, 167, 69, 0.3)',
      warning: '0 4px 20px rgba(255, 193, 7, 0.3)',
      error: '0 4px 20px rgba(220, 53, 69, 0.3)'
    }
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    
    timing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    
    keyframes: {
      fadeIn: 'fadeIn 0.3s ease-out',
      fadeOut: 'fadeOut 0.3s ease-out',
      slideUp: 'slideUp 0.3s ease-out',
      slideDown: 'slideDown 0.3s ease-out',
      slideLeft: 'slideLeft 0.3s ease-out',
      slideRight: 'slideRight 0.3s ease-out',
      scale: 'scale 0.2s ease-out',
      rotate: 'rotate 0.5s linear',
      pulse: 'pulse 2s ease-in-out infinite',
      glow: 'glow 2s ease-in-out infinite alternate',
      neonPulse: 'neonPulse 2s ease-in-out infinite alternate',
      cyberSweep: 'cyberSweep 3s linear infinite'
    }
  }
};

// Theme utility types
export type ThemeVariant = 'light' | 'dark';
export type ThemeSize = 'compact' | 'normal' | 'comfortable';
export type ThemeEffect = 'none' | 'subtle' | 'moderate' | 'intense';

// Theme context and state
export interface ThemeState {
  currentTheme: Theme;
  variant: ThemeVariant;
  size: ThemeSize;
  effects: ThemeEffect;
  customizations: Partial<Theme>;
  isLoading: boolean;
  error: string | null;
}

// Theme configuration options
export interface ThemeOptions {
  enableAnimations?: boolean;
  enableEffects?: boolean;
  enableParticles?: boolean;
  enableGlow?: boolean;
  enableScanlines?: boolean;
  enableGlitch?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
  colorBlindFriendly?: boolean;
}

// Theme transition configuration
export interface ThemeTransition {
  duration: number;
  easing: string;
  properties: string[];
  enableMorphing?: boolean;
}

// Export all theme types
export type {
  ThemeMode,
  ThemeConfig,
  ColorPalette,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Animations,
  Theme,
  ThemeVariant,
  ThemeSize,
  ThemeEffect,
  ThemeState,
  ThemeOptions,
  ThemeTransition
};