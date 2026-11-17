import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { SkeletonBlock } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { OnPassInk, PassInk, Radius, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { money } from '@/lib/format';
import { rankDestinations } from '@/lib/scoring';
import type { DestinationResult, Trip } from '@/lib/types';


/**
 * First-run specimen: the example trip's best city as a fanned stack of
 * compact boarding passes, priced live by the same estimator as a real trip.
 */
export function SpecimenPasses({ trip }: { trip: Trip }) {
  const theme = useTheme();
  const [best, setBest] = useState<DestinationResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    rankDestinations(trip).then((ranked) => {
      if (!cancelled) setBest(ranked[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [trip]);

  if (!best) {
    return (
      <View style={{ gap: Spacing.two }}>
        {trip.travelers.map((t) => (
          <SkeletonBlock key={t.id} width="100%" height={72} radius={Radius.lg} />
        ))}
      </View>
    );
  }

  const destination = getCity(best.cityCode);
  return (
    <View
      accessible
      accessibilityLabel={`Example: ${trip.travelers
        .map((t, i) => `${t.name} from ${getCity(t.originCode).name} pays about ${money(best.perTraveler[i].total)}`)
        .join('; ')}, meeting in ${destination.name}.`}>
      {trip.travelers.map((t, i) => {
        const cost = best.perTraveler[i];
        return (
          <Card
            key={t.id}
            style={[
              styles.pass,
              // A loose fan: each pass sits a little lower and further right.
              // Overlap leaves each slice's row a margin above the next strip.
              i > 0 && { marginTop: -Spacing.two },
              { marginLeft: i * Spacing.three, marginRight: (trip.travelers.length - 1 - i) * Spacing.three },
            ]}>
            <View style={styles.carrier}>
              <BrandMark size={10} dotColor="#FFFFFF" ringColor={PassInk} />
              <ThemedText type="field" style={styles.carrierText}>
                {t.name}
              </ThemedText>
            </View>
            <View style={[styles.band, { backgroundColor: travelerColor(i) }]} />
            <View style={styles.row}>
              <ThemedText type="iata" style={styles.code}>
                {t.originCode}
              </ThemedText>
              <Icon name="plane" size={16} color={travelerColor(i)} strokeWidth={1.6} />
              <ThemedText type="iata" style={styles.code}>
                {destination.code}
              </ThemedText>
              <View style={[styles.perf, { borderColor: theme.borderStrong }]} />
              {/* "est." shares the price's line so the fan never covers it. */}
              <View style={styles.price}>
                <ThemedText type="price">{money(cost.total)}</ThemedText>
                <ThemedText type="caption" themeColor="textSecondary">
                  est.
                </ThemedText>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pass: { overflow: 'hidden' },
  carrier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    backgroundColor: PassInk,
  },
  carrierText: { color: OnPassInk },
  band: { height: 3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  code: { fontSize: 24, lineHeight: 26 },
  price: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  perf: {
    flex: 1,
    alignSelf: 'stretch',
    marginVertical: -Spacing.two,
    borderRightWidth: 1.5,
    borderStyle: 'dashed',
    marginRight: Spacing.two,
  },
});
