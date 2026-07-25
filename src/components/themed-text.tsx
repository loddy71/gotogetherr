import { StyleSheet, Text, type TextProps } from 'react-native';

import { DisplayFont, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'body'
    | 'small'
    | 'smallBold'
    | 'display'
    | 'title'
    | 'heading'
    | 'label'
    | 'price'
    | 'priceLarge'
    | 'numeral'
    | 'link'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'body' && styles.body,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'display' && styles.display,
        type === 'title' && styles.title,
        type === 'heading' && styles.heading,
        type === 'label' && styles.label,
        type === 'price' && styles.price,
        type === 'priceLarge' && styles.priceLarge,
        type === 'numeral' && styles.numeral,
        type === 'link' && styles.link,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  /** Page headline, set tight and large. */
  display: {
    fontFamily: DisplayFont,
    fontSize: 46,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  /** Screen title (city name, trip name). */
  title: {
    fontFamily: DisplayFont,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.2,
  },
  heading: {
    fontFamily: DisplayFont,
    fontSize: 23,
    lineHeight: 27,
  },
  /** Right-aligned figures in lists. */
  price: {
    fontFamily: DisplayFont,
    fontSize: 24,
    lineHeight: 27,
    fontVariant: ['tabular-nums'],
  },
  priceLarge: {
    fontFamily: DisplayFont,
    fontSize: 30,
    lineHeight: 33,
    fontVariant: ['tabular-nums'],
  },
  /** Rank numerals set in the margin. */
  numeral: {
    fontFamily: DisplayFont,
    fontSize: 19,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  /** Small caps section labels. */
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
  },
  default: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  small: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  smallBold: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  link: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
