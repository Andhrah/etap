/**
 * @fileoverview Fences screen - manage geofence boundaries.
 * @module app/(tabs)/fences
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@components/shared/app-text';
import { spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Fences screen placeholder for managing geofence boundaries.
 */
const FencesScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.content}>
        <AppText variant="headline">Fences</AppText>
        <AppText variant="body" tone="muted">
          Manage your geofence boundaries here.
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
});

export default FencesScreen;
