import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutRectangle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Motion, Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Pill track with a thumb that glides between options on a spring. */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);

  const active = layouts[value];
  useEffect(() => {
    if (!active) return;
    // First placement snaps; later moves glide.
    const placed = width.get() > 0;
    x.set(placed ? withSpring(active.x, Motion.glide) : active.x);
    width.set(placed ? withSpring(active.width, Motion.glide) : active.width);
  }, [active, x, width]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: width.value,
    opacity: width.value > 0 ? 1 : 0,
  }));

  return (
    <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
      <Animated.View style={[styles.thumb, { backgroundColor: theme.card }, thumbStyle]} />
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onLayout={(e) => {
              const layout = e.nativeEvent.layout;
              setLayouts((prev) => ({ ...prev, [option.value]: layout }));
            }}
            onPress={() => {
              if (selected) return;
              haptic('selection');
              onChange(option.value);
            }}
            style={styles.segment}>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? theme.text : theme.textSecondary }}
              numberOfLines={1}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 3,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: Radius.pill,
    shadowColor: '#281E14',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
});
