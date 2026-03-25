/**
 * @fileoverview Geofence monitoring status card.
 * @module components/geofence/geofence-status-card
 */
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';
import type { GeofenceCoordinate, GeofenceStatus } from '@constants/geofence';
import type { LocationPermissionState } from '@hooks/use-live-location';

/**
 * Props for the geofence status card.
 */
type GeofenceStatusCardProps = {
  compact?: boolean;
  currentLocation: GeofenceCoordinate | null;
  distanceMeters: number | null;
  errorMessage: string | null;
  geofenceCenter: GeofenceCoordinate | null;
  permissionStatus: LocationPermissionState;
  radiusMeters: number;
  status: GeofenceStatus;
};

/**
 * Formats the current geofence status for UI display.
 *
 * @param status - Current geofence status
 * @param hasGeofence - Whether a geofence is currently active
 * @returns User-facing status label
 */
const getStatusLabel = (status: GeofenceStatus, hasGeofence: boolean) => {
  if (!hasGeofence) {
    return 'Not Set';
  }

  if (status === 'inside') {
    return 'Inside boundary';
  }

  if (status === 'outside') {
    return 'Outside boundary';
  }

  return 'Waiting for location';
};

/**
 * Displays the current permission, location, and geofence state in a compact card.
 */
const GeofenceStatusCard = ({
  compact = false,
  errorMessage,
  geofenceCenter,
  permissionStatus,
  status,
}: GeofenceStatusCardProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const spacingScale = getResponsiveSpacingScale(width, height);

  const hasGeofence = geofenceCenter != null;
  const geofenceLabel = getStatusLabel(status, hasGeofence);
  const permissionLabel =
    permissionStatus === 'checking'
      ? 'Checking'
      : permissionStatus === 'granted'
        ? 'Granted'
        : permissionStatus === 'unsupported'
          ? 'Unsupported'
          : 'Denied';
  const geofenceColors =
    !hasGeofence || status === 'unknown'
      ? {
          indicatorColor: '#FF9B45',
          textColor: colors.primary,
        }
      : status === 'inside'
        ? {
            indicatorColor: colors.success,
            textColor: colors.success,
          }
        : {
            indicatorColor: colors.warning,
            textColor: colors.warning,
          };
  const permissionColors =
    permissionStatus === 'granted'
      ? {
          indicatorColor: '#21C45D',
          textColor: colors.primary,
        }
      : permissionStatus === 'checking'
        ? {
            indicatorColor: colors.info,
            textColor: colors.primary,
          }
        : {
            indicatorColor: colors.danger,
            textColor: colors.primary,
          };

  return (
    <View
      style={[
        styles.card,
        {
          gap: getScaledValue(spacing.md, spacingScale),
          padding: compact
            ? getScaledValue(spacing.md, spacingScale)
            : getScaledValue(spacing.lg, spacingScale),
        },
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: '#1E1630',
        },
      ]}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryBlock}>
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.1 }}>
            PERMISSION
          </AppText>
          <View style={styles.statusLine}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: permissionColors.indicatorColor,
                },
              ]}
            />
            <AppText variant="headline" style={{ color: permissionColors.textColor }}>
              {permissionLabel}
            </AppText>
          </View>
        </View>

        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryBlock}>
          <AppText variant="label" style={{ color: colors.textSecondary, letterSpacing: 1.1 }}>
            GEOFENCE
          </AppText>
          <View style={styles.statusLine}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: geofenceColors.indicatorColor,
                },
              ]}
            />
            <AppText variant="headline" style={{ color: geofenceColors.textColor }}>
              {geofenceLabel}
            </AppText>
          </View>
        </View>
      </View>

      {errorMessage != null && (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: colors.dangerSoft,
            },
          ]}>
          <AppText variant="label" style={{ color: colors.danger }}>
            {errorMessage}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardCompact: {
  },
  errorBox: {
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  statusDot: {
    borderRadius: radius.pill,
    height: 14,
    width: 14,
  },
  statusLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryBlock: {
    flex: 1,
    gap: spacing.sm,
  },
  summaryDivider: {
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    width: 1,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export { GeofenceStatusCard };
