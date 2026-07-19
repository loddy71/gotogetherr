import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { CityTile } from '@/components/city-tile';
import { RankMedal } from '@/components/rank-medal';
import { SpreadBar } from '@/components/spread-bar';
import { ThemedText } from '@/components/themed-text';
import { DangerColor, Radius, Spacing, SuccessColor } from '@/constants/theme';
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
  const city = getCity(result.cityCode);
  const fairnessPct = Math.round(result.fairness * 100);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <RankMedal rank={rank} />
        <CityTile city={city} />
        <View style={{ flex: 1, gap: 1 }}>
          <ThemedText type="heading">{city.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {city.country} · {city.vibes.slice(0, 3).join(' · ')}
          </ThemedText>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText type="stat">{money(result.avgCost)}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            avg / person
          </ThemedText>
        </View>
      </View>

      <SpreadBar perTraveler={result.perTraveler} />

      <View style={styles.badges}>
        <Badge label={`group ${money(result.totalCost)}`} />
        <Badge
          label={`fairness ${fairnessPct}%`}
          tone={fairnessPct >= 75 ? 'success' : undefined}
        />
        {result.overBudgetCount > 0 && (
          <Badge label={`${result.overBudgetCount} over budget`} tone="danger" />
        )}
      </View>
    </Card>
  );
}

function Badge({ label, tone }: { label: string; tone?: 'danger' | 'success' }) {
  const theme = useTheme();
  const background =
    tone === 'danger' ? DangerColor : tone === 'success' ? SuccessColor : theme.backgroundSelected;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <ThemedText
        type="small"
        style={[{ fontSize: 12, lineHeight: 16 }, tone ? { color: '#fff' } : undefined]}
        themeColor={tone ? undefined : 'textSecondary'}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.three - 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + Spacing.half,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
