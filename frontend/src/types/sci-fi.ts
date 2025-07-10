/**
 * Sci-Fi design system types for the futuristic gaming aesthetic
 * These types define the theming system and visual effects
 */

export type SciFiThemeId = 'cyberpunk' | 'neon' | 'gaming' | 'corporate' | 'matrix';

export interface SciFiColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface SciFiEffects {
  glow: boolean;
  animation: boolean;
  scanlines: boolean;
  particles: boolean;
  glitch: boolean;
  hologram: boolean;
}

export interface SciFiTheme {
  id: SciFiThemeId;
  name: string;
  description: string;
  colors: SciFiColors;
  effects: SciFiEffects;
  typography: {
    fontFamily: string;
    headingFont: string;
    codeFont: string;
  };
  spacing: {
    borderRadius: string;
    glowRadius: string;
    shadowBlur: string;
  };
}

// SVG path definition for sci-fi frames
export interface SVGPath {
  d: string;
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity?: number;
  className?: string;
  strokeDasharray?: string;
  strokeDashoffset?: string;
}

// Frame types for different widget containers
export type SciFiFrameType = 
  | 'basic' 
  | 'advanced' 
  | 'hexagon' 
  | 'diamond' 
  | 'circuit' 
  | 'angular' 
  | 'custom';

export interface SciFiFrameConfig {
  type: SciFiFrameType;
  glowEffect: boolean;
  animated: boolean;
  cornerCuts: boolean;
  borderGlow: boolean;
  innerGlow: boolean;
  customPaths?: SVGPath[];
  gradientBorder?: boolean;
  pulseAnimation?: boolean;
}

// Animation types for sci-fi effects
export type SciFiAnimationType = 
  | 'pulse' 
  | 'glow' 
  | 'scan' 
  | 'glitch' 
  | 'float' 
  | 'rotate' 
  | 'shimmer'
  | 'circuit'
  | 'hologram';

export interface SciFiAnimation {
  type: SciFiAnimationType;
  duration: number;
  delay: number;
  iteration: 'infinite' | number;
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  timing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

// Particle system configuration
export interface ParticleConfig {
  enabled: boolean;
  count: number;
  size: [number, number]; // min, max
  speed: [number, number]; // min, max
  color: string;
  opacity: [number, number]; // min, max
  direction: 'up' | 'down' | 'left' | 'right' | 'random';
  lifetime: number;
}

// Glow effect configuration
export interface GlowConfig {
  enabled: boolean;
  intensity: 'subtle' | 'normal' | 'intense';
  color: string;
  spread: number;
  blur: number;
  animate: boolean;
}

// Complete sci-fi visual configuration
export interface SciFiVisualConfig {
  theme: SciFiThemeId;
  frame: SciFiFrameConfig;
  animations: SciFiAnimation[];
  particles: ParticleConfig;
  glow: GlowConfig;
  scanlines: boolean;
  hologramEffect: boolean;
  glitchEffect: boolean;
}

// Default theme configurations
export const DEFAULT_THEMES: Record<SciFiThemeId, SciFiTheme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Purple and gold futuristic aesthetic',
    colors: {
      primary: '#7c3aed',
      secondary: '#fbbf24',
      accent: '#ec4899',
      background: '#0f0f23',
      surface: '#1e1b4b',
      text: '#e2e8f0',
      textMuted: '#94a3b8',
      border: '#475569',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: true,
      glitch: false,
      hologram: true,
    },
    typography: {
      fontFamily: 'JetBrains Mono',
      headingFont: 'Orbitron',
      codeFont: 'Fira Code',
    },
    spacing: {
      borderRadius: '8px',
      glowRadius: '10px',
      shadowBlur: '20px',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Bright cyan and orange neon lights',
    colors: {
      primary: '#00ffff',
      secondary: '#ff8c00',
      accent: '#ff1493',
      background: '#000000',
      surface: '#111111',
      text: '#ffffff',
      textMuted: '#cccccc',
      border: '#333333',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: false,
      particles: true,
      glitch: true,
      hologram: false,
    },
    typography: {
      fontFamily: 'JetBrains Mono',
      headingFont: 'Orbitron',
      codeFont: 'Monaco',
    },
    spacing: {
      borderRadius: '4px',
      glowRadius: '15px',
      shadowBlur: '25px',
    },
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    description: 'Electric green and blue gaming setup',
    colors: {
      primary: '#00ff88',
      secondary: '#0ea5e9',
      accent: '#a855f7',
      background: '#0a0e1a',
      surface: '#1a202c',
      text: '#f7fafc',
      textMuted: '#a0aec0',
      border: '#4a5568',
      success: '#38a169',
      warning: '#ed8936',
      error: '#e53e3e',
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: true,
      glitch: false,
      hologram: true,
    },
    typography: {
      fontFamily: 'JetBrains Mono',
      headingFont: 'Orbitron',
      codeFont: 'Consolas',
    },
    spacing: {
      borderRadius: '6px',
      glowRadius: '12px',
      shadowBlur: '18px',
    },
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional blue and silver interface',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#475569',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    effects: {
      glow: false,
      animation: true,
      scanlines: false,
      particles: false,
      glitch: false,
      hologram: false,
    },
    typography: {
      fontFamily: 'Inter',
      headingFont: 'Inter',
      codeFont: 'JetBrains Mono',
    },
    spacing: {
      borderRadius: '8px',
      glowRadius: '5px',
      shadowBlur: '10px',
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    description: 'Classic green on black matrix style',
    colors: {
      primary: '#00ff00',
      secondary: '#000000',
      accent: '#008000',
      background: '#000000',
      surface: '#001100',
      text: '#00ff00',
      textMuted: '#008000',
      border: '#004400',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: true,
      glitch: true,
      hologram: false,
    },
    typography: {
      fontFamily: 'Courier New',
      headingFont: 'Courier New',
      codeFont: 'Courier New',
    },
    spacing: {
      borderRadius: '0px',
      glowRadius: '8px',
      shadowBlur: '15px',
    },
  },
};

// Default frame configurations
export const DEFAULT_FRAME_CONFIGS: Record<SciFiFrameType, SciFiFrameConfig> = {
  basic: {
    type: 'basic',
    glowEffect: false,
    animated: false,
    cornerCuts: true,
    borderGlow: false,
    innerGlow: false,
    gradientBorder: false,
    pulseAnimation: false,
  },
  advanced: {
    type: 'advanced',
    glowEffect: true,
    animated: true,
    cornerCuts: true,
    borderGlow: true,
    innerGlow: true,
    gradientBorder: true,
    pulseAnimation: false,
  },
  hexagon: {
    type: 'hexagon',
    glowEffect: true,
    animated: false,
    cornerCuts: false,
    borderGlow: true,
    innerGlow: false,
    gradientBorder: false,
    pulseAnimation: true,
  },
  diamond: {
    type: 'diamond',
    glowEffect: true,
    animated: true,
    cornerCuts: false,
    borderGlow: true,
    innerGlow: true,
    gradientBorder: true,
    pulseAnimation: false,
  },
  circuit: {
    type: 'circuit',
    glowEffect: true,
    animated: true,
    cornerCuts: true,
    borderGlow: true,
    innerGlow: false,
    gradientBorder: false,
    pulseAnimation: false,
  },
  angular: {
    type: 'angular',
    glowEffect: true,
    animated: false,
    cornerCuts: true,
    borderGlow: false,
    innerGlow: true,
    gradientBorder: true,
    pulseAnimation: true,
  },
  custom: {
    type: 'custom',
    glowEffect: false,
    animated: false,
    cornerCuts: false,
    borderGlow: false,
    innerGlow: false,
    gradientBorder: false,
    pulseAnimation: false,
  },
};

// Utility functions for working with themes
export function getThemeColors(themeId: SciFiThemeId): SciFiColors {
  return DEFAULT_THEMES[themeId].colors;
}

export function getThemeEffects(themeId: SciFiThemeId): SciFiEffects {
  return DEFAULT_THEMES[themeId].effects;
}

export function createCustomTheme(
  id: SciFiThemeId,
  overrides: Partial<SciFiTheme>
): SciFiTheme {
  return {
    ...DEFAULT_THEMES[id],
    ...overrides,
    colors: {
      ...DEFAULT_THEMES[id].colors,
      ...overrides.colors,
    },
    effects: {
      ...DEFAULT_THEMES[id].effects,
      ...overrides.effects,
    },
  };
}

// CSS custom property mapping
export function getThemeCSSVariables(theme: SciFiTheme): Record<string, string> {
  return {
    '--sci-fi-primary': theme.colors.primary,
    '--sci-fi-secondary': theme.colors.secondary,
    '--sci-fi-accent': theme.colors.accent,
    '--sci-fi-background': theme.colors.background,
    '--sci-fi-surface': theme.colors.surface,
    '--sci-fi-text': theme.colors.text,
    '--sci-fi-text-muted': theme.colors.textMuted,
    '--sci-fi-border': theme.colors.border,
    '--sci-fi-success': theme.colors.success,
    '--sci-fi-warning': theme.colors.warning,
    '--sci-fi-error': theme.colors.error,
    '--sci-fi-border-radius': theme.spacing.borderRadius,
    '--sci-fi-glow-radius': theme.spacing.glowRadius,
    '--sci-fi-shadow-blur': theme.spacing.shadowBlur,
    '--sci-fi-font-family': theme.typography.fontFamily,
    '--sci-fi-heading-font': theme.typography.headingFont,
    '--sci-fi-code-font': theme.typography.codeFont,
  };
}