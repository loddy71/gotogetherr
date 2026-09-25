import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { travelerColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Initials on the traveler's ink colour — the same colour they carry through every chart. */
export function Avatar({ name, index, size = 30 }: { name: string; index: number; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: travelerColor(index) },
      ]}>
      <ThemedText
        type="smallBold"
        style={{ color: '#FCFAF6', fontSize: size * 0.38, lineHeight: size * 0.5 }}>
        {initials(name)}
      </ThemedText>
    </View>
  );
}

export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  const theme = useTheme();
  return (
    <View style={styles.stack}>
      {names.map((name, i) => (
        <View
          key={`${name}-${i}`}
          style={{
            marginLeft: i === 0 ? 0 : -size * 0.28,
            borderRadius: size,
            borderWidth: 2,
            borderColor: theme.card,
          }}>
          <Avatar name={name} index={i} size={size} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
