import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Floating action area pinned above the home indicator. Liquid glass on
 * iOS 26+, frosted paper on the web, plain paper elsewhere.
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
        <View
          style={[
            styles.surface,
            styles.paper,
            { backgroundColor: `${theme.background}E6`, borderColor: theme.border },
          ]}>
          {children}
        </View>
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
    borderRadius: Radius.pill,
    padding: 6,
  },
  paper: {
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        boxShadow: '0 10px 30px rgba(40, 30, 20, 0.12)',
      } as object,
      default: {
        shadowColor: '#281E14',
        shadowOpacity: 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }),
  },
});
