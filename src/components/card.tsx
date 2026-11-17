import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Raised paper. Elevation is declared once: a soft offset shadow on light
 * stock, a hairline edge on dark (where shadows don't read). Never both.
 */
export function Card({
  style,
  children,
  ...rest
}: ViewProps & { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const dark = useColorScheme() === 'dark';
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card },
        dark ? { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border } : styles.raised,
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    // Keeps borderColor overrides (e.g. the top pick) visible on light stock.
    borderColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
  },
  raised: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(40, 30, 20, 0.06), 0 6px 18px rgba(40, 30, 20, 0.06)' },
    default: {
      shadowColor: '#281E14',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  }) as ViewStyle,
});
