import * as WebBrowser from 'expo-web-browser';
import { Platform, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { flightLinks, formatDateRange, hotelLink, suggestedDates } from '@/lib/booking';
import { getCity } from '@/lib/data/cities';
import type { Traveler } from '@/lib/types';

function open(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  WebBrowser.openBrowserAsync(url).catch(() => {});
}

/**
 * Hand-off from estimates to real prices: suggested dates for the trip
 * month, a flight search per traveler and one hotel search for the group.
 */
export function LivePricesCard({
  cityCode,
  month,
  nights,
  travelers,
}: {
  cityCode: string;
  month: number;
  nights: number;
  travelers: Traveler[];
}) {
  const city = getCity(cityCode);
  const dates = suggestedDates(month, nights);
  const hotel = hotelLink(cityCode, dates, travelers.length);
  const rooms = Math.max(1, Math.ceil(travelers.length / 2));

  return (
    <Card style={styles.card}>
      <View style={{ gap: 2 }}>
        <ThemedText type="label" themeColor="textSecondary">
          Check live prices
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Suggested dates: <ThemedText type="smallBold">{formatDateRange(dates)}</ThemedText>{' '}
          ({nights} {nights === 1 ? 'night' : 'nights'}). The figures above are estimates;
          these open real searches.
        </ThemedText>
      </View>

      {travelers.map((t, i) => {
        const home = t.originCode === cityCode;
        return (
          <View key={t.id} style={styles.row}>
            <Avatar name={t.name} index={i} size={28} />
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">{t.name}</ThemedText>
              <ThemedText type="caption" themeColor="textSecondary">
                {home ? 'Lives here, no flight' : `${getCity(t.originCode).name} → ${city.name}`}
              </ThemedText>
            </View>
            {!home &&
              flightLinks(t.originCode, cityCode, dates).map((link) => (
                <Button
                  key={link.label}
                  title={link.label}
                  size="small"
                  variant="secondary"
                  accessibilityLabel={`${link.label} flights for ${t.name}`}
                  onPress={() => open(link.url)}
                />
              ))}
          </View>
        );
      })}

      <Button
        title={`Hotels on ${hotel.label} · ${rooms} ${rooms === 1 ? 'room' : 'rooms'}`}
        accessibilityLabel={`Search hotels in ${city.name} on ${hotel.label}`}
        onPress={() => open(hotel.url)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
