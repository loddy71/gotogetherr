import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button } from '@/components/button';
import { Segmented } from '@/components/segmented';
import { Sheet } from '@/components/sheet';
import { ThemedText } from '@/components/themed-text';
import { Toggle } from '@/components/toggle';
import { Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DEFAULT_FILTERS, FLIGHT_LIMITS, VIBES } from '@/lib/filters';
import { monthName } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import type { TripFilters, VibeKey } from '@/lib/types';

type RefineSheetProps = {
  visible: boolean;
  onClose: () => void;
  month: number;
  filters: TripFilters;
  /** How many cities pass the current filters, shown live. */
  matchCount: number;
  total: number;
  onChange: (filters: TripFilters) => void;
};

type FlightOption = 'any' | `${(typeof FLIGHT_LIMITS)[number]}`;

/**
 * Narrow the ranking. Every change applies immediately, so the list behind
 * the sheet re-sorts while you choose.
 */
export function RefineSheet({
  visible,
  onClose,
  month,
  filters,
  matchCount,
  total,
  onChange,
}: RefineSheetProps) {
  const theme = useTheme();

  const toggleVibe = (key: VibeKey) => {
    haptic('selection');
    const vibes = filters.vibes.includes(key)
      ? filters.vibes.filter((v) => v !== key)
      : [...filters.vibes, key];
    onChange({ ...filters, vibes });
  };

  const flightValue: FlightOption =
    filters.maxFlightHours === null ? 'any' : (String(filters.maxFlightHours) as FlightOption);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      heightRatio={0.78}
      header={
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <ThemedText type="heading">Refine</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {matchCount} of {total} cities match
            </ThemedText>
          </View>
          <Button
            title="Reset"
            variant="ghost"
            size="small"
            onPress={() => onChange(DEFAULT_FILTERS)}
          />
        </View>
      }>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary">
            The city should have
          </ThemedText>
          <View style={styles.pills}>
            {VIBES.map((v) => (
              <TogglePill
                key={v.key}
                label={v.label}
                selected={filters.vibes.includes(v.key)}
                onPress={() => toggleVibe(v.key)}
              />
            ))}
          </View>
          <ThemedText type="caption" themeColor="textSecondary">
            Pick several and a city has to have all of them.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="label" themeColor="textSecondary">
            Longest flight for anyone
          </ThemedText>
          <Segmented<FlightOption>
            options={[
              { value: 'any', label: 'Any' },
              ...FLIGHT_LIMITS.map((h) => ({ value: String(h) as FlightOption, label: `≤ ${h} h` })),
            ]}
            value={flightValue}
            onChange={(next) =>
              onChange({ ...filters, maxFlightHours: next === 'any' ? null : Number(next) })
            }
          />
          <ThemedText type="caption" themeColor="textSecondary">
            Time in the air on a direct routing; connections add more.
          </ThemedText>
        </View>

        <View style={[styles.switchRow, { backgroundColor: theme.backgroundSelected }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText type="defaultBold">Skip bad-weather cities</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Monsoon, hurricane or typhoon season, or 38°C+ in {monthName(month)}
            </ThemedText>
          </View>
          <Toggle
            accessibilityLabel="Skip bad-weather cities"
            value={filters.avoidBadWeather}
            onValueChange={(avoidBadWeather) => onChange({ ...filters, avoidBadWeather })}
          />
        </View>

        <Button title={`Show ${matchCount} cities`} onPress={onClose} />
      </ScrollView>
    </Sheet>
  );
}

function TogglePill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: selected ? theme.text : 'transparent',
            borderColor: selected ? theme.text : theme.borderStrong,
            transitionProperty: ['backgroundColor', 'borderColor'],
            transitionDuration: Motion.duration.base,
          },
        ]}>
        <ThemedText type="smallBold" style={{ color: selected ? theme.background : theme.text }}>
          {label}
        </ThemedText>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  body: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  section: {
    gap: Spacing.two + 2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
});
