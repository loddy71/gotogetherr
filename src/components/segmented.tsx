import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Tabs marked by an inked rule under the active option — a printed index,
 * not a pill switch.
 */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { borderBottomColor: theme.border }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              { borderBottomColor: selected ? theme.tint : 'transparent' },
              pressed && { opacity: 0.6 },
            ]}>
            <ThemedText
              type="label"
              style={{ color: selected ? theme.tint : theme.textSecondary }}
              numberOfLines={1}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  segment: {
    paddingVertical: Spacing.two + 2,
    paddingRight: Spacing.four,
    marginBottom: -1,
    borderBottomWidth: 2,
  },
});
