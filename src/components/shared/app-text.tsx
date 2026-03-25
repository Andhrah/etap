/**
 * @fileoverview Theme-aware typography primitive for consistent text rendering.
 * @module components/shared/app-text
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle, useWindowDimensions } from 'react-native';

import { getResponsiveTypographyScale, getScaledValue, typography } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Available typography variants following the design system scale.
 * - `eyebrow`: Small uppercase label for categorization
 * - `title`: Large display text for screen headers
 * - `headline`: Medium emphasis text for section headers
 * - `body`: Default readable text for content
 * - `label`: Small emphasis text for UI controls
 */
type AppTextVariant = 'eyebrow' | 'title' | 'headline' | 'body' | 'label';

/**
 * Color tone applied to text based on semantic importance.
 * - `default`: Primary text color for main content
 * - `muted`: Reduced emphasis for secondary information
 */
type AppTextTone = 'default' | 'muted';

/**
 * Props for the AppText component.
 * @property children - Text content to render
 * @property variant - Typography variant from the design system scale
 * @property tone - Semantic color tone for text emphasis
 * @property style - Additional styles to merge with base typography
 */
type AppTextProps = PropsWithChildren<{
  variant?: AppTextVariant;
  tone?: AppTextTone;
  style?: StyleProp<TextStyle>;
}>;

/**
 * Pre-computed styles for each typography variant.
 * Maps variant names to their corresponding TextStyle definitions.
 * @internal
 */
const variantStyles: Record<AppTextVariant, TextStyle> = {
  eyebrow: {
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  title: {
    fontSize: typography.title,
    lineHeight: 40,
    fontWeight: '700',
  },
  headline: {
    fontSize: typography.headline,
    lineHeight: 30,
    fontWeight: '700',
  },
  body: {
    fontSize: typography.body,
    lineHeight: 24,
    fontWeight: '400',
  },
  label: {
    fontSize: typography.label,
    lineHeight: 20,
    fontWeight: '600',
  },
};

/**
 * Theme-aware text primitive for consistent typography usage across the app.
 *
 * Applies semantic sizing from the typography scale and color roles from the
 * active theme. Use this component instead of raw `Text` to ensure visual
 * consistency and easier theme switching.
 *
 * @param props - Component props
 * @param props.children - Text content to render
 * @param props.variant - Typography variant (defaults to 'body')
 * @param props.tone - Color tone (defaults to 'default')
 * @param props.style - Additional styles to apply
 * @returns Themed Text component with applied typography
 *
 * @example
 * ```tsx
 * <AppText variant="headline">Welcome</AppText>
 * <AppText variant="body" tone="muted">Secondary info</AppText>
 * ```
 */
const AppText = ({
  children,
  variant = 'body',
  tone = 'default',
  style,
}: AppTextProps) => {
  const { colors } = useAppTheme();
  const { height, width } = useWindowDimensions();
  const typographyScale = getResponsiveTypographyScale(width, height);
  const variantStyle = variantStyles[variant];

  return (
    <Text
      style={[
        styles.base,
        variantStyle,
        {
          fontSize:
            variantStyle.fontSize == null
              ? undefined
              : getScaledValue(variantStyle.fontSize, typographyScale),
          letterSpacing:
            variantStyle.letterSpacing == null
              ? undefined
              : Number((variantStyle.letterSpacing * typographyScale).toFixed(2)),
          lineHeight:
            variantStyle.lineHeight == null
              ? undefined
              : getScaledValue(variantStyle.lineHeight, typographyScale),
        },
        { color: tone === 'muted' ? colors.textMuted : colors.text },
        style,
      ]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    margin: 0,
    padding: 0,
  },
});

export { AppText };
