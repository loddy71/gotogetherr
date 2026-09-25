/**
 * GoTogether design tokens.
 *
 * Paper and ink, softened: warm stock, ink type, a serif for display, one
 * stamp-red accent used sparingly, and rounded surfaces that move with
 * springs rather than snapping. No gradients, no emoji as iconography.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const Colors = {
  light: {
    background: '#F3F0E8',
    /** Cards and sheets. */
    backgroundElement: '#FCFAF6',
    /** Pressed rows, sunken fields, skeletons. */
    backgroundSelected: '#E9E4D8',
    card: '#FCFAF6',
    border: '#E0D9CB',
    borderStrong: '#C4BBA8',
    text: '#1C1916',
    textSecondary: '#766D60',
    tint: '#A33F27',
    /** Map land dots. */
    land: '#D9D2C2',
    scrim: 'rgba(28, 25, 22, 0.38)',
  },
  dark: {
    background: '#12100E',
    backgroundElement: '#1C1915',
    backgroundSelected: '#29251F',
    card: '#1C1915',
    border: '#2F2A24',
    borderStrong: '#484137',
    text: '#F1ECE2',
    textSecondary: '#9C9386',
    tint: '#DB7254',
    land: '#39332B',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = (typeof Colors)['light'] | (typeof Colors)['dark'];

export const DangerColor = '#B4432B';
export const SuccessColor = '#3F7050';

/** Traveler ink colors — muted travel-stamp set, ordered for mutual contrast. */
export const TravelerColors = [
  '#B0513A',
  '#35635A',
  '#C0913F',
  '#4A5F86',
  '#86597F',
  '#5E6E36',
  '#9A6C45',
  '#4F6A74',
] as const;

export function travelerColor(index: number): string {
  return TravelerColors[index % TravelerColors.length];
}

/** Cost components in the per-person breakdown. */
export const CostColors = {
  flight: '#35635A',
  hotel: '#B0513A',
  daily: '#C0913F',
} as const;

export const DisplayFont = Platform.select({
  ios: 'InstrumentSerif_400Regular',
  android: 'InstrumentSerif_400Regular',
  default: "InstrumentSerif_400Regular, 'Iowan Old Style', Georgia, serif",
});

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
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

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const Hairline = Platform.select({ web: 1, default: 0.5 }) ?? 1;

/**
 * Motion. Springs for anything the finger moves or that changes place;
 * timing curves for fades and value tweens. One set, used everywhere, so
 * the whole app moves with the same weight.
 */
export const Motion = {
  /** Press feedback, toggles. */
  snappy: { damping: 20, stiffness: 320, mass: 0.6 },
  /** Things changing position (thumbs, sheets, reordering). */
  glide: { damping: 24, stiffness: 190, mass: 0.9 },
  duration: { fast: 160, base: 280, slow: 520 },
  ease: Easing.bezier(0.2, 0.8, 0.2, 1),
  /** Delay between siblings entering in sequence. */
  stagger: 45,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 640;
