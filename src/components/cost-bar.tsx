import { StyleSheet, View } from 'react-native';

import { travelerColor } from '@/constants/theme';
import type { TravelerCost } from '@/lib/types';

/**
 * One segment per traveler, width proportional to their share of the group
 * total. Even segments mean an even split; one long segment means somebody
 * is bankrolling the reunion.
 */
export function CostBar({
  perTraveler,
  height = 4,
}: {
  perTraveler: TravelerCost[];
  height?: number;
}) {
  const total = perTraveler.reduce((a, t) => a + t.total, 0) || 1;

  return (
    <View style={[styles.track, { height }]}>
      {perTraveler.map((t, i) => (
        <View key={t.travelerId} style={{ flex: t.total / total, backgroundColor: travelerColor(i) }} />
      ))}
    </View>
  );
}

/** Flight / hotel / daily split for a single traveler. */
export function CompositionBar({
  segments,
  height = 4,
}: {
  segments: { value: number; color: string }[];
  height?: number;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  return (
    <View style={[styles.track, { height }]}>
      {segments
        .filter((s) => s.value > 0)
        .map((s) => (
          <View key={s.color} style={{ flex: s.value / total, backgroundColor: s.color }} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 2,
    overflow: 'hidden',
  },
});
