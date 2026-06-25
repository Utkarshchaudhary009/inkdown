'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSettings } from '@/lib/db-hooks';

export type Theme = 'light' | 'dark' | 'sepia' | 'night' | 'forest' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark' | 'sepia' | 'night' | 'forest';
  setTheme: (theme: Theme) => Promise<void>;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to resolve the theme (resolves 'system' to system dark/light state)
const resolveTheme = (t: Theme): 'light' | 'dark' | 'sepia' | 'night' | 'forest' => {
  if (t === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? 'dark' : 'light';
  }
  return t as 'light' | 'dark' | 'sepia' | 'night' | 'forest';
};

// Helper to temporarily disable CSS transitions during initial mount theme application
const disableTransitions = () => {
  const css = document.createElement('style');
  css.type = 'text/css';
  css.appendChild(
    document.createTextNode(
      `* {
         -webkit-transition: none !important;
         -moz-transition: none !important;
         -o-transition: none !important;
         -ms-transition: none !important;
         transition: none !important;
       }`
    )
  );
  document.head.appendChild(css);
  return () => {
    // Force style recalculation (reflow)
    window.getComputedStyle(document.body);
    requestAnimationFrame(() => {
      document.head.removeChild(css);
    });
  };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, setSetting } = useSettings();
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'sepia' | 'night' | 'forest'>('light');
  useEffect(() => {
    const storedTheme = (localStorage.getItem('inkdown-theme') as Theme) || 'system';
    setThemeState(storedTheme);
    setResolvedTheme(resolveTheme(storedTheme));
  }, []);

  const isFirstLoad = useRef(true);

  // Helper to apply the theme and store in localStorage
  const applyTheme = useCallback((t: Theme) => {
    const resolved = resolveTheme(t);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;
    localStorage.setItem('inkdown-theme', t);

    // Add/remove the .dark class for dark-aligned themes (dark, night, forest)
    const isDarkAligned = ['dark', 'night', 'forest'].includes(resolved);
    if (isDarkAligned) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 1. Sync theme from database once loaded
  useEffect(() => {
    if (settings.theme) {
      const dbTheme = settings.theme as Theme;
      
      if (isFirstLoad.current) {
        const cleanup = disableTransitions();
        setThemeState(dbTheme);
        applyTheme(dbTheme);
        isFirstLoad.current = false;
        cleanup();
      } else {
        setThemeState(dbTheme);
        applyTheme(dbTheme);
      }
    }
  }, [settings.theme, applyTheme]);

  // 2. Listen to system preference changes (prefers-color-scheme) if set to 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      // System changes should transition smoothly
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme, applyTheme]);

  // 3. Sync font settings (family, size) when loaded/changed in database
  useEffect(() => {
    if (settings.fontFamily) {
      const value = settings.fontFamily as string;
      document.documentElement.style.setProperty(
        '--font-family',
        value === 'serif' ? 'ui-serif, Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif'
      );
      localStorage.setItem('inkdown-fontFamily', value);
    }
    if (settings.fontSize) {
      const value = settings.fontSize as string;
      document.documentElement.style.setProperty('--font-size-multiplier', value);
      localStorage.setItem('inkdown-fontSize', value);
    }
  }, [settings.fontFamily, settings.fontSize]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    await setSetting('theme', newTheme);
  };

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    themes: ['light', 'dark', 'sepia', 'night', 'forest', 'system'],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
