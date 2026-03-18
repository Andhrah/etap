/**
 * @fileoverview React Navigation theme configuration using app color tokens.
 * @module constants/theme/navigation-theme
 */
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { semanticColors } from './colors';

/**
 * React Navigation theme objects derived from the app's semantic color system.
 *
 * Maps semantic color tokens to React Navigation's expected theme structure.
 * Both light and dark themes extend the library defaults while overriding
 * colors to match the ETAP brand system.
 *
 * @remarks
 * Theme mappings:
 * - `primary` → Used for active tab icons and header buttons
 * - `background` → Root navigator background
 * - `card` → Header and tab bar backgrounds
 * - `text` → Default text color in navigation elements
 * - `border` → Separator lines in navigation UI
 * - `notification` → Badge backgrounds (mapped to danger color)
 */
const navigationThemes: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: semanticColors.light.primary,
      background: semanticColors.light.background,
      card: semanticColors.light.surface,
      text: semanticColors.light.text,
      border: semanticColors.light.border,
      notification: semanticColors.light.danger,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: semanticColors.dark.primary,
      background: semanticColors.dark.background,
      card: semanticColors.dark.surface,
      text: semanticColors.dark.text,
      border: semanticColors.dark.border,
      notification: semanticColors.dark.danger,
    },
  },
};

export { navigationThemes };
