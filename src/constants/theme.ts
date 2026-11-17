/**
 * GoTogether design tokens: the boarding-pass world.
 *
 * Airport-grey ground, white pass stock, near-black ink. One signal orange is
 * reserved for the best match, selection and the primary path; each traveler
 * owns a saturated livery colour that bands their pass and their route. A
 * condensed bold grotesk sets IATA codes, city names and big figures; the
 * platform sans does everything else. Direction contract:
 * .impeccable/surfaces/, durable system: DESIGN.md.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { Easing } from 'react-native-reanimated';

export const Colors = {
  light: {
    /** Airport grey: the ground every pass sits on. */
    background: '#E7EAEE',
    /** Pass stock: cards and sheets. */
    backgroundElement: '#FFFFFF',
    /** Sunken fields, pressed rows, skeletons, neutral chips. */
    backgroundSelected: '#ECEEF1',
    card: '#FFFFFF',
    border: '#D5DAE0',
    borderStrong: '#AEB5BE',
    text: '#111418',
    /** ≥ 4.5:1 on background, card and backgroundSelected. */
    textSecondary: '#59616C',
    /** Signal orange: best match, selection, primary path. Fills and graphics only. */
    tint: '#FF5A1F',
    /** Text and icons placed on tint. */
    onTint: '#111418',
    /** Text on warningSurface (weather hazards). */
    warning: '#8A5A00',
    warningSurface: '#FFF1D6',
    danger: '#C42B1C',
    success: '#1F7A4D',
    /** Cost parts: a neutral ramp so traveler colours keep their meaning. */
    costFlight: '#111418',
    costRoom: '#8B939D',
    costDaily: '#C9CED5',
    /** Map land dots. */
    land: '#CBD1D8',
    /** Default chart columns (≥ 3:1 on the card surface). */
    chartMark: '#8B939D',
    scrim: 'rgba(17, 20, 24, 0.42)',
  },
  dark: {
    /** Night flight: the same system under cabin lights. */
    background: '#0E1116',
    backgroundElement: '#181C23',
    backgroundSelected: '#222833',
    card: '#181C23',
    border: '#2A303A',
    borderStrong: '#3D4552',
    text: '#EEF1F5',
    textSecondary: '#A3ABB7',
    tint: '#FF7A45',
    onTint: '#0E1116',
    warning: '#F2B54A',
    warningSurface: '#2E2410',
    danger: '#FF7B6B',
    success: '#5BD08F',
    costFlight: '#EEF1F5',
    costRoom: '#8B939D',
    costDaily: '#4A525E',
    land: '#2A313B',
    chartMark: '#6B7480',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = (typeof Colors)['light'] | (typeof Colors)['dark'];

/**
 * Traveler liveries: saturated, mutually distinct, none near the signal
 * orange. Each is ≥ 3:1 on pass stock in both themes.
 */
export const TravelerColors = [
  '#2F5BEA',
  '#0B7A6E',
  '#E5A000',
  '#7A4FD6',
  '#C53A8F',
  '#2F7D32',
  '#0570A8',
  '#8D6748',
] as const;

export function travelerColor(index: number): string {
  return TravelerColors[index % TravelerColors.length];
}

/** Ink or white, whichever reads better on a traveler's livery (amber needs ink). */
export function onTravelerColor(index: number): string {
  return travelerColor(index) === '#E5A000' ? '#111418' : '#FFFFFF';
}

/** Condensed grotesk for codes, names and big figures (weights are separate families on native). */
export const DisplayFont = Platform.select({
  web: "SofiaSansCondensed_700Bold, 'Arial Narrow', sans-serif",
  default: 'SofiaSansCondensed_700Bold',
});
export const CodeFont = Platform.select({
  web: "SofiaSansCondensed_800ExtraBold, 'Arial Narrow', sans-serif",
  default: 'SofiaSansCondensed_800ExtraBold',
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

/** Square-shouldered stock: passes and cards 12, controls 10, chips round. */
export const Radius = {
  sm: 6,
  md: 10,
  /** Cards, passes and sheets. */
  lg: 12,
  pill: 999,
} as const;

/** Minimum touch target (Apple HIG 44 pt; Material asks 48 dp, met with hit slop). */
export const TouchTarget = 44;

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

export const MaxContentWidth = 640;

/** From this window width, working screens use two columns instead of a stretched phone column. */
export const WideBreakpoint = 1024;
export const WideContentWidth = 1120;
