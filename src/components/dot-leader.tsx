import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Leader dots that stretch between a label and its figure, like a receipt. */
export function DotLeader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, marginHorizontal: 6, transform: [{ translateY: -3 }] }}>
      <View style={{ borderTopWidth: 1, borderStyle: 'dotted', borderColor: theme.border }} />
    </View>
  );
}
