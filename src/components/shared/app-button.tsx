/**
 * @fileoverview Theme-aware button primitive for consistent interactive elements.
 * @module components/shared/app-button
 */
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

import { AppText } from './app-text';

/**
 * Available button variants for different use cases.
 * - `primary`: Main call-to-action with brand primary color
 * - `secondary`: Secondary actions with softer styling
 * - `outline`: Bordered button with transparent background
 * - `ghost`: Text-only button for tertiary actions
 */
type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * Available button sizes following the design system scale.
 * - `sm`: Compact size for inline actions
 * - `md`: Default size for standard buttons
 * - `lg`: Large size for prominent actions
 */
type AppButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the AppButton component.
 * @property title - Button label text
 * @property onPress - Callback fired when button is pressed
 * @property variant - Visual style variant
 * @property size - Button size from design scale
 * @property disabled - Whether the button is disabled
 * @property loading - Whether to show loading indicator
 * @property style - Additional styles to merge with base button
 */
type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Theme-aware button primitive for consistent interactive styling across the app.
 *
 * Supports multiple variants for different action hierarchies and includes
 * built-in loading and disabled states.
 *
 * @param props - Component props
 * @param props.title - Button label text
 * @param props.onPress - Press handler callback
 * @param props.variant - Visual variant (defaults to 'primary')
 * @param props.size - Size variant (defaults to 'md')
 * @param props.disabled - Disable interactions
 * @param props.loading - Show loading spinner
 * @param props.style - Additional styles
 * @returns Themed Pressable button component
 *
 * @example
 * ```tsx
 * <AppButton title="Submit" onPress={handleSubmit} />
 * <AppButton title="Cancel" variant="outline" onPress={handleCancel} />
 * <AppButton title="Saving..." loading disabled />
 * ```
 */
const AppButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) => {
  const { colors } = useAppTheme();

  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    secondary: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primaryBorder,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  };

  const textColors = {
    primary: colors.surface,
    secondary: colors.primary,
    outline: colors.text,
    ghost: colors.primary,
  };

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    md: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    lg: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <AppText variant="label" style={{ color: textColors[variant] }}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { AppButton };
export type { AppButtonProps, AppButtonSize, AppButtonVariant };

