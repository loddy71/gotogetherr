import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Motion, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getCity } from '@/lib/data/cities';
import { money, moneyCompact, MONTHS, monthName } from '@/lib/format';
import { cheapestMonth, type MonthOption } from '@/lib/months';

const PLOT_HEIGHT = 92;
const COLUMN_MAX_WIDTH = 18;

type MonthChartProps = {
  options: MonthOption[];
  /** The trip's current month. */
  month: number;
  /** Recomputing: hold the previous frame at reduced opacity. */
  stale?: boolean;
  onPlan: (month: number) => void;
};

/**
 * What the best city costs each person, month by month. One series: the
 * previewed month is ink, the cheapest is the accent, the rest neutral.
 * Tap a column to preview it; nothing changes until "Plan for …".
 */
export function MonthChart({ options, month, stale, onPlan }: MonthChartProps) {
  const theme = useTheme();
  const [preview, setPreview] = useState(month);
  const [shownFor, setShownFor] = useState(month);
  // When the trip's month changes (e.g. after planning), preview follows it.
  if (shownFor !== month) {
    setShownFor(month);
    setPreview(month);
  }

  const cheapest = cheapestMonth(options);
  const max = Math.max(1, ...options.map((o) => o.avgCost));
  const current = options.find((o) => o.month === month);
  const selected = options.find((o) => o.month === preview);

  const delta = selected && current && selected.cityCode && current.cityCode
    ? selected.avgCost - current.avgCost
    : 0;

  return (
    <View style={[styles.container, stale && { opacity: 0.5 }]}>
      <View style={styles.readout}>
        {selected?.cityCode ? (
          <>
            <ThemedText type="defaultBold">
              {monthName(selected.month)}: {getCity(selected.cityCode).flag}{' '}
              {getCity(selected.cityCode).name}, {money(selected.avgCost)} each
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {preview === month
                ? `Your current month · ${Math.round(selected.fairness * 100)}% even split`
                : `${money(Math.abs(delta))} ${delta <= 0 ? 'less' : 'more'} each than ${monthName(month)} · ${Math.round(selected.fairness * 100)}% even`}
            </ThemedText>
          </>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            No city fits your filters in {monthName(preview)}.
          </ThemedText>
        )}
      </View>

      <View style={styles.plot} accessibilityRole="list">
        {options.map((o) => {
          const isPreview = o.month === preview;
          const isCheapest = o.month === cheapest?.month;
          const color = isCheapest ? theme.tint : isPreview ? theme.text : theme.chartMark;
          const label = isCheapest || isPreview;
          return (
            <Pressable
              key={o.month}
              accessibilityRole="button"
              accessibilityLabel={
                o.cityCode
                  ? `${monthName(o.month)}: ${getCity(o.cityCode).name}, ${money(o.avgCost)} each${isCheapest ? ', cheapest' : ''}`
                  : `${monthName(o.month)}: no city fits your filters`
              }
              accessibilityState={{ selected: isPreview }}
              onPress={() => setPreview(o.month)}
              style={styles.slot}>
              {label && o.cityCode ? (
                <Text style={[styles.capLabel, { color: theme.text }]}>{moneyCompact(o.avgCost)}</Text>
              ) : (
                <View style={styles.capSpacer} />
              )}
              {o.cityCode ? (
                <Column ratio={o.avgCost / max} color={color} />
              ) : (
                <View style={[styles.none, { backgroundColor: theme.border }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.axis, { borderTopColor: theme.border }]}>
        {MONTHS.map((m, i) => (
          <View key={m} style={styles.tick}>
            <ThemedText
              type="caption"
              style={{
                color: i + 1 === month ? theme.text : theme.textSecondary,
                fontWeight: i + 1 === month ? '700' : '500',
              }}>
              {m[0]}
            </ThemedText>
            {i + 1 === month && <View style={[styles.nowDot, { backgroundColor: theme.text }]} />}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        {cheapest?.cityCode ? (
          <View style={styles.legend}>
            <View style={[styles.swatch, { backgroundColor: theme.tint }]} />
            <ThemedText type="caption" themeColor="textSecondary">
              Cheapest: {monthName(cheapest.month)}
            </ThemedText>
          </View>
        ) : (
          <View />
        )}
        {preview !== month && selected?.cityCode && (
          <Animated.View entering={FadeIn.duration(Motion.duration.fast)}>
            <Button
              title={`Plan for ${monthName(preview)}`}
              size="small"
              onPress={() => onPlan(preview)}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Column({ ratio, color }: { ratio: number; color: string }) {
  const height = useSharedValue(0);
  useEffect(() => {
    height.set(withSpring(Math.max(4, ratio * PLOT_HEIGHT), Motion.glide));
  }, [ratio, height]);
  const style = useAnimatedStyle(() => ({ height: height.value }));
  return (
    <Animated.View
      style={[
        styles.column,
        { backgroundColor: color, transitionProperty: 'backgroundColor', transitionDuration: Motion.duration.fast },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  readout: {
    gap: 2,
    minHeight: 40,
  },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: PLOT_HEIGHT + 18,
  },
  slot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  capLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 3,
    fontVariant: ['tabular-nums'],
  },
  capSpacer: {
    height: 15,
  },
  column: {
    width: '62%',
    maxWidth: COLUMN_MAX_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  none: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  axis: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    marginTop: -Spacing.three + 2,
  },
  tick: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  nowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
