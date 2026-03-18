/**
 * @fileoverview Design system layout and typography tokens.
 * @module constants/theme/tokens
 */

/**
 * Shared layout spacing scale for the application.
 *
 * Based on a 4px base unit for consistent vertical rhythm.
 * Use these values instead of magic numbers for margins, padding, and gaps.
 *
 * @property xs - 4px - Tight spacing for compact elements
 * @property sm - 8px - Small spacing for related items
 * @property md - 16px - Medium spacing for standard gaps
 * @property lg - 24px - Large spacing for section separation
 * @property xl - 32px - Extra large for major divisions
 * @property xxl - 48px - Maximum spacing for hero areas
 */
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Shared border radius scale for surfaces and controls.
 *
 * @property sm - 8px - Subtle rounding for inputs and small cards
 * @property md - 16px - Standard rounding for cards and modals
 * @property lg - 24px - Pronounced rounding for large surfaces
 * @property pill - 999px - Fully rounded for chips and buttons
 */
const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/**
 * Shared typography scale for text primitives and screen composition.
 *
 * Font sizes follow a modular scale for visual hierarchy.
 * Use with the AppText component for consistent rendering.
 *
 * @property title - 32px - Page and modal titles
 * @property headline - 24px - Section headers
 * @property body - 16px - Default readable content
 * @property label - 14px - Form labels and small UI text
 * @property caption - 12px - Helper text and metadata
 */
const typography = {
  title: 32,
  headline: 24,
  body: 16,
  label: 14,
  caption: 12,
} as const;

export { radius, spacing, typography };

