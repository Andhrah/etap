/**
 * @fileoverview Hook for accessing the current theme with semantic color tokens.
 * @module constants/theme/use-app-theme
 */
import { useTheme } from '@react-navigation/native';

import { semanticColors } from './colors';

/**
 * Returns the active navigation theme merged with app-specific semantic tokens.
 *
 * Components should consume this hook instead of branching on light/dark mode
 * manually so theme resolution remains consistent across the codebase.
 *
 * @returns Theme object with `colors` containing all semantic color tokens
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { colors } = useAppTheme();
 *   return <View style={{ backgroundColor: colors.surface }} />;
 * };
 * ```
 */
const useAppTheme = () => {
  const theme = useTheme();

  return {
    ...theme,
    colors: theme.dark ? semanticColors.dark : semanticColors.light,
  };
};

export { useAppTheme };
