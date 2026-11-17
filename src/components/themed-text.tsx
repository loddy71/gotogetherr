import { StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFont, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextType =
  | 'default'
  | 'defaultBold'
  | 'body'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'display'
  | 'title'
  | 'heading'
  | 'label'
  | 'price'
  | 'priceLarge'
  | 'numeral'
  | 'link'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: TextType;
  themeColor?: ThemeColor;
};

/** Display, title and heading text are headings for screen readers and web outline. */
const HEADING_TYPES: ReadonlySet<TextType> = new Set(['display', 'title', 'heading']);

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return (
    <Text
      role={HEADING_TYPES.has(type) ? 'heading' : undefined}
      style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]}
      {...rest}
    />
  );
}

export const textStyles = StyleSheet.create({
  display: { fontFamily: DisplayFont, fontSize: 44, lineHeight: 47, letterSpacing: -0.4 },
  title: { fontFamily: DisplayFont, fontSize: 34, lineHeight: 38, letterSpacing: -0.2 },
  heading: { fontFamily: DisplayFont, fontSize: 24, lineHeight: 28 },
  price: { fontFamily: DisplayFont, fontSize: 26, lineHeight: 29, fontVariant: ['tabular-nums'] },
  priceLarge: {
    fontFamily: DisplayFont,
    fontSize: 32,
    lineHeight: 35,
    fontVariant: ['tabular-nums'],
  },
  numeral: { fontFamily: DisplayFont, fontSize: 20, lineHeight: 22, fontVariant: ['tabular-nums'] },
  /** Field and group labels: sentence case, never a tracked-caps eyebrow over a heading. */
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  default: { fontSize: 15, lineHeight: 21 },
  defaultBold: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  small: { fontSize: 13, lineHeight: 18 },
  smallBold: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  link: { fontSize: 13, lineHeight: 18, fontWeight: '600', textDecorationLine: 'underline' },
  code: { fontFamily: Fonts.mono, fontSize: 12 },
});

const styles = textStyles;
