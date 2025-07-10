/**
 * Hook for managing sci-fi themes and visual effects
 * Integrates with CSS custom properties and Framer Motion animations
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  SciFiTheme, 
  SciFiThemeId, 
  SciFiColors,
  SciFiEffects,
  SCIFI_THEMES,
  applyCSSCustomProperties,
  generateThemeVariants
} from '@types';

interface ThemeState {
  currentThemeId: SciFiThemeId;
  customThemes: Record<string, SciFiTheme>;
  effectsEnabled: boolean;
  animationsEnabled: boolean;
  performanceMode: boolean;
  colorBlindnessMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reducedMotion: boolean;
  
  // Actions
  setTheme: (themeId: SciFiThemeId) => void;
  createCustomTheme: (theme: Partial<SciFiTheme> & { id: string; name: string }) => void;
  updateCustomTheme: (id: string, updates: Partial<SciFiTheme>) => void;
  deleteCustomTheme: (id: string) => void;
  setEffectsEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setColorBlindnessMode: (mode: ThemeState['colorBlindnessMode']) => void;
  toggleReducedMotion: () => void;
}

// Zustand store for theme management
const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: 'cyberpunk',
      customThemes: {},
      effectsEnabled: true,
      animationsEnabled: true,
      performanceMode: false,
      colorBlindnessMode: 'none',
      reducedMotion: false,

      setTheme: (themeId) => {
        set({ currentThemeId: themeId });
      },

      createCustomTheme: (theme) => {
        set((state) => ({
          customThemes: {
            ...state.customThemes,
            [theme.id]: {
              ...theme,
              id: theme.id,
              name: theme.name,
              description: theme.description || `Custom theme: ${theme.name}`,
              colors: { ...SCIFI_THEMES.cyberpunk.colors, ...theme.colors },
              effects: { ...SCIFI_THEMES.cyberpunk.effects, ...theme.effects },
              frames: { ...SCIFI_THEMES.cyberpunk.frames, ...theme.frames }
            } as SciFiTheme
          }
        }));
      },

      updateCustomTheme: (id, updates) => {
        set((state) => ({
          customThemes: {
            ...state.customThemes,
            [id]: state.customThemes[id] ? {
              ...state.customThemes[id],
              ...updates
            } : state.customThemes[id]
          }
        }));
      },

      deleteCustomTheme: (id) => {
        set((state) => {
          const newCustomThemes = { ...state.customThemes };
          delete newCustomThemes[id];
          return {
            customThemes: newCustomThemes,
            currentThemeId: state.currentThemeId === id ? 'cyberpunk' : state.currentThemeId
          };
        });
      },

      setEffectsEnabled: (enabled) => {
        set({ effectsEnabled: enabled });
      },

      setAnimationsEnabled: (enabled) => {
        set({ animationsEnabled: enabled });
      },

      setPerformanceMode: (enabled) => {
        set({ 
          performanceMode: enabled,
          effectsEnabled: enabled ? false : get().effectsEnabled,
          animationsEnabled: enabled ? false : get().animationsEnabled
        });
      },

      setColorBlindnessMode: (mode) => {
        set({ colorBlindnessMode: mode });
      },

      toggleReducedMotion: () => {
        set((state) => ({ reducedMotion: !state.reducedMotion }));
      },
    }),
    {
      name: 'sensecanvas-theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentThemeId: state.currentThemeId,
        customThemes: state.customThemes,
        effectsEnabled: state.effectsEnabled,
        animationsEnabled: state.animationsEnabled,
        performanceMode: state.performanceMode,
        colorBlindnessMode: state.colorBlindnessMode,
        reducedMotion: state.reducedMotion
      })
    }
  )
);

export const useTheme = () => {
  const {
    currentThemeId,
    customThemes,
    effectsEnabled,
    animationsEnabled,
    performanceMode,
    colorBlindnessMode,
    reducedMotion,
    setTheme,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    setEffectsEnabled,
    setAnimationsEnabled,
    setPerformanceMode,
    setColorBlindnessMode,
    toggleReducedMotion
  } = useThemeStore();

  // State for dynamic theme generation
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

  // Get current theme (built-in or custom)
  const currentTheme = useMemo((): SciFiTheme => {
    const builtInTheme = SCIFI_THEMES[currentThemeId as keyof typeof SCIFI_THEMES];
    const customTheme = customThemes[currentThemeId];
    
    return customTheme || builtInTheme || SCIFI_THEMES.cyberpunk;
  }, [currentThemeId, customThemes]);

  // Get all available themes
  const availableThemes = useMemo(() => {
    const builtInThemes = Object.values(SCIFI_THEMES);
    const customThemesList = Object.values(customThemes);
    return [...builtInThemes, ...customThemesList];
  }, [customThemes]);

  // Apply color blindness adjustments
  const adjustColorsForColorBlindness = useCallback((colors: SciFiColors): SciFiColors => {
    if (colorBlindnessMode === 'none') return colors;

    // Simplified color adjustments for accessibility
    const adjustedColors = { ...colors };

    switch (colorBlindnessMode) {
      case 'protanopia': // Red-blind
        adjustedColors.danger = colors.warning; // Use orange instead of red
        break;
      case 'deuteranopia': // Green-blind
        adjustedColors.success = colors.info; // Use blue instead of green
        break;
      case 'tritanopia': // Blue-blind
        adjustedColors.info = colors.warning; // Use orange instead of blue
        adjustedColors.primary = colors.secondary;
        break;
    }

    return adjustedColors;
  }, [colorBlindnessMode]);

  // Get processed theme with accessibility adjustments
  const processedTheme = useMemo((): SciFiTheme => {
    const theme = { ...currentTheme };
    
    // Apply color blindness adjustments
    theme.colors = adjustColorsForColorBlindness(theme.colors);
    
    // Apply performance mode adjustments
    if (performanceMode) {
      theme.effects = {
        ...theme.effects,
        particles: false,
        hologram: false,
        glitch: false,
        scan: false,
        pulse: false
      };
    }

    return theme;
  }, [currentTheme, adjustColorsForColorBlindness, performanceMode]);

  // Generate CSS custom properties
  const cssVariables = useMemo(() => {
    return applyCSSCustomProperties(processedTheme, {
      enableEffects: effectsEnabled && !performanceMode,
      enableAnimations: animationsEnabled && !performanceMode && !reducedMotion
    });
  }, [processedTheme, effectsEnabled, animationsEnabled, performanceMode, reducedMotion]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${currentTheme.id}`);

    // Apply accessibility classes
    if (reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (performanceMode) {
      root.classList.add('performance-mode');
    } else {
      root.classList.remove('performance-mode');
    }

    if (colorBlindnessMode !== 'none') {
      root.classList.add(`colorblind-${colorBlindnessMode}`);
    } else {
      root.className = root.className.replace(/colorblind-\w+/g, '');
    }

    // Set color scheme for system integration
    root.style.colorScheme = currentTheme.colors.background.includes('dark') ? 'dark' : 'light';

  }, [cssVariables, currentTheme, reducedMotion, performanceMode, colorBlindnessMode]);

  // Detect system preferences
  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && !reducedMotion) {
        toggleReducedMotion();
      }
    };

    // Set initial state
    if (mediaQuery.matches && !reducedMotion) {
      toggleReducedMotion();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [reducedMotion, toggleReducedMotion]);

  // Generate theme variants
  const generateThemeVariants = useCallback((baseTheme: SciFiTheme, count: number = 3) => {
    setIsGeneratingTheme(true);
    
    try {
      const variants = generateThemeVariants(baseTheme, {
        hueShift: { min: -30, max: 30 },
        saturationShift: { min: -20, max: 20 },
        lightnessShift: { min: -10, max: 10 },
        count
      });
      
      return variants;
    } finally {
      setIsGeneratingTheme(false);
    }
  }, []);

  // Export theme configuration
  const exportTheme = useCallback((themeId?: string) => {
    const themeToExport = themeId ? 
      (customThemes[themeId] || SCIFI_THEMES[themeId as keyof typeof SCIFI_THEMES]) : 
      currentTheme;
    
    if (!themeToExport) return null;

    const exportData = {
      theme: themeToExport,
      settings: {
        effectsEnabled,
        animationsEnabled,
        performanceMode,
        colorBlindnessMode,
        reducedMotion
      },
      exportedAt: Date.now(),
      version: '1.0.0',
      app: 'SenseCanvas'
    };

    return JSON.stringify(exportData, null, 2);
  }, [currentTheme, customThemes, effectsEnabled, animationsEnabled, performanceMode, colorBlindnessMode, reducedMotion]);

  // Import theme configuration
  const importTheme = useCallback((themeJson: string): boolean => {
    try {
      const imported = JSON.parse(themeJson);
      
      if (!imported.theme || !imported.theme.id || !imported.theme.name) {
        console.error('Invalid theme format');
        return false;
      }

      const theme = imported.theme as SciFiTheme;
      createCustomTheme(theme);
      
      // Optionally apply imported settings
      if (imported.settings) {
        setEffectsEnabled(imported.settings.effectsEnabled ?? effectsEnabled);
        setAnimationsEnabled(imported.settings.animationsEnabled ?? animationsEnabled);
        setPerformanceMode(imported.settings.performanceMode ?? performanceMode);
        setColorBlindnessMode(imported.settings.colorBlindnessMode ?? colorBlindnessMode);
      }

      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }, [createCustomTheme, setEffectsEnabled, setAnimationsEnabled, setPerformanceMode, setColorBlindnessMode, effectsEnabled, animationsEnabled, performanceMode, colorBlindnessMode]);

  // Get theme statistics
  const getThemeStats = useCallback(() => {
    return {
      totalThemes: availableThemes.length,
      customThemes: Object.keys(customThemes).length,
      builtInThemes: Object.keys(SCIFI_THEMES).length,
      currentThemeType: currentTheme.id in SCIFI_THEMES ? 'built-in' : 'custom',
      effectsEnabled: effectsEnabled && !performanceMode,
      animationsEnabled: animationsEnabled && !performanceMode && !reducedMotion,
      accessibilityFeatures: {
        colorBlindnessMode: colorBlindnessMode !== 'none',
        reducedMotion,
        performanceMode
      }
    };
  }, [availableThemes, customThemes, currentTheme, effectsEnabled, animationsEnabled, performanceMode, reducedMotion, colorBlindnessMode]);

  return {
    // Current theme
    currentTheme: processedTheme,
    currentThemeId,
    
    // Available themes
    availableThemes,
    builtInThemes: Object.values(SCIFI_THEMES),
    customThemes: Object.values(customThemes),
    
    // Theme management
    setTheme,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    
    // CSS integration
    cssVariables,
    
    // Settings
    effectsEnabled: effectsEnabled && !performanceMode,
    animationsEnabled: animationsEnabled && !performanceMode && !reducedMotion,
    performanceMode,
    colorBlindnessMode,
    reducedMotion,
    
    // Settings actions
    setEffectsEnabled,
    setAnimationsEnabled,
    setPerformanceMode,
    setColorBlindnessMode,
    toggleReducedMotion,
    
    // Utilities
    generateThemeVariants,
    exportTheme,
    importTheme,
    getThemeStats,
    isGeneratingTheme,
    
    // Accessibility helpers
    adjustColorsForColorBlindness
  };
};

export default useTheme;