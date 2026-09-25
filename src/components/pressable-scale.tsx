import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Motion } from '@/constants/theme';
import { haptic, type HapticKind } from '@/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far the element sinks while held. */
  scaleTo?: number;
  /** Haptic to play on press (native only). */
  feedback?: HapticKind | false;
};

/**
 * The app's one tappable surface: sinks slightly on a spring while held and
 * gives a light haptic on press, so every control feels physically the same.
 */
export function PressableScale({
  scaleTo = 0.97,
  feedback = 'light',
  style,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, scaleTo]) }],
    opacity: interpolate(pressed.value, [0, 1], [1, 0.9]),
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        pressed.set(withSpring(1, Motion.snappy));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withSpring(0, Motion.snappy));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (feedback) haptic(feedback);
        onPress?.(e);
      }}
      style={[style, animatedStyle, disabled && { opacity: 0.4 }]}
      {...rest}
    />
  );
}
