/**
 * @fileoverview Outside-boundary breach summary sheet.
 * @module components/geofence/geofence-breach-sheet
 */
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

type GeofenceBreachSheetProps = {
  boundaryDistanceMeters: number | null;
  compact?: boolean;
  lastInsideAt: number | null;
  movementLabel: string;
  onResetPress: () => void;
  onUpdatePress: () => void;
};

const formatBoundaryDistance = (distanceMeters: number | null) => {
  if (distanceMeters == null || distanceMeters <= 0) {
    return 'At boundary';
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km from boundary`;
  }

  return `${Math.round(distanceMeters)}m from boundary`;
};

const formatLastInsideLabel = (lastInsideAt: number | null, currentTime: number) => {
  if (lastInsideAt == null) {
    return 'Just now';
  }

  const elapsedMinutes = Math.max(0, Math.floor((currentTime - lastInsideAt) / 60_000));

  if (elapsedMinutes < 1) {
    return 'Just now';
  }

  if (elapsedMinutes === 1) {
    return '1 min ago';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} mins ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours === 1) {
    return '1 hour ago';
  }

  return `${elapsedHours} hours ago`;
};

const GeofenceBreachSheet = ({
  boundaryDistanceMeters,
  compact = false,
  lastInsideAt,
  movementLabel,
  onResetPress,
  onUpdatePress,
}: GeofenceBreachSheetProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const spacingScale = getResponsiveSpacingScale(width, height);
  const outerPadding = compact
    ? getScaledValue(spacing.md, spacingScale)
    : getScaledValue(spacing.lg, spacingScale);

  useEffect(() => {
    setCurrentTime(Date.now());

    if (lastInsideAt == null) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastInsideAt]);

  return (
    <View
      style={[
        styles.content,
        {
          gap: getScaledValue(spacing.lg, spacingScale),
          paddingBottom: getScaledValue(spacing.lg, spacingScale),
          paddingHorizontal: outerPadding,
        },
      ]}>
      <View style={styles.headerBlock}>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: '#FFF3E2',
              gap: getScaledValue(spacing.sm, spacingScale),
              paddingHorizontal: getScaledValue(spacing.md, spacingScale),
              paddingVertical: getScaledValue(spacing.sm, spacingScale),
            },
          ]}>
          <Ionicons color={colors.warning} name="warning" size={16} />
          <AppText
            variant="label"
            style={[styles.statusText, { color: colors.warning, letterSpacing: 0.6 }]}>
            OUTSIDE BOUNDARY
          </AppText>
        </View>

        <View
          style={[
            styles.copy,
            {
              gap: getScaledValue(spacing.sm, spacingScale),
            },
        ]}>
          <AppText
            variant="title"
            style={[styles.title, styles.titleText, { color: colors.primary, fontWeight: '700' }]}>
            Boundary Breach
          </AppText>
          <AppText style={[styles.subtitle, styles.bodyCopy, { color: colors.textSecondary }]}>
            Target has exited the designated safety perimeter.
          </AppText>
          <View style={styles.metricLine}>
            <AppText
              variant="headline"
              style={[styles.distanceLabel, styles.metricText, { color: colors.accent, fontWeight: '700' }]}>
              {formatBoundaryDistance(boundaryDistanceMeters)}
            </AppText>
            <AppText tone="muted" style={styles.metricSeparator}>
              •
            </AppText>
            <AppText
              variant="headline"
              style={[styles.movementLabel, styles.metricText, { color: colors.primary, fontWeight: '700' }]}>
              {movementLabel}
            </AppText>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: colors.surfaceAlt,
            gap: getScaledValue(spacing.md, spacingScale),
            padding: outerPadding,
          },
        ]}>
        <View style={styles.summaryBlock}>
          <AppText variant="label" style={[styles.summaryLabel, { color: colors.textMuted }]}>
            CURRENT ZONE
          </AppText>
          <AppText variant="headline" style={[styles.summaryValue, { color: colors.primary }]}>
            Unsecured Area
          </AppText>
        </View>

        <View style={styles.summaryBlock}>
          <AppText variant="label" style={[styles.summaryLabel, { color: colors.textMuted }]}>
            LAST INSIDE
          </AppText>
          <AppText variant="headline" style={[styles.summaryValue, { color: colors.primary }]}>
            {formatLastInsideLabel(lastInsideAt, currentTime)}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          onPress={onUpdatePress}
          size="md"
          style={styles.actionButton}
          title="Update"
          variant="outline"
        />
        <AppButton
          onPress={onResetPress}
          size="md"
          style={styles.actionButton}
          title="Reset"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bodyCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    width: '100%',
  },
  copy: {
    alignItems: 'center',
  },
  distanceLabel: {
    textAlign: 'center',
  },
  headerBlock: {
    alignItems: 'center',
  },
  metricLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metricSeparator: {
    marginHorizontal: spacing.xs,
  },
  metricText: {
    fontSize: 18,
    lineHeight: 24,
  },
  movementLabel: {
    textAlign: 'center',
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  summaryBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  summaryValue: {
    fontSize: 20,
    lineHeight: 24,
  },
  summaryCard: {
    borderRadius: radius.lg,
    flexDirection: 'row',
  },
  title: {
    textAlign: 'center',
  },
  titleText: {
    fontSize: 24,
    lineHeight: 28,
  },
});

export { GeofenceBreachSheet };
export type { GeofenceBreachSheetProps };
