import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { FLAG_SVGS } from '@/lib/data/flags';

/** ISO 3166-1 alpha-2 from a flag emoji (two regional-indicator letters). */
export function flagIso(emoji: string): string {
  return [...emoji].map((ch) => String.fromCharCode((ch.codePointAt(0) ?? 0) - 0x1f1e6 + 65)).join('');
}

/**
 * A country flag drawn as SVG, so it renders the same everywhere (emoji
 * flags show as letter pairs on Windows). Decorative: the country name is
 * always written next to it.
 */
export function Flag({ emoji, width = 20 }: { emoji: string; width?: number }) {
  const theme = useTheme();
  const xml = FLAG_SVGS[flagIso(emoji)];
  const height = Math.round((width * 2) / 3);
  if (!xml) return null;
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width, height, borderColor: theme.border }]}>
      <SvgXml xml={xml} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 2, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth },
});
