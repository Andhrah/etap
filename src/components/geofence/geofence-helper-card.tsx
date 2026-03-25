/**
 * @fileoverview Helper card shown before a geofence is placed.
 * @module components/geofence/geofence-helper-card
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Pre-geofence guidance card for first-time setup.
 */
type GeofenceHelperCardProps = {
  compact?: boolean;
  isActionDisabled?: boolean;
  onUseCurrentLocation?: () => void;
};

/**
 * Pre-geofence guidance card for first-time setup.
 */
const GeofenceHelperCard = ({
  compact = false,
  isActionDisabled = false,
  onUseCurrentLocation,
}: GeofenceHelperCardProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const spacingScale = getResponsiveSpacingScale(width, height);
  const minCardHeight = Math.round(height * 0.2);
  const iconTileSize = compact
    ? getScaledValue(60, spacingScale)
    : getScaledValue(68, spacingScale);
  const iconSize = compact ? getScaledValue(26, spacingScale) : getScaledValue(30, spacingScale);

  return (
    <View
      style={[
        {
          gap: getScaledValue(spacing.md, spacingScale),
          minHeight: minCardHeight,
          padding: compact
            ? getScaledValue(spacing.md, spacingScale)
            : getScaledValue(spacing.lg, spacingScale),
        },
      ]}>
      <View style={styles.contentRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: colors.surfaceAlt,
              height: iconTileSize,
              width: iconTileSize,
            },
          ]}>
          <Ionicons name="locate-outline" color={colors.primary} size={iconSize} />
        </View>

        <View style={styles.copy}>
          <AppText style={compact ? styles.titleCompact : styles.titleDefault} variant="headline">
            Set Your Zone
          </AppText>
          <AppText style={compact ? styles.bodyCopyCompact : styles.bodyCopy} tone="muted">
            Use your location or tap the map.
          </AppText>
        </View>
      </View>

      <AppButton
        disabled={isActionDisabled}
        icon="locate-outline"
        onPress={onUseCurrentLocation}
        size={compact ? 'md' : 'lg'}
        style={styles.actionButton}
        title="Use My Location"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignSelf: 'stretch',
  },
  copy: {
    flex: 1,
    gap: spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bodyCopy: {
    fontSize: 17,
    lineHeight: 26,
  },
  bodyCopyCompact: {
    fontSize: 15,
    lineHeight: 23,
  },
  titleCompact: {
    fontSize: 21,
    lineHeight: 27,
  },
  titleDefault: {
    fontSize: 22,
    lineHeight: 28,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.md,
    justifyContent: 'center',
  },
});

export { GeofenceHelperCard };
export type { GeofenceHelperCardProps };
