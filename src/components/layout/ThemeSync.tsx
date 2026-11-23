'use client';

import { useEffect } from 'react';
import { useThemeStore, type Theme } from '@/store/theme';
import { useSettingsStore } from '@/store/settings';

function applyTheme(theme: Theme) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  window.Meticulous?.context.recordCustomContext('theme', theme);
  window.Meticulous?.context.recordCustomContext('colorScheme', isDark ? 'dark' : 'light');
}

// Keeps the <html> class in sync with the store, including live system-preference changes
export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  const romajiMode = useSettingsStore((s) => s.romajiMode);

  // Romaji mode changes how phrases and flashcards render
  useEffect(() => {
    window.Meticulous?.context.recordCustomContext('romajiMode', romajiMode);
  }, [romajiMode]);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => applyTheme('system');
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  }, [theme]);

  return null;
}
