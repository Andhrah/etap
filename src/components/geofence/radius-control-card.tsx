/**
 * @fileoverview Radius control and geofence action card.
 * @module components/geofence/radius-control-card
 */
import Slider from '@react-native-community/slider';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import {
  GEOFENCE_RADIUS_STEP_METERS,
  MAX_GEOFENCE_RADIUS_METERS,
  MIN_GEOFENCE_RADIUS_METERS,
} from '@constants/geofence';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Props for the radius control card.
 */
type RadiusControlCardProps = {
  compact?: boolean;
  hasGeofence: boolean;
  onClearPress: () => void;
  onSetPress: () => void;
  radiusMeters: number;
  setRadiusMeters: (nextRadiusMeters: number) => void;
};

/**
 * Radius control panel shown below the map.
 */
const RadiusControlCard = ({
  compact = false,
  hasGeofence,
  onClearPress,
  onSetPress,
  radiusMeters,
  setRadiusMeters,
}: RadiusControlCardProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const spacingScale = getResponsiveSpacingScale(width, height);

  return (
    <View
      style={[
        styles.content,
        {
          gap: getScaledValue(spacing.md, spacingScale),
          padding: compact
            ? getScaledValue(spacing.md, spacingScale)
            : getScaledValue(spacing.lg, spacingScale),
        },
      ]}>
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.copy}>
          <AppText variant="headline">Adjust Radius</AppText>
        </View>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primarySoft,
            },
          ]}>
          <AppText variant="label" style={{ color: colors.primary }}>
            {radiusMeters}m
          </AppText>
        </View>
      </View>

      <Slider
        maximumTrackTintColor={colors.border}
        maximumValue={MAX_GEOFENCE_RADIUS_METERS}
        minimumTrackTintColor={colors.primary}
        minimumValue={MIN_GEOFENCE_RADIUS_METERS}
        onValueChange={setRadiusMeters}
        step={GEOFENCE_RADIUS_STEP_METERS}
        style={styles.slider}
        thumbTintColor={colors.primary}
        value={radiusMeters}
      />

      <View style={styles.sliderLabels}>
        <AppText tone="muted">{MIN_GEOFENCE_RADIUS_METERS}m</AppText>
        <AppText tone="muted">{MAX_GEOFENCE_RADIUS_METERS}m</AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          title="Set geofence"
          disabled={!hasGeofence}
          onPress={onSetPress}
          style={styles.actionButton}
        />
        <AppButton
          title="Clear geofence"
          disabled={!hasGeofence}
          onPress={onClearPress}
          style={styles.actionButton}
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  content: {
    width: '100%',
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  headerCompact: {
    flexDirection: 'column',
  },
  slider: {
    height: 32,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export { RadiusControlCard };
