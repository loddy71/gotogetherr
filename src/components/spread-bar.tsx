import { StyleSheet, View } from 'react-native';

import { travelerColor } from '@/constants/theme';
import type { TravelerCost } from '@/lib/types';

/**
 * One colored segment per traveler, width proportional to what they'd pay.
 * Even segments = a fair split; one long bar = someone is subsidising the
 * reunion with their wallet.
 */
export function SpreadBar({ perTraveler, height = 8 }: { perTraveler: TravelerCost[]; height?: number }) {
  const total = perTraveler.reduce((a, t) => a + t.total, 0) || 1;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      {perTraveler.map((t, i) => (
        <View
          key={t.travelerId}
          style={{
            flex: t.total / total,
            backgroundColor: travelerColor(i),
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
});
