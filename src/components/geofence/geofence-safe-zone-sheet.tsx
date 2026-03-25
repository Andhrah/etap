/**
 * @fileoverview Inside-boundary safe-zone summary sheet.
 * @module components/geofence/geofence-safe-zone-sheet
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

type GeofenceSafeZoneSheetProps = {
  compact?: boolean;
  entryTime: number | null;
  onResetPress: () => void;
  onViewLogPress: () => void;
};

const formatEntryTime = (entryTime: number | null) => {
  if (entryTime == null) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(entryTime);
};

const formatDuration = (entryTime: number | null, currentTime: number) => {
  if (entryTime == null) {
    return '00h 00m';
  }

  const elapsedMinutes = Math.max(0, Math.floor((currentTime - entryTime) / 60_000));
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

const GeofenceSafeZoneSheet = ({
  compact = false,
  entryTime,
  onResetPress,
  onViewLogPress,
}: GeofenceSafeZoneSheetProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const spacingScale = getResponsiveSpacingScale(width, height);
  const outerPadding = compact
    ? getScaledValue(spacing.md, spacingScale)
    : getScaledValue(spacing.lg, spacingScale);
  const metricCardPaddingVertical = getScaledValue(compact ? spacing.xs : spacing.sm, spacingScale);

  useEffect(() => {
    setCurrentTime(Date.now());

    if (entryTime == null) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [entryTime]);

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
      <View
        style={[
          styles.headerRow,
          {
            gap: getScaledValue(spacing.md, spacingScale),
          },
        ]}>
        <AppText
          variant="title"
          style={[styles.title, styles.titleText, { color: colors.primary, fontWeight: '700' }]}>
          Zone Status
        </AppText>
        <View
          style={[
            styles.statusChip,
            {
              backgroundColor: '#E7F8EE',
              gap: getScaledValue(spacing.sm, spacingScale),
              paddingHorizontal: getScaledValue(spacing.md, spacingScale),
              paddingVertical: getScaledValue(spacing.sm, spacingScale),
            },
          ]}>
          <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
          <AppText
            variant="label"
            style={[styles.statusText, { color: colors.success, letterSpacing: 0.4 }]}>
            Inside boundary
          </AppText>
        </View>
      </View>

      <AppText style={[styles.bodyCopy, { color: colors.textSecondary }]}>
        You are currently within the safe zone. Your location is being monitored according to your
        active schedule.
      </AppText>

      <View
        style={[
          styles.metricsRow,
          {
            gap: getScaledValue(spacing.md, spacingScale),
          },
        ]}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surfaceAlt,
              paddingHorizontal: outerPadding,
              paddingVertical: metricCardPaddingVertical,
            },
          ]}>
          <AppText variant="label" style={[styles.metricLabel, { color: colors.textMuted }]}>
            ENTRY TIME
          </AppText>
          <AppText
            variant="title"
            style={[styles.metricValue, { color: colors.primary, fontWeight: '700' }]}>
            {formatEntryTime(entryTime)}
          </AppText>
        </View>

        <View
          style={[
            styles.metricCard,
            styles.metricCardPositive,
            {
              backgroundColor: '#E7F8EE',
              paddingHorizontal: outerPadding,
              paddingVertical: metricCardPaddingVertical,
            },
          ]}>
          <AppText variant="label" style={[styles.metricLabel, { color: colors.success }]}>
            DURATION
          </AppText>
          <AppText
            variant="title"
            style={[styles.metricValue, { color: colors.success, fontWeight: '700' }]}>
            {formatDuration(entryTime, currentTime)}
          </AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton
          onPress={onViewLogPress}
          size={compact ? 'sm' : 'md'}
          style={styles.actionButton}
          title="View Log"
          variant="secondary"
        />
        <AppButton
          onPress={onResetPress}
          size={compact ? 'sm' : 'md'}
          style={styles.actionButton}
          title="Reset"
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bodyCopy: {
    fontSize: 13,
    lineHeight: 20,
  },
  content: {
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  metricCard: {
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.sm,
    minHeight: 52,
    justifyContent: 'center',
  },
  metricCardPositive: {
    borderWidth: 1,
    borderColor: 'rgba(31, 157, 85, 0.08)',
  },
  metricLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
  },
  statusChip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
  },
  statusDot: {
    borderRadius: radius.pill,
    height: 12,
    width: 12,
  },
  title: {
    flexShrink: 1,
  },
  titleText: {
    fontSize: 22,
    lineHeight: 26,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export { GeofenceSafeZoneSheet };
export type { GeofenceSafeZoneSheetProps };
