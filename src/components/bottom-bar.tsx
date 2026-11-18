import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Floating action area pinned above the home indicator. Liquid glass on
 * iOS 26+; elsewhere the button floats on one soft shadow (no second pill
 * around it, which read as a halo).
 */
export function BottomBar({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const glass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}>
      {glass ? (
        <GlassView style={styles.surface} glassEffectStyle="regular">
          {children}
        </GlassView>
      ) : (
        <View style={[styles.surface, styles.floating, { shadowColor: theme.text }]}>{children}</View>
      )}
    </View>
  );
}

/** Space to leave at the end of a scroll view so content clears the bar. */
export const BOTTOM_BAR_CLEARANCE = 120;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  surface: {
    width: '100%',
    maxWidth: MaxContentWidth - Spacing.four,
    borderRadius: Radius.md,
    padding: 6,
  },
  floating: {
    padding: 0,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(17, 20, 24, 0.12), 0 10px 28px rgba(17, 20, 24, 0.18)' } as object,
      default: {
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }),
  },
});
