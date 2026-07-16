import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { money } from '@/lib/format';
import type { DestinationResult } from '@/lib/types';

type ResultCardProps = {
  rank: number;
  result: DestinationResult;
  onPress: () => void;
};

export function ResultCard({ rank, result, onPress }: ResultCardProps) {
  const theme = useTheme();
  const city = getCity(result.cityCode);
  const spread = result.maxCost - result.minCost;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 },
      ]}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.rank}>
          #{rank}
        </ThemedText>
        <View style={{ flex: 1 }}>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {city.flag} {city.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {city.country}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="default" style={{ fontWeight: '700' }}>
            {money(result.avgCost)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            avg / person
          </ThemedText>
        </View>
      </View>

      <View style={styles.badges}>
        <Badge label={`group ${money(result.totalCost)}`} />
        <Badge label={`fairness ${(result.fairness * 100).toFixed(0)}%`} />
        {spread > 0 && <Badge label={`spread ${money(spread)}`} />}
        {result.overBudgetCount > 0 && (
          <Badge
            label={`${result.overBudgetCount} over budget`}
            color="#E5484D"
            textColor="#ffffff"
          />
        )}
      </View>
    </Pressable>
  );
}

function Badge({
  label,
  color,
  textColor,
}: {
  label: string;
  color?: string;
  textColor?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: color ?? theme.backgroundSelected }]}>
      <ThemedText type="small" style={textColor ? { color: textColor } : undefined}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rank: {
    minWidth: 30,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
