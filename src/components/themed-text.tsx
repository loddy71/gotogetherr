import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'heading'
    | 'label'
    | 'stat'
    | 'link'
    | 'linkPrimary'
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
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'heading' && styles.heading,
        type === 'label' && styles.label,
        type === 'stat' && styles.stat,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 46,
    fontFamily: Fonts.rounded,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 800,
    fontFamily: Fonts.rounded,
    letterSpacing: -0.3,
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: 700,
    fontFamily: Fonts.rounded,
  },
  /** Uppercase section labels. */
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  /** Big numbers in stat rows. */
  stat: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 800,
    fontFamily: Fonts.rounded,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#5B4DE0',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
