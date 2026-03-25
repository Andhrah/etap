/**
 * @fileoverview Geofence screen header.
 * @module components/geofence/geofence-header
 */
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, spacing } from '@theme/tokens';

/**
 * Props for the geofence header component.
 */
type GeofenceHeaderProps = {
  compact?: boolean;
  layout?: 'centered' | 'leading';
};

/**
 * Top bar for the geofence screen with title, subtitle, and locate action.
 */
const GeofenceHeader = ({ compact = false, layout = 'leading' }: GeofenceHeaderProps) => {
  const { height, width } = useWindowDimensions();
  const isCentered = layout === 'centered';
  const spacingScale = getResponsiveSpacingScale(width, height);

  return (
    <View
      style={[
        styles.container,
        {
          gap: getScaledValue(spacing.md, spacingScale),
        },
        isCentered ? styles.centered : styles.leading,
      ]}>
      <View
        style={[
          styles.copy,
          {
            gap: getScaledValue(spacing.xs, spacingScale),
          },
          isCentered && styles.copyCentered,
        ]}>
        <AppText
          style={[
            compact ? styles.titleCompact : styles.titleDefault,
            isCentered ? styles.titleCentered : undefined,
          ]}
          variant="title">
          Location Alerts
        </AppText>
        <AppText
          style={[
            compact ? styles.subtitleCompact : undefined,
            {
              marginBottom: getScaledValue(spacing.lg, spacingScale),
            },
            isCentered ? styles.subtitleCentered : undefined,
          ]}
          tone="muted">
          Create a zone and get alerts when you enter or leave it
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
  },
  copy: {},
  copyCentered: {
    alignItems: 'center',
  },
  container: {},
  leading: {
    alignItems: 'flex-start',
  },
  subtitleCentered: {
    textAlign: 'center',
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  titleCentered: {
    textAlign: 'center',
  },
  titleDefault: {
    fontSize: 24,
    lineHeight: 30,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
});

export { GeofenceHeader };
