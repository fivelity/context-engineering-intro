/**
 * SenseCanvas Theme Store Tests
 * Testing Svelte 5 runes theme management with TailwindCSS 4+ integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { tick } from 'svelte';
import { get } from 'svelte/store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock CSS custom properties
const documentMock = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn()
    }
  }
};
Object.defineProperty(window, 'document', {
  value: documentMock
});

describe('Theme Store', () => {
  let themeStore: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Import theme store fresh for each test
    const module = await import('../../../sensecanvas/client/src/lib/stores/theme.svelte.ts');
    themeStore = module.themeStore;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default theme', () => {
      expect(themeStore.currentTheme.name).toBe('default');
      expect(themeStore.autoSwitch).toBe(false);
    });

    it('should load saved theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('cyberpunk');
      
      // Re-import to trigger initialization
      const module = await import('../../../sensecanvas/client/src/lib/stores/theme.svelte.ts');
      const store = module.themeStore;
      
      expect(store.currentTheme.name).toBe('cyberpunk');
    });

    it('should handle invalid saved theme gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-theme');
      
      const module = await import('../../../sensecanvas/client/src/lib/stores/theme.svelte.ts');
      const store = module.themeStore;
      
      expect(store.currentTheme.name).toBe('default');
    });
  });

  describe('Theme Switching', () => {
    it('should switch to cyberpunk theme', () => {
      themeStore.setTheme('cyberpunk');
      
      expect(themeStore.currentTheme.name).toBe('cyberpunk');
      expect(themeStore.currentTheme.colors.primary).toBe('#a855f7');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sensecanvas-theme', 'cyberpunk');
    });

    it('should switch to gaming theme', () => {
      themeStore.setTheme('gaming');
      
      expect(themeStore.currentTheme.name).toBe('gaming');
      expect(themeStore.currentTheme.colors.primary).toBe('#22c55e');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sensecanvas-theme', 'gaming');
    });

    it('should switch to minimal theme', () => {
      themeStore.setTheme('minimal');
      
      expect(themeStore.currentTheme.name).toBe('minimal');
      expect(themeStore.currentTheme.colors.primary).toBe('#64748b');
    });

    it('should switch to rgb theme', () => {
      themeStore.setTheme('rgb');
      
      expect(themeStore.currentTheme.name).toBe('rgb');
      expect(themeStore.currentTheme.colors.primary).toBe('#f59e0b');
    });

    it('should ignore invalid theme names', () => {
      const originalTheme = themeStore.currentTheme.name;
      themeStore.setTheme('invalid-theme');
      
      expect(themeStore.currentTheme.name).toBe(originalTheme);
    });
  });

  describe('CSS Custom Properties', () => {
    it('should apply CSS custom properties when theme changes', () => {
      themeStore.setTheme('cyberpunk');
      
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--color-primary',
        '#a855f7'
      );
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--color-secondary',
        '#ec4899'
      );
    });

    it('should apply background gradient', () => {
      themeStore.setTheme('cyberpunk');
      
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--gradient-primary',
        'linear-gradient(135deg, #a855f7, #ec4899)'
      );
    });

    it('should apply shadow glow properties', () => {
      themeStore.setTheme('cyberpunk');
      
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--shadow-glow',
        '0 0 20px rgba(168, 85, 247, 0.3)'
      );
    });

    it('should apply background animation properties', () => {
      themeStore.setTheme('gaming');
      
      expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--bg-animation-1',
        'pulse 4s ease-in-out infinite'
      );
    });
  });

  describe('Auto-Switch Functionality', () => {
    beforeEach(() => {
      // Mock Date for consistent testing
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should enable auto-switch', () => {
      themeStore.setAutoSwitch(true);
      
      expect(themeStore.autoSwitch).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sensecanvas-auto-switch', 'true');
    });

    it('should disable auto-switch', () => {
      themeStore.setAutoSwitch(true);
      themeStore.setAutoSwitch(false);
      
      expect(themeStore.autoSwitch).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('sensecanvas-auto-switch', 'false');
    });

    it('should switch to gaming theme during evening hours', () => {
      // Set time to 8 PM
      const mockDate = new Date('2024-01-01T20:00:00Z');
      vi.setSystemTime(mockDate);
      
      themeStore.setAutoSwitch(true);
      
      // Trigger time-based switch
      themeStore.checkTimeBasedSwitch();
      
      expect(themeStore.currentTheme.name).toBe('gaming');
    });

    it('should switch to cyberpunk theme during night hours', () => {
      // Set time to 2 AM
      const mockDate = new Date('2024-01-01T02:00:00Z');
      vi.setSystemTime(mockDate);
      
      themeStore.setAutoSwitch(true);
      themeStore.checkTimeBasedSwitch();
      
      expect(themeStore.currentTheme.name).toBe('cyberpunk');
    });

    it('should use default theme during day hours', () => {
      // Set time to 10 AM
      const mockDate = new Date('2024-01-01T10:00:00Z');
      vi.setSystemTime(mockDate);
      
      themeStore.setAutoSwitch(true);
      themeStore.checkTimeBasedSwitch();
      
      expect(themeStore.currentTheme.name).toBe('default');
    });
  });

  describe('Theme List', () => {
    it('should return all available themes', () => {
      const themes = themeStore.getThemeList();
      
      expect(themes).toHaveLength(5);
      expect(themes.map(t => t.name)).toEqual([
        'default',
        'cyberpunk',
        'gaming',
        'minimal',
        'rgb'
      ]);
    });

    it('should include theme descriptions', () => {
      const themes = themeStore.getThemeList();
      
      expect(themes[0].description).toBe('Clean cyan and blue tech aesthetic');
      expect(themes[1].description).toBe('Purple and pink neon vibes');
    });
  });

  describe('Theme Properties', () => {
    it('should have correct default theme properties', () => {
      themeStore.setTheme('default');
      const theme = themeStore.currentTheme;
      
      expect(theme.colors.primary).toBe('#22d3ee');
      expect(theme.colors.secondary).toBe('#06b6d4');
      expect(theme.colors.accent).toBe('#0891b2');
      expect(theme.colors.background).toBe('#0f172a');
      expect(theme.fonts.primary).toBe('Inter, sans-serif');
    });

    it('should have correct cyberpunk theme properties', () => {
      themeStore.setTheme('cyberpunk');
      const theme = themeStore.currentTheme;
      
      expect(theme.colors.primary).toBe('#a855f7');
      expect(theme.colors.secondary).toBe('#ec4899');
      expect(theme.colors.accent).toBe('#f59e0b');
      expect(theme.effects.glow).toBe(true);
    });

    it('should have correct gaming theme properties', () => {
      themeStore.setTheme('gaming');
      const theme = themeStore.currentTheme;
      
      expect(theme.colors.primary).toBe('#22c55e');
      expect(theme.colors.secondary).toBe('#eab308');
      expect(theme.fonts.primary).toBe('Orbitron, monospace');
      expect(theme.effects.pulse).toBe(true);
    });

    it('should have correct minimal theme properties', () => {
      themeStore.setTheme('minimal');
      const theme = themeStore.currentTheme;
      
      expect(theme.colors.primary).toBe('#64748b');
      expect(theme.colors.secondary).toBe('#475569');
      expect(theme.effects.animations).toBe(false);
    });

    it('should have correct rgb theme properties', () => {
      themeStore.setTheme('rgb');
      const theme = themeStore.currentTheme;
      
      expect(theme.colors.primary).toBe('#f59e0b');
      expect(theme.effects.rainbow).toBe(true);
      expect(theme.effects.glow).toBe(true);
    });
  });

  describe('Persistence', () => {
    it('should save theme preference to localStorage', () => {
      themeStore.setTheme('gaming');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sensecanvas-theme',
        'gaming'
      );
    });

    it('should save auto-switch preference to localStorage', () => {
      themeStore.setAutoSwitch(true);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'sensecanvas-auto-switch',
        'true'
      );
    });

    it('should load auto-switch preference from localStorage', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'sensecanvas-auto-switch') return 'true';
        return null;
      });
      
      const module = await import('../../../sensecanvas/client/src/lib/stores/theme.svelte.ts');
      const store = module.themeStore;
      
      expect(store.autoSwitch).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      expect(() => {
        themeStore.setTheme('cyberpunk');
      }).not.toThrow();
      
      // Theme should still switch despite localStorage error
      expect(themeStore.currentTheme.name).toBe('cyberpunk');
    });

    it('should handle CSS property setting errors gracefully', () => {
      documentMock.documentElement.style.setProperty.mockImplementation(() => {
        throw new Error('CSS error');
      });
      
      expect(() => {
        themeStore.setTheme('gaming');
      }).not.toThrow();
    });
  });

  describe('Reactivity', () => {
    it('should trigger reactive updates when theme changes', async () => {
      let callbackCalled = false;
      let currentTheme = null;
      
      // Mock a reactive subscription
      const unsubscribe = themeStore.subscribe?.((theme: any) => {
        callbackCalled = true;
        currentTheme = theme;
      });
      
      themeStore.setTheme('cyberpunk');
      await tick();
      
      expect(callbackCalled).toBe(true);
      expect(currentTheme?.name).toBe('cyberpunk');
      
      if (unsubscribe) unsubscribe();
    });
  });

  describe('Integration', () => {
    it('should work with TailwindCSS custom properties', () => {
      themeStore.setTheme('cyberpunk');
      
      // Verify all expected CSS custom properties are set
      const expectedProperties = [
        '--color-primary',
        '--color-secondary',
        '--color-accent',
        '--color-background',
        '--gradient-primary',
        '--shadow-glow',
        '--font-primary'
      ];
      
      expectedProperties.forEach(prop => {
        expect(documentMock.documentElement.style.setProperty).toHaveBeenCalledWith(
          prop,
          expect.any(String)
        );
      });
    });
  });
});