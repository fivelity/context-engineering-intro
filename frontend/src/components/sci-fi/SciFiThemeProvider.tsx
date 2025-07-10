/**
 * SciFiThemeProvider - Complete theme system with CSS custom properties
 * Implements all 5 sci-fi themes from the PRP specification
 */

import React, { createContext, useContext, useEffect } from 'react';
import { SciFiTheme, SciFiThemeId } from '@types';
import { useTheme } from '@hooks';

interface SciFiThemeContextType {
  currentTheme: SciFiTheme;
  themes: Record<SciFiThemeId, SciFiTheme>;
  setTheme: (themeId: SciFiThemeId) => void;
  effectsEnabled: boolean;
  animationsEnabled: boolean;
}

const SciFiThemeContext = createContext<SciFiThemeContextType | null>(null);

export const useSciFiTheme = () => {
  const context = useContext(SciFiThemeContext);
  if (!context) {
    throw new Error('useSciFiTheme must be used within SciFiThemeProvider');
  }
  return context;
};

// Define all 5 sci-fi themes from PRP
const SCIFI_THEMES: Record<SciFiThemeId, SciFiTheme> = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Classic cyberpunk with neon green and dark backgrounds',
    colors: {
      primary: '#00ff88',
      secondary: '#ff0080',
      accent: '#00ffff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#333333',
      success: '#00ff88',
      warning: '#ffaa00',
      danger: '#ff0044',
      muted: '#666666'
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: true,
      glitch: true,
      hologram: false,
      pulse: true,
      dataFlow: true,
      cornerDecoration: true,
      borderRadius: 4,
      cornerSize: 12
    }
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Bright neon colors with electric blue highlights',
    colors: {
      primary: '#0099ff',
      secondary: '#ff3366',
      accent: '#ffff00',
      background: '#000011',
      surface: '#001122',
      text: '#ffffff',
      textSecondary: '#aaccff',
      border: '#0066cc',
      success: '#00ff99',
      warning: '#ffcc00',
      danger: '#ff3366',
      muted: '#666699'
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: false,
      particles: true,
      glitch: false,
      hologram: true,
      pulse: true,
      dataFlow: true,
      cornerDecoration: true,
      borderRadius: 8,
      cornerSize: 16
    }
  },
  gaming: {
    id: 'gaming',
    name: 'Gaming',
    description: 'RGB gaming aesthetic with customizable colors',
    colors: {
      primary: '#ff6600',
      secondary: '#00ff66',
      accent: '#6600ff',
      background: '#0d1117',
      surface: '#161b22',
      text: '#f0f6fc',
      textSecondary: '#8b949e',
      border: '#30363d',
      success: '#238636',
      warning: '#d29922',
      danger: '#da3633',
      muted: '#656d76'
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: false,
      glitch: true,
      hologram: false,
      pulse: true,
      dataFlow: false,
      cornerDecoration: false,
      borderRadius: 6,
      cornerSize: 8
    }
  },
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Clean corporate look with subtle sci-fi elements',
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#06b6d4',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      muted: '#94a3b8'
    },
    effects: {
      glow: false,
      animation: true,
      scanlines: false,
      particles: false,
      glitch: false,
      hologram: false,
      pulse: false,
      dataFlow: false,
      cornerDecoration: true,
      borderRadius: 8,
      cornerSize: 4
    }
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    description: 'Green matrix code aesthetic with falling particles',
    colors: {
      primary: '#00ff41',
      secondary: '#008f11',
      accent: '#41ff00',
      background: '#000000',
      surface: '#001100',
      text: '#00ff41',
      textSecondary: '#008f11',
      border: '#003300',
      success: '#00ff41',
      warning: '#88ff00',
      danger: '#ff4411',
      muted: '#004400'
    },
    effects: {
      glow: true,
      animation: true,
      scanlines: true,
      particles: true,
      glitch: false,
      hologram: false,
      pulse: true,
      dataFlow: true,
      cornerDecoration: false,
      borderRadius: 0,
      cornerSize: 0
    }
  }
};

interface SciFiThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: SciFiThemeId;
}

export const SciFiThemeProvider: React.FC<SciFiThemeProviderProps> = ({
  children,
  defaultTheme = 'cyberpunk'
}) => {
  const {
    currentTheme,
    setTheme,
    effectsEnabled,
    animationsEnabled,
    currentThemeId
  } = useTheme();

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const theme = SCIFI_THEMES[currentThemeId] || SCIFI_THEMES[defaultTheme];
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--sci-fi-${key}`, value);
    });
    
    // Apply effect variables
    Object.entries(theme.effects).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        root.style.setProperty(`--sci-fi-${key}`, value ? '1' : '0');
      } else if (typeof value === 'number') {
        root.style.setProperty(`--sci-fi-${key}`, `${value}px`);
      }
    });
    
    // Apply theme class
    root.className = root.className.replace(/sci-fi-theme-\w+/g, '');
    root.classList.add(`sci-fi-theme-${theme.id}`);
    
    // Apply effects state
    root.classList.toggle('effects-enabled', effectsEnabled);
    root.classList.toggle('animations-enabled', animationsEnabled);
    
  }, [currentThemeId, defaultTheme, effectsEnabled, animationsEnabled]);

  const contextValue: SciFiThemeContextType = {
    currentTheme: SCIFI_THEMES[currentThemeId] || SCIFI_THEMES[defaultTheme],
    themes: SCIFI_THEMES,
    setTheme,
    effectsEnabled,
    animationsEnabled
  };

  return (
    <SciFiThemeContext.Provider value={contextValue}>
      {children}
    </SciFiThemeContext.Provider>
  );
};

export default SciFiThemeProvider;