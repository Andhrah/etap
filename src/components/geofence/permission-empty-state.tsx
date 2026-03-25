/**
 * @fileoverview Permission and loading state card for geofence access.
 * @module components/geofence/permission-empty-state
 */
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Permission card modes rendered before the main workflow is available.
 */
type PermissionEmptyStateMode = 'checking' | 'denied' | 'unsupported';

/**
 * Props for the permission empty state component.
 */
type PermissionEmptyStateProps = {
  compact?: boolean;
  mode: PermissionEmptyStateMode;
  onOpenSettings?: (() => void) | undefined;
  onRetryPress: () => void;
};

/**
 * Renders loading and permission-denied states for location access.
 */
const PermissionEmptyState = ({
  compact = false,
  mode,
  onOpenSettings,
  onRetryPress,
}: PermissionEmptyStateProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const isChecking = mode === 'checking';
  const isUnsupported = mode === 'unsupported';
  const spacingScale = getResponsiveSpacingScale(width, height);
  const cardPadding = compact
    ? getScaledValue(spacing.lg, spacingScale)
    : getScaledValue(spacing.xl, spacingScale);
  const cardMinHeight = compact
    ? getScaledValue(360, spacingScale)
    : getScaledValue(420, spacingScale);
  const contentGap = getScaledValue(spacing.md, spacingScale);
  const iconSize = compact ? getScaledValue(48, spacingScale) : getScaledValue(56, spacingScale);

  return (
    <View
      style={[
        styles.card,
        compact && styles.cardCompact,
        {
          gap: contentGap,
          minHeight: cardMinHeight,
          padding: cardPadding,
        },
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isChecking ? colors.primarySoft : colors.accentSoft,
            height: iconSize,
            width: iconSize,
          },
        ]}>
        {isChecking ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Ionicons name="location-outline" size={28} color={colors.accent} />
        )}
      </View>

      <View style={styles.copy}>
        {!isChecking && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.accentSoft,
              },
            ]}>
            <AppText variant="label" style={{ color: colors.accent }}>
              {isUnsupported ? 'UNSUPPORTED RUNTIME' : 'PERMISSION DENIED'}
            </AppText>
          </View>
        )}
        <AppText style={compact ? styles.headlineCompact : undefined} variant="headline">
          {isChecking
            ? 'Checking location access…'
            : isUnsupported
              ? 'Location needs a development build'
              : 'Location access needed'}
        </AppText>
        <AppText style={styles.copyText} tone="muted">
          {isChecking
            ? "Establishing connection to your device's precision sensors."
            : isUnsupported
              ? 'This app uses a native location module that Expo Go cannot load. Open a development build to request location access and track geofence entry or exit.'
              : 'Allow location access to track your position and detect entry or exit from a geofence.'}
        </AppText>
      </View>

      {!isChecking && (
        <View style={styles.actions}>
          <AppButton
            style={styles.actionButton}
            title="Try Again"
            onPress={onRetryPress}
          />
          {!isUnsupported && onOpenSettings != null && (
            <AppButton
              onPress={onOpenSettings}
              style={styles.actionButton}
              title="Open Settings"
              variant="outline"
            />
          )}
        </View>
      )}

      {!isChecking && !isUnsupported && (
        <AppText tone="muted">
          You can also enable location access from your device settings
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  badge: {
    alignSelf: 'center',
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  card: {
    alignItems: 'center',
    borderRadius: radius.xl,
    maxWidth: 560,
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#1E1630',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
  },
  cardCompact: {
  },
  copy: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  copyText: {
    textAlign: 'center',
  },
  headlineCompact: {
    textAlign: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});

export { PermissionEmptyState };
