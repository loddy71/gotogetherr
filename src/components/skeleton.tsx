import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** A softly breathing placeholder block. */
export function SkeletonBlock({
  width,
  height,
  radius = Radius.sm,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
}) {
  const theme = useTheme();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.set(withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.backgroundSelected }, style]}
    />
  );
}

/** Placeholder shaped like a result card, shown while prices are computed. */
export function ResultSkeleton() {
  return (
    <Card style={{ padding: Spacing.three, gap: Spacing.three }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ gap: Spacing.two }}>
          <SkeletonBlock width={150} height={22} />
          <SkeletonBlock width={100} height={12} />
        </View>
        <SkeletonBlock width={70} height={26} />
      </View>
      <SkeletonBlock width="100%" height={6} radius={3} />
    </Card>
  );
}
