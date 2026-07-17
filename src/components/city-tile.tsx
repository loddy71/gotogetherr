import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

import { cityGradient } from '@/constants/theme';
import type { City } from '@/lib/data/cities';

/** Gradient square with the city's flag — gives each destination an identity. */
export function CityTile({ city, size = 48 }: { city: City; size?: number }) {
  return (
    <LinearGradient
      colors={cityGradient(city.vibes, city.code)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tile, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Text style={{ fontSize: size * 0.5 }}>{city.flag}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
