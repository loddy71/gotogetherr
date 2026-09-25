import { Platform, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Raised paper: rounded, hairline-edged, with a shadow soft enough to read as depth, not chrome. */
export function Card({
  style,
  children,
  ...rest
}: ViewProps & { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(40, 30, 20, 0.04), 0 8px 24px rgba(40, 30, 20, 0.05)' },
      default: {
        shadowColor: '#281E14',
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 1,
      },
    }),
  },
});
