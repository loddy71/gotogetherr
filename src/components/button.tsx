import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DangerColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  /** primary: ink block · secondary: ruled outline · destructive: red outline · quiet: bare text */
  variant?: 'primary' | 'secondary' | 'destructive' | 'quiet';
  style?: ViewStyle;
};

/**
 * Letterspaced small-caps label on an ink block (primary) or a ruled outline.
 * Deliberately near-square corners — this is print, not a control panel.
 */
export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();

  const background = variant === 'primary' ? theme.text : 'transparent';
  const borderColor =
    variant === 'primary'
      ? theme.text
      : variant === 'destructive'
        ? DangerColor
        : variant === 'quiet'
          ? 'transparent'
          : theme.borderStrong;
  const color =
    variant === 'primary'
      ? theme.background
      : variant === 'destructive'
        ? DangerColor
        : variant === 'quiet'
          ? theme.textSecondary
          : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background, borderColor },
        variant === 'quiet' && styles.quiet,
        { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
        style,
      ]}
      {...rest}>
      <ThemedText type="label" style={{ color, letterSpacing: 1.6 }}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  quiet: {
    paddingVertical: Spacing.two,
    paddingHorizontal: 0,
  },
});
