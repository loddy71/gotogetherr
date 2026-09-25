import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Motion, Radius, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BarSegment = { key: string; value: number; color: string };

/**
 * Stacked bar that grows in from the left and re-flows smoothly when the
 * split changes. Even segments mean an even split.
 */
export function StackedBar({
  segments,
  height = 6,
  delay = 0,
}: {
  segments: BarSegment[];
  height?: number;
  delay?: number;
}) {
  const theme = useTheme();
  const reveal = useSharedValue(0);

  useEffect(() => {
    reveal.set(withDelay(delay, withTiming(1, { duration: Motion.duration.slow, easing: Motion.ease })));
  }, [delay, reveal]);

  const revealStyle = useAnimatedStyle(() => ({ width: `${reveal.value * 100}%` }));
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: theme.backgroundSelected },
      ]}>
      <Animated.View style={[styles.fill, revealStyle]}>
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <Segment key={s.key} share={s.value / total} color={s.color} />
          ))}
      </Animated.View>
    </View>
  );
}

function Segment({ share, color }: { share: number; color: string }) {
  const flex = useSharedValue(share);
  useEffect(() => {
    flex.set(withTiming(share, { duration: Motion.duration.base, easing: Motion.ease }));
  }, [share, flex]);
  const style = useAnimatedStyle(() => ({ flexGrow: flex.value, flexBasis: 0 }));
  return <Animated.View style={[{ backgroundColor: color }, style]} />;
}

/** One segment per traveler, sized by their share of the group total. */
export function CostBar({
  perTraveler,
  height,
  delay,
}: {
  perTraveler: { travelerId: string; total: number }[];
  height?: number;
  delay?: number;
}) {
  return (
    <StackedBar
      height={height}
      delay={delay}
      segments={perTraveler.map((t, i) => ({
        key: t.travelerId,
        value: t.total,
        color: travelerColor(i),
      }))}
    />
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    borderRadius: Radius.pill,
  },
  fill: {
    flexDirection: 'row',
    height: '100%',
    gap: 2,
  },
});
