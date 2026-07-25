/**
 * GoTogether design tokens.
 *
 * The look is a travel guidebook, not a dashboard: warm paper stock, ink
 * text, hairline rules instead of drop shadows, one stamp-red accent used
 * sparingly, and a high-contrast serif for display type. No gradients.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Page stock. */
    background: '#F2EFE7',
    /** Raised paper (panels, pickers). */
    backgroundElement: '#FBF9F4',
    backgroundSelected: '#E8E3D7',
    card: '#FBF9F4',
    /** Hairline rules. */
    border: '#D8D2C4',
    /** Heavier rules under section heads. */
    borderStrong: '#B9B1A0',
    text: '#1A1714',
    textSecondary: '#736A5C',
    /** Stamp red — rank 1, selected state, links. Used sparingly. */
    tint: '#A03D26',
  },
  dark: {
    background: '#141210',
    backgroundElement: '#1D1A16',
    backgroundSelected: '#2A2621',
    card: '#1D1A16',
    border: '#332E27',
    borderStrong: '#4A433A',
    text: '#F0EBE1',
    textSecondary: '#9A9184',
    tint: '#D2694C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const DangerColor = '#A03D26';
export const SuccessColor = '#3F6B4A';

/**
 * Traveler ink colors — a muted travel-stamp set, ordered for contrast
 * against each other rather than for brightness.
 */
export const TravelerColors = [
  '#8C3B27',
  '#2E4A45',
  '#B5813A',
  '#3D4E6B',
  '#6E4B6B',
  '#4E5B31',
  '#8A6242',
  '#455A64',
] as const;

export function travelerColor(index: number): string {
  return TravelerColors[index % TravelerColors.length];
}

/** Cost components in the per-person breakdown. */
export const CostColors = {
  flight: '#2E4A45',
  hotel: '#8C3B27',
  daily: '#B5813A',
} as const;

/** Display serif (bundled) with a graceful system fallback. */
export const DisplayFont = Platform.select({
  ios: 'InstrumentSerif_400Regular',
  android: 'InstrumentSerif_400Regular',
  default: "InstrumentSerif_400Regular, 'Iowan Old Style', Georgia, serif",
});

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Print-like corners: almost square. */
export const Radius = {
  sm: 2,
  md: 3,
  lg: 4,
  pill: 999,
} as const;

export const Hairline = Platform.select({ web: 1, default: 0.5 }) ?? 1;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 620;
