import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@swasthtel_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Component specific
  cardBackground: string;
  inputBackground: string;
  tabBarBackground: string;
  headerBackground: string;
  
  // Overlay
  overlay: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  // Primary colors
  primary: '#1b4a5a',
  primaryLight: '#2d6a7a',
  primaryDark: '#0f3040',
  secondary: '#fcaf56',
  
  // Background colors
  background: '#fafbfa',
  backgroundSecondary: '#f5f5f5',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  
  // Text colors
  text: '#040707',
  textSecondary: '#5B5B5B',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',
  
  // Border colors
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Component specific
  cardBackground: '#ffffff',
  inputBackground: '#f5f5f5',
  tabBarBackground: '#ffffff',
  headerBackground: '#1b4a5a',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const darkColors: ThemeColors = {
  // Primary colors
  primary: '#3d8a9a',
  primaryLight: '#4da0b0',
  primaryDark: '#1b4a5a',
  secondary: '#fcaf56',
  
  // Background colors
  background: '#0f1419',
  backgroundSecondary: '#1a2129',
  surface: '#1e2732',
  surfaceElevated: '#283340',
  
  // Text colors
  text: '#f0f0f0',
  textSecondary: '#a0a0a0',
  textTertiary: '#6b7280',
  textInverse: '#040707',
  
  // Border colors
  border: '#2f3b47',
  borderLight: '#283340',
  
  // Status colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Component specific
  cardBackground: '#1e2732',
  inputBackground: '#283340',
  tabBarBackground: '#1a2129',
  headerBackground: '#1a2129',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  // Determine if dark mode is active
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  
  // Get current colors based on theme
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    themeMode,
    isDark,
    colors,
    setThemeMode,
    toggleTheme,
  };

  // Don't render until we've loaded the theme preference
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export colors for external use
export { lightColors, darkColors };
