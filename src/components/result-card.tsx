import { StyleSheet, Text, View } from 'react-native';

import { AnimatedNumber } from '@/components/animated-number';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { CostBar } from '@/components/cost-bar';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { DangerColor, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity, weatherFor } from '@/lib/data/cities';
import { money } from '@/lib/format';
import type { DestinationResult } from '@/lib/types';

type ResultCardProps = {
  rank: number;
  result: DestinationResult;
  month: number;
  onPress: () => void;
  /** Delay for the cost bar's grow-in, so a list reveals top to bottom. */
  revealDelay?: number;
};

export function ResultCard({ rank, result, month, onPress, revealDelay = 0 }: ResultCardProps) {
  const theme = useTheme();
  const city = getCity(result.cityCode);
  const weather = weatherFor(city, month);
  const isTop = rank === 1;

  return (
    <PressableScale onPress={onPress} scaleTo={0.985}>
      <Card style={[styles.card, isTop && { borderColor: theme.tint, borderWidth: 1 }]}>
        <View style={styles.head}>
          <ThemedText
            type="numeral"
            style={[styles.rank, { color: isTop ? theme.tint : theme.textSecondary }]}>
            {rank}
          </ThemedText>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.cityLine}>
              <Text style={styles.flag}>{city.flag}</Text>
              <ThemedText type="heading" numberOfLines={1} style={{ flexShrink: 1 }}>
                {city.name}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {city.country} · {city.vibes.slice(0, 2).join(', ')}
            </ThemedText>
          </View>
          <View style={styles.price}>
            <AnimatedNumber type="price" value={result.avgCost} format={money} />
            <ThemedText type="caption" themeColor="textSecondary">
              each
            </ThemedText>
          </View>
        </View>

        <CostBar perTraveler={result.perTraveler} delay={revealDelay} />

        <View style={styles.meta}>
          <ThemedText type="small" themeColor="textSecondary" style={{ flexShrink: 1 }}>
            {money(result.totalCost)} total · {Math.round(result.fairness * 100)}% even
          </ThemedText>
          <View style={styles.chips}>
            <Chip
              icon={weather.hazard && weather.hazard !== 'Extreme heat' ? 'rain' : 'sun'}
              label={weather.hazard ? `${weather.highC}° · ${weather.hazard}` : `${weather.highC}°C`}
              tone={weather.hazard ? 'warning' : 'neutral'}
            />
          </View>
        </View>

        {(isTop || result.overBudgetCount > 0) && (
          <View style={styles.flags}>
            {isTop && <Chip label="Best match" tone="accent" />}
            {result.overBudgetCount > 0 && (
              <ThemedText type="caption" style={{ color: DangerColor }}>
                Over budget for {result.overBudgetCount}
              </ThemedText>
            )}
          </View>
        )}
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
  },
  rank: {
    width: 22,
    paddingTop: 4,
  },
  cityLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flag: {
    fontSize: 18,
  },
  price: {
    alignItems: 'flex-end',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  flags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: -Spacing.one,
  },
});
