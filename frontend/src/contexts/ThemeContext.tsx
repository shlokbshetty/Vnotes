/**
 * Theme Context
 * Manages global theme state (light/dark mode) with localStorage persistence
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Type definition for the theme context
 */
export interface ThemeContextType {
  /**
   * The current theme mode
   */
  theme: 'light' | 'dark';
  /**
   * Function to toggle between light and dark themes
   */
  toggleTheme: () => void;
}

/**
 * Create the theme context
 */
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vnotes-theme';
const DEFAULT_THEME = 'dark' as const;

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component that manages theme state and applies it to the HTML element
 * 
 * Features:
 * - Reads theme preference from localStorage (key: vnotes-theme)
 * - Defaults to 'dark' if no preference exists
 * - Applies 'dark' or 'light' class to <html> element
 * - Updates localStorage within 100ms when theme changes
 * - Persists state across browser sessions
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as 'light' | 'dark') || DEFAULT_THEME;
  });

  // Apply theme to HTML element on mount and when theme changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Apply the theme class to <html> element
    htmlElement.classList.remove('light', 'dark');
    htmlElement.classList.add(theme);
    
    // Apply data-theme attribute for CSS variable scoping
    htmlElement.setAttribute('data-theme', theme);
    
    // Update localStorage
    const updateLocalStorage = setTimeout(() => {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, 0); // Within 100ms requirement
    
    return () => clearTimeout(updateLocalStorage);
  }, [theme]);

  /**
   * Toggle theme between light and dark
   */
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access theme context
 * 
 * @returns The current theme and toggle function
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
