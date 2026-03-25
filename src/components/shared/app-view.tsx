/**
 * @fileoverview Theme-aware View primitive for consistent background styling.
 * @module components/shared/app-view
 */
import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@theme/use-app-theme';

/**
 * Background variants for AppView.
 * - `background`: Main app background
 * - `surface`: Card/elevated surface
 * - `surfaceAlt`: Alternate surface for grouping
 * - `transparent`: No background color
 */
type AppViewBackground = 'background' | 'surface' | 'surfaceAlt' | 'transparent';

/**
 * Props for the AppView component.
 * @property children - Content to render
 * @property bg - Background color variant from theme
 * @property style - Additional styles to merge
 */
type AppViewProps = PropsWithChildren<{
  bg?: AppViewBackground;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Theme-aware View primitive for consistent background styling across the app.
 *
 * Automatically applies the correct background color based on the current
 * theme (light/dark). Use this instead of raw `View` when you need themed
 * backgrounds.
 *
 * @param props - Component props
 * @param props.children - Content to render
 * @param props.bg - Background variant (defaults to 'transparent')
 * @param props.style - Additional styles to apply
 * @returns Themed View component
 *
 * @example
 * ```tsx
 * <AppView bg="surface" style={styles.card}>
 *   <AppText>Card content</AppText>
 * </AppView>
 *
 * <AppView bg="background" style={{ flex: 1 }}>
 *   <AppText>Screen content</AppText>
 * </AppView>
 * ```
 */
const AppView = ({ children, bg = 'transparent', style }: AppViewProps) => {
  const { colors } = useAppTheme();

  const backgroundColors: Record<AppViewBackground, string | undefined> = {
    background: colors.background,
    surface: colors.surface,
    surfaceAlt: colors.surfaceAlt,
    transparent: undefined,
  };

  return (
    <View
      style={[
        bg !== 'transparent' && { backgroundColor: backgroundColors[bg] },
        style,
      ]}>
      {children}
    </View>
  );
};

export { AppView };
export type { AppViewBackground, AppViewProps };

