import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { MedalGradients } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Podium medal for ranks 1–3, quiet numbered circle for the rest. */
export function RankMedal({ rank }: { rank: number }) {
  const theme = useTheme();
  const medal = MedalGradients[rank - 1];

  if (!medal) {
    return (
      <View style={[styles.circle, { backgroundColor: theme.backgroundSelected }]}>
        <Text style={[styles.number, { color: theme.textSecondary }]}>{rank}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={medal}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.circle}>
      <Text style={[styles.number, { color: '#3D2E00' }]}>{rank}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 13,
    fontWeight: '800',
  },
});
