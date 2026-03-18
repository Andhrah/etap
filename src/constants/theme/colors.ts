/**
 * @fileoverview Design system color definitions and semantic theme tokens.
 * @module constants/theme/colors
 */

/**
 * Raw ETAP brand and semantic support colors.
 *
 * Primitive color values live here so semantic theme tokens can be composed
 * without scattering hex values across feature code.
 *
 * @remarks
 * Colors are organized by purpose:
 * - Brand colors (primary purple, accent pink)
 * - Surface colors (backgrounds, cards)
 * - Text colors (primary, secondary, muted)
 * - Feedback colors (success, warning, error)
 * - Map-specific colors
 */
const palette = {
  brandPrimary: '#250D4B',
  brandPrimarySoft: '#F4F0FA',
  brandPrimaryBorder: '#D9CDEA',
  brandAccent: '#D50C4E',
  brandAccentSoft: '#FDEAF1',
  backgroundLight: '#F8F7FB',
  white: '#FFFFFF',
  surfaceAltLight: '#F3F1F7',
  borderLight: '#E6E0EE',
  textPrimaryLight: '#1E1630',
  textSecondaryLight: '#6E6482',
  textMutedLight: '#9389A6',
  success: '#1F9D55',
  successSoft: '#EAF8F0',
  warning: '#C97A10',
  warningSoft: '#FFF4E5',
  error: '#C0392B',
  errorSoft: '#FDEDEC',
  backgroundDark: '#140A28',
  surfaceDark: '#1C1034',
  surfaceAltDark: '#251342',
  borderDark: '#3A255E',
  textPrimaryDark: '#F7F4FC',
  textSecondaryDark: '#C5B6E0',
  textMutedDark: '#9E91BC',
  brandPrimaryDark: '#B69ADD',
  brandPrimarySoftDark: '#2B184D',
  brandAccentDark: '#FF5A8E',
  brandAccentSoftDark: '#3F1326',
  successDark: '#57C785',
  successSoftDark: '#143122',
  warningDark: '#F0B14A',
  warningSoftDark: '#38280D',
  errorDark: '#F07167',
  errorSoftDark: '#3C1718',
  mapUserLocation: '#4A78FF',
} as const;

/**
 * Semantic color roles consumed by UI components and map states.
 *
 * Light mode is the default brand direction: clean, neutral, purple-led, and
 * pink-accented. Dark mode preserves the same hierarchy with adjusted contrast.
 */
const semanticColors = {
  light: {
    background: palette.backgroundLight,
    surface: palette.white,
    surfaceAlt: palette.surfaceAltLight,
    text: palette.textPrimaryLight,
    textSecondary: palette.textSecondaryLight,
    textMuted: palette.textMutedLight,
    border: palette.borderLight,
    primary: palette.brandPrimary,
    primarySoft: palette.brandPrimarySoft,
    primaryBorder: palette.brandPrimaryBorder,
    accent: palette.brandAccent,
    accentSoft: palette.brandAccentSoft,
    success: palette.success,
    successSoft: palette.successSoft,
    warning: palette.warning,
    warningSoft: palette.warningSoft,
    danger: palette.error,
    dangerSoft: palette.errorSoft,
    mapGeofenceStroke: palette.brandPrimary,
    mapGeofenceFill: 'rgba(37, 13, 75, 0.12)',
    mapCenterMarker: palette.brandAccent,
    mapUserLocation: palette.mapUserLocation,
  },
  dark: {
    background: palette.backgroundDark,
    surface: palette.surfaceDark,
    surfaceAlt: palette.surfaceAltDark,
    text: palette.textPrimaryDark,
    textSecondary: palette.textSecondaryDark,
    textMuted: palette.textMutedDark,
    border: palette.borderDark,
    primary: palette.brandPrimaryDark,
    primarySoft: palette.brandPrimarySoftDark,
    primaryBorder: palette.borderDark,
    accent: palette.brandAccentDark,
    accentSoft: palette.brandAccentSoftDark,
    success: palette.successDark,
    successSoft: palette.successSoftDark,
    warning: palette.warningDark,
    warningSoft: palette.warningSoftDark,
    danger: palette.errorDark,
    dangerSoft: palette.errorSoftDark,
    mapGeofenceStroke: palette.brandPrimaryDark,
    mapGeofenceFill: 'rgba(182, 154, 221, 0.16)',
    mapCenterMarker: palette.brandAccentDark,
    mapUserLocation: '#7EA2FF',
  },
} as const;

/**
 * Named theme variants supported by the application.
 * Currently supports 'light' and 'dark' color schemes.
 */
type AppColorScheme = keyof typeof semanticColors;

/**
 * Semantic color tokens for a specific theme.
 * Use this type when components need to accept theme colors as props.
 */
type SemanticColors = (typeof semanticColors)[AppColorScheme];

export { palette, semanticColors };
export type { AppColorScheme, SemanticColors };

