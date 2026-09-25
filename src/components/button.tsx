import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { PressableScale, type PressableScaleProps } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { DangerColor, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableScaleProps, 'style' | 'children'> & {
  title: string;
  /** primary: ink pill · secondary: outlined pill · destructive: red outline · ghost: bare */
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  icon?: IconName;
  size?: 'large' | 'small';
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  icon,
  size = 'large',
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();

  const background = variant === 'primary' ? theme.text : 'transparent';
  const borderColor =
    variant === 'primary'
      ? theme.text
      : variant === 'destructive'
        ? DangerColor
        : variant === 'ghost'
          ? 'transparent'
          : theme.borderStrong;
  const color =
    variant === 'primary'
      ? theme.background
      : variant === 'destructive'
        ? DangerColor
        : theme.text;

  return (
    <PressableScale
      accessibilityLabel={title}
      style={[
        styles.base,
        size === 'small' && styles.small,
        { backgroundColor: background, borderColor },
        style,
      ]}
      {...rest}>
      <View style={styles.row}>
        {icon && <Icon name={icon} size={size === 'small' ? 16 : 18} color={color} strokeWidth={2} />}
        <ThemedText type={size === 'small' ? 'smallBold' : 'defaultBold'} style={{ color }}>
          {title}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  small: {
    minHeight: 38,
    paddingHorizontal: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
