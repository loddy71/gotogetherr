import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandGradient, DangerColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: ViewStyle;
};

export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();

  const label = (
    <ThemedText
      type="smallBold"
      style={{ color: variant === 'secondary' ? theme.text : '#ffffff', fontSize: 15 }}>
      {title}
    </ThemedText>
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : pressed ? 0.8 : 1, borderRadius: Radius.md },
        variant !== 'primary' && [
          styles.base,
          {
            backgroundColor: variant === 'destructive' ? DangerColor : theme.backgroundElement,
            borderWidth: variant === 'secondary' ? 1 : 0,
            borderColor: theme.border,
          },
        ],
        style,
      ]}
      {...rest}>
      {variant === 'primary' ? (
        <LinearGradient
          colors={BrandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, styles.gradient]}>
          {label}
        </LinearGradient>
      ) : (
        label
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  gradient: {
    width: '100%',
  },
});
