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

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
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
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
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
