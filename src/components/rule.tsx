import { View, type ViewStyle } from 'react-native';

import { Hairline } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RuleProps = {
  /** 'hair' for list separators, 'strong' under section heads, 'dashed' for ticket tears. */
  weight?: 'hair' | 'strong' | 'dashed';
  style?: ViewStyle;
};

/** Horizontal rule — the app's main structural device in place of card shadows. */
export function Rule({ weight = 'hair', style }: RuleProps) {
  const theme = useTheme();

  if (weight === 'dashed') {
    return (
      <View
        style={[
          {
            borderTopWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.border,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: weight === 'strong' ? 1 : Hairline,
          backgroundColor: weight === 'strong' ? theme.borderStrong : theme.border,
        },
        style,
      ]}
    />
  );
}

/** Leader dots that stretch between a label and its figure, like a receipt. */
export function DotLeader() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, marginHorizontal: 6, transform: [{ translateY: -3 }] }}>
      <View style={{ borderTopWidth: 1, borderStyle: 'dotted', borderColor: theme.border }} />
    </View>
  );
}
