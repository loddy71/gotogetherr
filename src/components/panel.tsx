import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Ruled block of raised paper. No shadow — grouping comes from the rule,
 * the way a boxed sidebar works on a printed page.
 */
export function Panel({
  style,
  children,
}: {
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.card, borderColor: theme.border },
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: Radius.md,
  },
});
