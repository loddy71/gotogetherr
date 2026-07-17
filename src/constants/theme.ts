/**
 * GoTogether design tokens: color palette (light/dark), brand + per-vibe
 * gradients, typography and spacing.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#191A23',
    textSecondary: '#6D7280',
    background: '#F6F6F9',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEEDFB',
    card: '#FFFFFF',
    border: '#E7E7EF',
    tint: '#5B4DE0',
  },
  dark: {
    text: '#F4F4F8',
    textSecondary: '#9DA1AE',
    background: '#0C0D13',
    backgroundElement: '#171923',
    backgroundSelected: '#262A3D',
    card: '#171923',
    border: '#252838',
    tint: '#8B7DFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Brand gradient — buttons, hero accents, selected chips. */
export const BrandGradient = ['#5B4DE0', '#9333EA'] as const;
export const DangerColor = '#E5484D';
export const SuccessColor = '#22A06B';

/** Distinct colors for travelers in spread bars & breakdowns. */
export const TravelerColors = [
  '#5B4DE0',
  '#0EA5E9',
  '#F59E0B',
  '#EC4899',
  '#10B981',
  '#F97316',
  '#8B5CF6',
  '#14B8A6',
] as const;

export function travelerColor(index: number): string {
  return TravelerColors[index % TravelerColors.length];
}

/** Rank medal colors for the podium (#1–#3). */
export const MedalGradients: [string, string][] = [
  ['#F7C948', '#DE911D'], // gold
  ['#CBD2D9', '#9AA5B1'], // silver
  ['#D7A97C', '#B4743E'], // bronze
];

/** Each city vibe maps to a gradient so destination tiles feel distinct. */
const VibeGradients: Record<string, [string, string]> = {
  beach: ['#38BDF8', '#0284C7'],
  sun: ['#FBBF24', '#F97316'],
  nightlife: ['#A855F7', '#6D28D9'],
  food: ['#FB923C', '#EA580C'],
  museums: ['#818CF8', '#4F46E5'],
  history: ['#C084FC', '#7C3AED'],
  nature: ['#34D399', '#059669'],
  views: ['#22D3EE', '#0891B2'],
  music: ['#F472B6', '#DB2777'],
  romance: ['#FB7185', '#E11D48'],
  design: ['#94A3B8', '#475569'],
  luxury: ['#FCD34D', '#B45309'],
  shopping: ['#F9A8D4', '#BE185D'],
  wellness: ['#6EE7B7', '#047857'],
  mountains: ['#A5B4FC', '#4338CA'],
};

const FallbackGradients: [string, string][] = [
  ['#5B4DE0', '#9333EA'],
  ['#0EA5E9', '#2563EB'],
  ['#F59E0B', '#DC2626'],
  ['#10B981', '#0D9488'],
];

/** Gradient for a city tile, keyed off its first recognised vibe. */
export function cityGradient(vibes: string[], seed: string): [string, string] {
  for (const vibe of vibes) {
    const g = VibeGradients[vibe];
    if (g) return g;
  }
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return FallbackGradients[h % FallbackGradients.length];
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
