import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export const HEADER_BAR_HEIGHT = 52;

type ScreenHeaderProps = {
  /** Compact title that fades in once the large title has scrolled away. */
  title: string;
  scrollY: SharedValue<number>;
  /** Scroll distance at which the compact title is fully shown. */
  collapseAt?: number;
  right?: ReactNode;
};

/**
 * Floating top bar for screens with a large in-content title. Transparent
 * at rest; as you scroll, the paper background, hairline and compact title
 * fade in together.
 */
export function ScreenHeader({ title, scrollY, collapseAt = 70, right }: ScreenHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const barStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [collapseAt - 40, collapseAt], [0, 1], Extrapolation.CLAMP),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [collapseAt - 20, collapseAt + 10], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [collapseAt - 20, collapseAt + 10],
          [8, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.bar,
          { backgroundColor: theme.background, borderBottomColor: theme.border },
          barStyle,
        ]}
      />
      <View style={styles.row} pointerEvents="box-none">
        <PressableScale
          accessibilityLabel="Back"
          onPress={goBack}
          hitSlop={8}
          style={[styles.circle, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="back" size={20} color={theme.text} strokeWidth={2} />
        </PressableScale>
        <Animated.View style={[styles.title, titleStyle]} pointerEvents="none">
          <ThemedText type="defaultBold" numberOfLines={1}>
            {title}
          </ThemedText>
        </Animated.View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

/** Round icon button that matches the header's back button. */
export function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: 'share' | 'edit' | 'close';
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <PressableScale
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={[styles.circle, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Icon name={icon} size={18} color={theme.text} strokeWidth={2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({ web: { backdropFilter: 'blur(12px)' } as object, default: {} }),
  },
  row: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    gap: Spacing.two,
    minWidth: 38,
    justifyContent: 'flex-end',
  },
});
