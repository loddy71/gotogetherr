import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AnimatedNumber } from '@/components/animated-number';
import { Avatar } from '@/components/avatar';
import { BrandMark } from '@/components/brand-mark';
import { Card } from '@/components/card';
import { StackedBar } from '@/components/cost-bar';
import { DotLeader } from '@/components/dot-leader';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { ThemedText } from '@/components/themed-text';
import { Motion, OnPassInk, PassInk, Radius, Spacing, travelerColor } from '@/constants/theme';
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
  count,
  destinationCode,
  month,
  nights,
  open,
  onToggle,
}: {
  traveler: Traveler;
  cost: TravelerCost;
  index: number;
  /** Passes in the stack, for "Pass 1 of 3". */
  count: number;
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
  // Wide passes tear off sideways: stub on the right behind a vertical perforation.
  const [width, setWidth] = useState(0);
  const landscape = width >= 540;

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
      <Card style={styles.pass} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {/* Carrier strip: the mark and the pass number, then the traveler's livery. */}
        <View style={styles.carrier}>
          <BrandMark size={14} dotColor="#FFFFFF" ringColor={PassInk} />
          <ThemedText type="field" style={styles.carrierText}>
            GoTogether · Boarding pass
          </ThemedText>
          <ThemedText type="field" style={[styles.carrierText, { marginLeft: 'auto' }]}>
            {index + 1} of {count}
          </ThemedText>
        </View>
        <View style={[styles.band, { backgroundColor: livery }]} />

        <View style={landscape ? styles.landscape : undefined}>
          <View style={[styles.body, landscape && { flex: 1 }]}>
            <View style={styles.holder}>
              <Avatar name={traveler.name} index={index} size={26} />
              <ThemedText type="defaultBold" numberOfLines={1} style={{ flex: 1 }}>
                {traveler.name}
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

            <View style={[styles.fields, { borderColor: theme.border }]}>
              <Field
                label="Flight"
                value={cost.isHome ? 'Lives here' : formatHours(flightHours(origin.code, destination.code))}
              />
              <View style={[styles.rule, { backgroundColor: theme.border }]} />
              <Field label="Nights" value={String(nights)} />
              <View style={[styles.rule, { backgroundColor: theme.border }]} />
              <Field label="Dates" value={dates} grow />
            </View>
          </View>

          {/* Opened sideways, the stub's bottom edge is no longer the pass edge: no notch. */}
          <Perforation vertical={landscape} edgeNotch={!(landscape && open)} />

          <View style={landscape ? styles.stubSide : styles.stub}>
            <View style={landscape ? undefined : { flex: 1 }}>
              <ThemedText type="field" themeColor="textSecondary">
                Pays · estimate
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
    <View style={[styles.field, grow && { flex: 1, flexShrink: 1 }]}>
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
function Perforation({ vertical = false, edgeNotch = true }: { vertical?: boolean; edgeNotch?: boolean }) {
  const theme = useTheme();
  const notch = [styles.notch, { backgroundColor: theme.background }];
  return (
    <View style={vertical ? styles.perforationV : styles.perforation} accessible={false}>
      {/* Sideways, the top edge is the carrier strip, so only the bottom is punched. */}
      {!vertical && <View style={[notch, styles.notchLeft]} />}
      <View style={vertical ? styles.dashesV : styles.dashes}>
        {Array.from({ length: 48 }, (_, i) => (
          <View key={i} style={[vertical ? styles.dashV : styles.dash, { backgroundColor: theme.borderStrong }]} />
        ))}
      </View>
      {edgeNotch && <View style={[notch, vertical ? styles.notchBottom : styles.notchRight]} />}
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

const NOTCH = 18;
/** The carrier strip is ink in both themes, like a printed pass header. */

const styles = StyleSheet.create({
  pass: { overflow: 'hidden' },
  carrier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: PassInk,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  carrierText: { color: OnPassInk },
  band: { height: 4 },
  landscape: { flexDirection: 'row' },
  body: { padding: Spacing.three, gap: Spacing.three },
  holder: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  route: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingTop: Spacing.two },
  trackLine: { flex: 1, height: 2, borderRadius: 1, opacity: 0.6 },
  // Hairline-ruled cells, as printed on a pass.
  fields: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  field: { gap: 2, paddingVertical: Spacing.two, paddingHorizontal: Spacing.two },
  rule: { width: StyleSheet.hairlineWidth },
  perforation: { height: NOTCH, justifyContent: 'center' },
  perforationV: { width: NOTCH, alignSelf: 'stretch' },
  dashes: {
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden',
    marginHorizontal: NOTCH / 2 + Spacing.two,
  },
  // Absolutely placed so the dashes fill the pass's height instead of setting it.
  dashesV: {
    position: 'absolute',
    top: Spacing.three,
    bottom: NOTCH / 2 + Spacing.two,
    left: (NOTCH - 1.5) / 2,
    gap: 5,
    overflow: 'hidden',
  },
  dash: { width: 7, height: 1.5, borderRadius: 1 },
  dashV: { width: 1.5, height: 7, borderRadius: 1 },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2 },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  notchBottom: { bottom: -NOTCH / 2 },
  stubSide: {
    width: 190,
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
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
