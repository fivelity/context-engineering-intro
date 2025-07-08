// ThemeConfig.js — defines CSS-variable tokens and helpers for Skeleton/Tailwind
export const themes = {
    light: {
      '--color-bg': '#ffffff',
      '--color-fg': '#1a1a1a',
      '--accent': '#3b82f6'
    },
    dark: {
      '--color-bg': '#1a1a1a',
      '--color-fg': '#f0f0f0',
      '--accent': '#60a5fa'
    }
  };
  
  export function applyTheme(name) {
    const root = document.documentElement;
    const vars = themes[name];
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }
  