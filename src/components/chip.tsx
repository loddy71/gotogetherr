import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Small rounded fact: weather, season, a warning. `tone` tints it without shouting. */
export function Chip({
  label,
  icon,
  tone = 'neutral',
}: {
  label: string;
  icon?: IconName;
  tone?: 'neutral' | 'accent' | 'warning';
}) {
  const theme = useTheme();
  const color =
    tone === 'accent' ? theme.tint : tone === 'warning' ? '#9A6A1C' : theme.textSecondary;

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: tone === 'warning' ? 'rgba(192, 145, 63, 0.14)' : theme.backgroundSelected,
        },
      ]}>
      {icon && <Icon name={icon} size={13} color={color} strokeWidth={2} />}
      <ThemedText type="caption" style={{ color }}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
});
