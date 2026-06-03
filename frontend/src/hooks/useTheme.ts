/**
 * useTheme Hook
 * 
 * A custom React hook for accessing the global theme context.
 * 
 * @returns {ThemeContextType} Object containing:
 *   - `theme`: 'light' | 'dark' - The current theme mode
 *   - `toggleTheme`: () => void - Function to toggle between themes
 * 
 * @throws {Error} If used outside of a ThemeProvider component
 * 
 * @example
 * ```tsx
 * import { useTheme } from '../hooks/useTheme';
 * 
 * export function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   );
 * }
 * ```
 */

export { useTheme } from '../contexts/ThemeContext';
export type { ThemeContextType } from '../contexts/ThemeContext';
