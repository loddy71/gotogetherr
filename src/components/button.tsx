import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: ViewStyle;
};

const ACCENT = '#208AEF';

export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const background =
    variant === 'primary' ? ACCENT : variant === 'destructive' ? '#E5484D' : theme.backgroundElement;
  const color = variant === 'secondary' ? theme.text : '#ffffff';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
      {...rest}>
      <ThemedText type="smallBold" style={{ color }}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
  },
});
