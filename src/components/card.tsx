import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Elevated surface with border + soft shadow. Pass `onPress` to make it
 * tappable (with press feedback), omit it for a static card.
 */
type CardProps = Omit<PressableProps, 'style'> & {
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
};

export function Card({ style, children, onPress, ...rest }: CardProps) {
  const theme = useTheme();
  const surface = [
    styles.card,
    { backgroundColor: theme.card, borderColor: theme.border },
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];

  if (!onPress) return <View style={surface}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        ...surface,
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    shadowColor: '#10102E',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
