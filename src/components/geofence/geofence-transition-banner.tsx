/**
 * @fileoverview Dismissible geofence transition banner.
 * @module components/geofence/geofence-transition-banner
 */
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText } from '@components/shared/app-text';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

type GeofenceTransitionBannerProps = {
  message: string;
  onDismiss: () => void;
  tone?: 'enter' | 'exit';
};

const GeofenceTransitionBanner = ({
  message,
  onDismiss,
  tone = 'exit',
}: GeofenceTransitionBannerProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const spacingScale = getResponsiveSpacingScale(width, height);
  const iconTileSize = getScaledValue(52, spacingScale);
  const accentColor = tone === 'enter' ? colors.success : colors.accent;
  const iconName = tone === 'enter' ? 'information-circle-outline' : 'warning-outline';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.primary,
          gap: getScaledValue(spacing.md, spacingScale),
          paddingHorizontal: getScaledValue(spacing.md, spacingScale),
          paddingVertical: getScaledValue(spacing.md, spacingScale),
          shadowColor: '#1E1630',
        },
      ]}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: accentColor,
            height: iconTileSize,
            width: iconTileSize,
          },
        ]}>
        <Ionicons color={colors.surface} name={iconName} size={24} />
      </View>

      <AppText
        variant="headline"
        style={[styles.message, { color: colors.surface, fontWeight: '600' }]}>
        {message}
      </AppText>

      <Pressable accessibilityLabel="Dismiss transition banner" onPress={onDismiss}>
        <Ionicons color="rgba(255, 255, 255, 0.72)" name="close" size={26} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderRadius: radius.lg,
    flexDirection: 'row',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.16,
    shadowRadius: 28,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  message: {
    flex: 1,
  },
});

export { GeofenceTransitionBanner };
export type { GeofenceTransitionBannerProps };
