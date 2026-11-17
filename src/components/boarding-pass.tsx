import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AnimatedNumber } from '@/components/animated-number';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/card';
import { StackedBar } from '@/components/cost-bar';
import { DotLeader } from '@/components/dot-leader';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Motion, Radius, Spacing, travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateRange, suggestedDates } from '@/lib/booking';
import { getCity } from '@/lib/data/cities';
import { money } from '@/lib/format';
import { flightHours } from '@/lib/pricing/mock-provider';
import type { Traveler, TravelerCost } from '@/lib/types';

/**
 * The signature move: each friend holds their own boarding pass to the
 * meeting city. Their livery bands the pass; the stub below the perforation
 * holds what they pay. Tap to unfold the breakdown.
 */
export function BoardingPass({
  traveler,
  cost,
  index,
  destinationCode,
  month,
  nights,
  open,
  onToggle,
}: {
  traveler: Traveler;
  cost: TravelerCost;
  index: number;
  destinationCode: string;
  month: number;
  nights: number;
  open: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const livery = travelerColor(index);
  const origin = getCity(traveler.originCode);
  const destination = getCity(destinationCode);
  const dates = formatDateRange(suggestedDates(month, nights));

  const rotation = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    rotation.set(withSpring(open ? 1 : 0, Motion.snappy));
  }, [open, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <PressableScale
      onPress={onToggle}
      scaleTo={0.985}
      feedback="selection"
      accessibilityLabel={`${traveler.name}: ${cost.isHome ? 'lives here' : `from ${origin.name}`}, ${money(cost.total)}`}
      accessibilityState={{ expanded: open }}>
      <Card style={styles.pass}>
        <View style={[styles.band, { backgroundColor: livery }]} />

        <View style={styles.body}>
          <View style={styles.holder}>
            <Avatar name={traveler.name} index={index} size={26} />
            <ThemedText type="defaultBold" numberOfLines={1} style={{ flex: 1 }}>
              {traveler.name}
            </ThemedText>
            <ThemedText type="field" themeColor="textSecondary">
              Pass {index + 1}
            </ThemedText>
          </View>

          <View style={styles.route}>
            <Endpoint label="From" code={origin.code} name={origin.name} />
            <View style={styles.track}>
              <View style={[styles.trackLine, { backgroundColor: livery }]} />
              <Icon name="plane" size={18} color={livery} strokeWidth={1.6} />
              <View style={[styles.trackLine, { backgroundColor: livery }]} />
            </View>
            <Endpoint label="To" code={destination.code} name={destination.name} align="right" />
          </View>

          <View style={styles.fields}>
            <Field
              label="Flight"
              value={cost.isHome ? 'Lives here' : formatHours(flightHours(origin.code, destination.code))}
            />
            <Field label="Nights" value={String(nights)} />
            <Field label="Dates" value={dates} grow />
          </View>
        </View>

        <Perforation />

        <View style={styles.stub}>
          <View style={{ flex: 1 }}>
            <ThemedText type="field" themeColor="textSecondary">
              Pays
            </ThemedText>
            {traveler.budget ? (
              <ThemedText type="caption" style={{ color: cost.overBudget ? theme.danger : theme.success }}>
                {cost.overBudget
                  ? `${money(cost.total - traveler.budget)} over budget`
                  : `${money(traveler.budget - cost.total)} under budget`}
              </ThemedText>
            ) : (
              <ThemedText type="caption" themeColor="textSecondary">
                Flight, room share, food
              </ThemedText>
            )}
          </View>
          <AnimatedNumber type="priceLarge" value={cost.total} format={money} fromZero />
          <Animated.View style={chevronStyle}>
            <Icon name="chevron-down" size={18} color={theme.textSecondary} />
          </Animated.View>
        </View>

        {open && (
          <Animated.View entering={FadeIn.duration(Motion.duration.base)} style={styles.breakdown}>
            <StackedBar
              segments={[
                { key: 'flight', value: cost.flight, color: theme.costFlight },
                { key: 'room', value: cost.hotelShare, color: theme.costRoom },
                { key: 'daily', value: cost.daily, color: theme.costDaily },
              ]}
            />
            <LineItem label="Return flight" value={cost.flight} color={theme.costFlight} />
            <LineItem label="Share of the room" value={cost.hotelShare} color={theme.costRoom} />
            <LineItem label="Food & getting around" value={cost.daily} color={theme.costDaily} />
          </Animated.View>
        )}
      </Card>
    </PressableScale>
  );
}

function Endpoint({
  label,
  code,
  name,
  align = 'left',
}: {
  label: string;
  code: string;
  name: string;
  align?: 'left' | 'right';
}) {
  const textAlign = align;
  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'flex-end', maxWidth: '38%' }}>
      <ThemedText type="field" themeColor="textSecondary" style={{ textAlign }}>
        {label}
      </ThemedText>
      <ThemedText type="iata" style={{ textAlign }}>
        {code}
      </ThemedText>
      <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1} style={{ textAlign }}>
        {name}
      </ThemedText>
    </View>
  );
}

function Field({ label, value, grow }: { label: string; value: string; grow?: boolean }) {
  return (
    <View style={[styles.field, grow && { flex: 1 }]}>
      <ThemedText type="field" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold" numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

/** The tear line: dashes between two punched notches in the ground colour. */
function Perforation() {
  const theme = useTheme();
  return (
    <View style={styles.perforation} accessible={false}>
      <View style={[styles.notch, styles.notchLeft, { backgroundColor: theme.background }]} />
      <View style={styles.dashes}>
        {Array.from({ length: 48 }, (_, i) => (
          <View key={i} style={[styles.dash, { backgroundColor: theme.border }]} />
        ))}
      </View>
      <View style={[styles.notch, styles.notchRight, { backgroundColor: theme.background }]} />
    </View>
  );
}

function LineItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.lineItem}>
      <View style={[styles.tick, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <DotLeader />
      <ThemedText type="smallBold" style={{ fontVariant: ['tabular-nums'] }}>
        {money(value)}
      </ThemedText>
    </View>
  );
}

export function formatHours(h: number): string {
  const whole = Math.floor(h);
  const minutes = Math.round(((h - whole) * 60) / 15) * 15;
  if (minutes === 60) return `${whole + 1} h`;
  return minutes ? `${whole} h ${minutes} min` : `${whole} h`;
}

const NOTCH = 16;

const styles = StyleSheet.create({
  pass: { overflow: 'hidden' },
  band: { height: 6, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg },
  body: { padding: Spacing.three, gap: Spacing.three },
  holder: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  route: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingTop: Spacing.two },
  trackLine: { flex: 1, height: 2, borderRadius: 1, opacity: 0.6 },
  fields: { flexDirection: 'row', gap: Spacing.four },
  field: { gap: 2 },
  perforation: { height: NOTCH, justifyContent: 'center' },
  dashes: {
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden',
    marginHorizontal: NOTCH / 2 + Spacing.two,
  },
  dash: { width: 7, height: 1.5, borderRadius: 1 },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2 },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  stub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  breakdown: { gap: 6, paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
  lineItem: { flexDirection: 'row', alignItems: 'center' },
  tick: { width: 7, height: 7, borderRadius: 2, marginRight: Spacing.two },
});
