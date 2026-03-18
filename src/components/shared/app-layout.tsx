/**
 * @fileoverview Safe-area aware layout wrapper with scrollable content.
 * @module components/shared/app-layout
 */
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Props for the AppLayout component.
 * @property children - Screen content to render within the scrollable area
 * @property contentContainerStyle - Additional styles for the scroll content container
 */
type AppLayoutProps = PropsWithChildren<{
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

/**
 * Scrollable layout primitive that applies safe-area handling and themed
 * background styling for top-level screens.
 *
 * Wraps content in a SafeAreaView and ScrollView to ensure proper inset
 * handling across devices and automatic keyboard avoidance.
 *
 * @param props - Component props
 * @param props.children - Screen content to render
 * @param props.contentContainerStyle - Additional styles for content container
 * @returns Safe-area wrapped scrollable screen container
 *
 * @example
 * ```tsx
 * <AppLayout contentContainerStyle={{ gap: 16 }}>
 *   <AppText variant="title">Page Title</AppText>
 *   <AppText>Content goes here</AppText>
 * </AppLayout>
 * ```
 */
const AppLayout = ({ children, contentContainerStyle }: AppLayoutProps) => {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
        style={styles.scrollView}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
});

export { AppLayout };
