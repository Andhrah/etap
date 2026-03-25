/**
 * @fileoverview Settings screen for app preferences and support actions.
 * @module app/(tabs)/settings
 */
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@components/shared/app-text';
import { useAppThemeMode } from '@providers/app-providers';
import { getResponsiveSpacingScale, getScaledValue, radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

type MapStyleOption = 'Standard' | 'Satellite' | 'Hybrid';
type UnitOption = 'Meters' | 'Feet';

type SectionTitleProps = {
  title: string;
};

type SettingsCardProps = {
  children: ReactNode;
};

type SettingsRowProps = {
  children: ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
};

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  isFirst?: boolean;
  isLast?: boolean;
  label: string;
  onValueChange: (nextValue: boolean) => void;
  value: boolean;
};

type DetailRowProps = {
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  isFirst?: boolean;
  isLast?: boolean;
  label: string;
  onPress: () => void;
  showExternal?: boolean;
};

/**
 * Uppercase section label used across settings groups.
 */
const SectionTitle = ({ title }: SectionTitleProps) => {
  const { colors } = useAppTheme();

  return (
    <AppText
      variant="label"
      style={{ color: colors.textSecondary, fontSize: 12, letterSpacing: 1.1, lineHeight: 16 }}>
      {title}
    </AppText>
  );
};

/**
 * Card container for grouped settings rows.
 */
const SettingsCard = ({ children }: SettingsCardProps) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: '#1E1630',
        },
      ]}>
      {children}
    </View>
  );
};

/**
 * Interactive row wrapper with shared spacing and divider behavior.
 */
const SettingsRow = ({
  children,
  isFirst = false,
  isLast = false,
  onPress,
}: SettingsRowProps) => {
  const { colors } = useAppTheme();
  const rowStyle = [
    styles.row,
    isFirst ? styles.rowFirst : null,
    isLast ? styles.rowLast : null,
    {
      borderBottomColor: colors.border,
    },
  ];

  const content = (
    <View style={rowStyle}>
      <View style={styles.rowContent}>
        {children}
      </View>
    </View>
  );

  if (onPress == null) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [rowStyle, pressed && styles.pressed]}>
      <View style={styles.rowContent}>
        {children}
      </View>
    </Pressable>
  );
};

/**
 * Toggle row used for notification and map switches.
 */
const ToggleRow = ({
  icon,
  isFirst = false,
  isLast = false,
  label,
  onValueChange,
  value,
}: ToggleRowProps) => {
  const { colors } = useAppTheme();

  return (
    <SettingsRow isFirst={isFirst} isLast={isLast} onPress={() => onValueChange(!value)}>
      <View style={styles.rowLeft}>
        <Ionicons color={colors.primary} name={icon} size={22} />
        <AppText style={styles.rowLabel}>{label}</AppText>
      </View>
      <Switch
        ios_backgroundColor={colors.border}
        onValueChange={onValueChange}
        style={styles.switch}
        thumbColor={colors.surface}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        value={value}
      />
    </SettingsRow>
  );
};

/**
 * Pressable row with a trailing label and chevron or external-link icon.
 */
const DetailRow = ({
  detail,
  icon,
  isFirst = false,
  isLast = false,
  label,
  onPress,
  showExternal = false,
}: DetailRowProps) => {
  const { colors } = useAppTheme();

  return (
    <SettingsRow isFirst={isFirst} isLast={isLast} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons color={colors.primary} name={icon} size={22} />
        <AppText style={styles.rowLabel}>{label}</AppText>
      </View>
      <View style={styles.rowRight}>
        <AppText style={styles.rowDetail} tone="muted">
          {detail}
        </AppText>
        <Ionicons
          color={colors.textMuted}
          name={showExternal ? 'open-outline' : 'chevron-forward'}
          size={showExternal ? 20 : 18}
        />
      </View>
    </SettingsRow>
  );
};

/**
 * Settings tab for notifications, map preferences, units, account, and support.
 */
const SettingsScreen = () => {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { isDarkMode, setThemeMode } = useAppThemeMode();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const spacingScale = getResponsiveSpacingScale(width, height);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const [entryAlertsEnabled, setEntryAlertsEnabled] = useState(true);
  const [exitAlertsEnabled, setExitAlertsEnabled] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyleOption>('Standard');
  const [units, setUnits] = useState<UnitOption>('Meters');
  const contentPadding = getScaledValue(14, spacingScale);
  const avatarSize = getScaledValue(40, spacingScale);

  const cycleMapStyle = () => {
    setMapStyle((currentStyle) => {
      if (currentStyle === 'Standard') {
        return 'Satellite';
      }

      if (currentStyle === 'Satellite') {
        return 'Hybrid';
      }

      return 'Standard';
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingBottom: getScaledValue(6, spacingScale),
            paddingLeft: contentPadding,
            paddingRight: contentPadding,
            paddingTop: insets.top + getScaledValue(spacing.sm, spacingScale),
          },
        ]}>
        <Pressable
          accessibilityLabel="Go back to map"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons color={colors.primary} name="arrow-back" size={26} />
        </Pressable>
        <AppText style={styles.headerTitle} variant="headline">
          Settings
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + 120,
            paddingHorizontal: contentPadding,
            paddingTop: getScaledValue(spacing.md, spacingScale),
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionTitle title="NOTIFICATIONS" />
          <SettingsCard>
            <ToggleRow
              icon="log-in-outline"
              isFirst
              label="Entry alerts"
              onValueChange={setEntryAlertsEnabled}
              value={entryAlertsEnabled}
            />
            <ToggleRow
              icon="log-out-outline"
              isLast
              label="Exit alerts"
              onValueChange={setExitAlertsEnabled}
              value={exitAlertsEnabled}
            />
          </SettingsCard>
        </View>

        <View style={styles.section}>
          <SectionTitle title="MAP SETTINGS" />
          <SettingsCard>
            <DetailRow
              detail={mapStyle}
              icon="map-outline"
              isFirst
              label="Map style"
              onPress={cycleMapStyle}
            />
            <ToggleRow
              icon="locate-outline"
              isLast
              label="Show user location"
              onValueChange={setShowUserLocation}
              value={showUserLocation}
            />
          </SettingsCard>
        </View>

        <View style={styles.section}>
          <SectionTitle title="APPEARANCE" />
          <SettingsCard>
            <ToggleRow
              icon={isDarkMode ? 'moon-outline' : 'sunny-outline'}
              isFirst
              isLast
              label="Dark mode"
              onValueChange={(nextValue) => setThemeMode(nextValue ? 'dark' : 'light')}
              value={isDarkMode}
            />
          </SettingsCard>
        </View>

        <View style={styles.section}>
          <SectionTitle title="UNITS" />
          <View
            style={[
              styles.segmentedControl,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}>
            {(['Meters', 'Feet'] as UnitOption[]).map((option) => {
              const isSelected = units === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => setUnits(option)}
                  style={({ pressed }) => [
                    styles.segmentButton,
                    {
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    },
                    pressed && !isSelected && styles.pressed,
                  ]}>
                  <AppText
                    variant="headline"
                    style={[
                      styles.segmentLabel,
                      {
                        color: isSelected ? colors.surface : colors.textSecondary,
                      },
                    ]}>
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="ACCOUNT" />
          <SettingsCard>
            <SettingsRow
              isFirst
              onPress={() => Alert.alert('Account', 'Profile details are not connected yet.')}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: colors.surfaceAlt,
                      height: avatarSize,
                      width: avatarSize,
                    },
                  ]}>
                  <Ionicons color={colors.primary} name="person-circle-outline" size={avatarSize - 6} />
                </View>
                <View style={styles.accountCopy}>
                  <AppText variant="headline" style={styles.accountName}>
                    Alex Rivera
                  </AppText>
                  <AppText tone="muted">alex.rivera@geotrack.com</AppText>
                </View>
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={22} />
            </SettingsRow>
            <SettingsRow
              isLast
              onPress={() => Alert.alert('Log out', 'Log out flow is not connected yet.')}>
              <View style={styles.rowLeft}>
                <Ionicons color="#EA1D20" name="log-out-outline" size={22} />
                <AppText style={styles.logoutLabel}>Log out</AppText>
              </View>
            </SettingsRow>
          </SettingsCard>
        </View>

        <View style={styles.section}>
          <SectionTitle title="SUPPORT" />
          <SettingsCard>
            <SettingsRow
              isFirst
              onPress={() => Alert.alert('Help Center', 'Support links are not connected yet.')}>
              <View style={styles.rowLeft}>
                <Ionicons color={colors.primary} name="help-circle" size={22} />
                <AppText style={styles.rowLabel}>Help Center</AppText>
              </View>
              <Ionicons color={colors.textMuted} name="open-outline" size={20} />
            </SettingsRow>
            <DetailRow
              detail={`v${version}`}
              icon="information-circle"
              isLast
              label="About"
              onPress={() => Alert.alert('About', `ETAP version ${version}`)}
            />
          </SettingsCard>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  accountCopy: {
    gap: spacing.xs,
  },
  accountName: {
    fontSize: 16,
    lineHeight: 22,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerSpacer: {
    height: 32,
    width: 32,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  logoutLabel: {
    color: '#EA1D20',
    fontSize: 15,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    borderBottomWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 12,
  },
  rowContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  rowDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowFirst: {
    paddingTop: 2,
  },
  rowLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.sm,
  },
  rowRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  screen: {
    flex: 1,
  },
  section: {
    gap: spacing.md,
  },
  segmentedControl: {
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  segmentLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  switch: {
    transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }],
  },
});

export default SettingsScreen;
