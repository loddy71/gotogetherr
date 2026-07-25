import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CostBar } from '@/components/cost-bar';
import { ThemedText } from '@/components/themed-text';
import { DangerColor, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { money } from '@/lib/format';
import type { DestinationResult } from '@/lib/types';

type ResultRowProps = {
  rank: number;
  result: DestinationResult;
  onPress: () => void;
};

/**
 * A ranked entry, set like a guidebook listing: numeral in the margin, city
 * in display serif, figure right-aligned, then the cost split and a line of
 * metadata.
 */
export function ResultRow({ rank, result, onPress }: ResultRowProps) {
  const theme = useTheme();
  const city = getCity(result.cityCode);
  const isTop = rank === 1;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <View style={styles.numeralColumn}>
        <ThemedText
          type="numeral"
          style={{ color: isTop ? theme.tint : theme.textSecondary }}>
          {rank}
        </ThemedText>
      </View>

      <View style={{ flex: 1, gap: Spacing.two + 2 }}>
        <View style={styles.headline}>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={styles.cityLine}>
              <Text style={styles.flag}>{city.flag}</Text>
              <ThemedText type="heading" numberOfLines={1}>
                {city.name}
              </ThemedText>
            </View>
            <ThemedText type="label" themeColor="textSecondary" numberOfLines={1}>
              {city.country} · {city.vibes.slice(0, 2).join(' · ')}
            </ThemedText>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="price">{money(result.avgCost)}</ThemedText>
            <ThemedText type="label" themeColor="textSecondary">
              each
            </ThemedText>
          </View>
        </View>

        <CostBar perTraveler={result.perTraveler} />

        <View style={styles.meta}>
          <ThemedText type="small" themeColor="textSecondary">
            {money(result.totalCost)} for the group · {Math.round(result.fairness * 100)}% even
            split
          </ThemedText>
          {result.overBudgetCount > 0 ? (
            <ThemedText type="label" style={{ color: DangerColor }}>
              {result.overBudgetCount} over budget
            </ThemedText>
          ) : isTop ? (
            <ThemedText type="label" style={{ color: theme.tint }}>
              Best match
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.one,
    gap: Spacing.two,
  },
  numeralColumn: {
    width: 26,
    paddingTop: 3,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  cityLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flag: {
    fontSize: 17,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
