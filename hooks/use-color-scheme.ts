import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeStore } from '@/stores/useThemeStore';
import { useEffect } from 'react';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const { themeMode, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  if (themeMode === 'system') {
    return systemColorScheme || 'light';
  }

  return themeMode;
}
