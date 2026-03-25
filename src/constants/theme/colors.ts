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
  backgroundDark: '#0E141B',
  surfaceDark: '#151D27',
  surfaceAltDark: '#1B2633',
  borderDark: '#2B394A',
  textPrimaryDark: '#F3F7FB',
  textSecondaryDark: '#B3C0CF',
  textMutedDark: '#8491A1',
  brandPrimaryDark: '#96A8F7',
  brandPrimarySoftDark: '#1E2A40',
  brandAccentDark: '#FF5A8E',
  brandAccentSoftDark: '#3B1825',
  successDark: '#57C785',
  successSoftDark: '#143122',
  warningDark: '#F0B14A',
  warningSoftDark: '#38280D',
  errorDark: '#F07167',
  errorSoftDark: '#3C1718',
  mapUserLocation: '#4A78FF',
  statusActive: '#22C55E',
  statusActiveDark: '#4ADE80',
  statusPending: '#F97316',
  statusPendingDark: '#FB923C',
  mapPlaceholder: '#B8D4E3',
  mapPlaceholderDark: '#334454',
  mapGradientTop: '#C9B896',
  mapGradientTopDark: '#46433E',
  mapGradientBottom: '#8BA89A',
  mapGradientBottomDark: '#344749',
  geofenceSafeStroke: '#22C55E',
  geofenceSafeStrokeDark: '#4ADE80',
  geofenceSafeFill: '#DCFCE7',
  geofenceSafeFillDark: '#14532D',
  geofenceBreachStroke: '#250D4B',
  geofenceBreachStrokeDark: '#96A8F7',
  geofenceSetupStroke: '#250D4B',
  geofenceSetupStrokeDark: '#96A8F7',
  geofenceSetupFill: '#E8E0F4',
  geofenceSetupFillDark: '#1E2A40',
  infoSoft: '#E8F4FD',
  infoSoftDark: '#1E3A5F',
  info: '#3B82F6',
  infoDark: '#60A5FA',
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
    statusActive: palette.statusActive,
    statusPending: palette.statusPending,
    mapPlaceholder: palette.mapPlaceholder,
    mapGradientTop: palette.mapGradientTop,
    mapGradientBottom: palette.mapGradientBottom,
    geofenceSafeStroke: palette.geofenceSafeStroke,
    geofenceSafeFill: palette.geofenceSafeFill,
    geofenceBreachStroke: palette.geofenceBreachStroke,
    geofenceSetupStroke: palette.geofenceSetupStroke,
    geofenceSetupFill: palette.geofenceSetupFill,
    info: palette.info,
    infoSoft: palette.infoSoft,
    overlayGlass: 'rgba(37, 13, 75, 0.36)',
    overlayGlassStrong: 'rgba(37, 13, 75, 0.46)',
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
    mapGeofenceFill: 'rgba(150, 168, 247, 0.18)',
    mapCenterMarker: palette.brandAccentDark,
    mapUserLocation: '#7EA2FF',
    statusActive: palette.statusActiveDark,
    statusPending: palette.statusPendingDark,
    mapPlaceholder: palette.mapPlaceholderDark,
    mapGradientTop: palette.mapGradientTopDark,
    mapGradientBottom: palette.mapGradientBottomDark,
    geofenceSafeStroke: palette.geofenceSafeStrokeDark,
    geofenceSafeFill: palette.geofenceSafeFillDark,
    geofenceBreachStroke: palette.geofenceBreachStrokeDark,
    geofenceSetupStroke: palette.geofenceSetupStrokeDark,
    geofenceSetupFill: palette.geofenceSetupFillDark,
    info: palette.infoDark,
    infoSoft: palette.infoSoftDark,
    overlayGlass: 'rgba(14, 20, 27, 0.62)',
    overlayGlassStrong: 'rgba(14, 20, 27, 0.74)',
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
