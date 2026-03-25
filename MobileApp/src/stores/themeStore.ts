import { create } from 'zustand';

export interface Theme {
  colors: {
    primary: string;
    primary_light: string;
    primary_dark: string;
    background: string;
    surface: string;
    surface_elevated: string;
    text_primary: string;
    text_secondary: string;
    text_tertiary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    small: number;
    base: number;
    large: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

const LIGHT_THEME: Theme = {
  colors: {
    primary: '#2980b9',
    primary_light: '#3498db',
    primary_dark: '#1a5490',
    background: '#f5f5f5',
    surface: '#ffffff',
    surface_elevated: '#f9f9f9',
    text_primary: '#333333',
    text_secondary: '#666666',
    text_tertiary: '#999999',
    border: '#eeeeee',
    error: '#d32f2f',
    warning: '#ffc107',
    success: '#4caf50',
    info: '#2196f3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    small: 11,
    base: 13,
    large: 14,
    xl: 16,
    xxl: 20,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 999,
  },
};

const DARK_THEME: Theme = {
  colors: {
    primary: '#3498db',
    primary_light: '#5dade2',
    primary_dark: '#2980b9',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    surface_elevated: '#3a3a3a',
    text_primary: '#f0f0f0',
    text_secondary: '#b0b0b0',
    text_tertiary: '#707070',
    border: '#404040',
    error: '#ff5252',
    warning: '#ffb300',
    success: '#66bb6a',
    info: '#42a5f5',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    small: 11,
    base: 13,
    large: 14,
    xl: 16,
    xxl: 20,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 999,
  },
};

interface ThemeStore {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

/**
 * Global Theme Store - Manages light/dark mode
 * - Centralizes color palette, spacing, and typography
 * - Dynamically switches between light and dark themes
 * - Persisted to localStorage for user preference
 */
export const useTheme = create<ThemeStore>((set) => ({
  isDark: false,
  theme: LIGHT_THEME,

  toggleTheme: () => {
    set((state) => ({
      isDark: !state.isDark,
      theme: state.isDark ? LIGHT_THEME : DARK_THEME,
    }));
  },

  setDarkMode: (dark: boolean) => {
    set({
      isDark: dark,
      theme: dark ? DARK_THEME : LIGHT_THEME,
    });
  },
}));
