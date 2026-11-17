import { StyleSheet, Text, type TextProps } from 'react-native';

import { CodeFont, DisplayFont, Fonts, ThemeColor } from '@/constants/theme';
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
  | 'iata'
  | 'field'
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
  // Condensed grotesk: display moments, names, codes and big figures.
  display: { fontFamily: CodeFont, fontSize: 46, lineHeight: 46, letterSpacing: -0.6 },
  title: { fontFamily: DisplayFont, fontSize: 34, lineHeight: 36, letterSpacing: -0.3 },
  heading: { fontFamily: DisplayFont, fontSize: 22, lineHeight: 26, letterSpacing: -0.1 },
  price: { fontFamily: DisplayFont, fontSize: 26, lineHeight: 28, fontVariant: ['tabular-nums'] },
  priceLarge: { fontFamily: CodeFont, fontSize: 40, lineHeight: 40, fontVariant: ['tabular-nums'] },
  numeral: { fontFamily: DisplayFont, fontSize: 20, lineHeight: 22, fontVariant: ['tabular-nums'] },
  /** IATA city codes (LON, NYC): the pass's own display voice. */
  iata: { fontFamily: CodeFont, fontSize: 32, lineHeight: 32, letterSpacing: 0.4 },
  /** Field labels printed on a pass (FROM, FLIGHT TIME): data labels, not eyebrows. */
  field: { fontSize: 10.5, lineHeight: 13, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
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
