import { Colors } from '../constants/theme';

// Hook-based theme access for components
export function useTheme() {
  return {
    colors: Colors,
    isDark: false, // TODO: detect system theme
  };
}
