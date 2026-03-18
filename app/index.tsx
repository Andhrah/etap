/**
 * @fileoverview Home screen - root route of the application.
 * @module app/index
 */
import { StyleSheet, View } from 'react-native';

import { AppLayout } from '@components/shared/app-layout';
import { AppText } from '@components/shared/app-text';
import { env } from '@config/env';
import { radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Home screen displaying scaffold verification UI.
 *
 * Confirms app bootstrap, theme wiring, and runtime environment
 * exposure before feature delivery begins.
 *
 * @returns Home screen component
 */
const HomeScreen = () => {
  const { colors } = useAppTheme();

  return (
    <AppLayout contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <AppText variant="eyebrow">Mobile foundation</AppText>
        <AppText variant="title">Production scaffold is in place.</AppText>
        <AppText variant="body" tone="muted">
          The repository is now structured for feature delivery, with app-level providers, typed
          runtime config, semantic theming, and a clean Expo Router boundary.
        </AppText>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primaryBorder,
          },
        ]}>
        <AppText variant="label">Current environment</AppText>
        <AppText variant="body">{env.appEnv}</AppText>
      </View>

      <View style={styles.row}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.primaryBorder,
            },
          ]}>
          <AppText variant="label" style={{ color: colors.primary }}>
            Purple-led
          </AppText>
        </View>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: colors.accentSoft,
              borderColor: colors.accent,
            },
          ]}>
          <AppText variant="label" style={{ color: colors.accent }}>
            Pink accent
          </AppText>
        </View>
      </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
});

export default HomeScreen;
