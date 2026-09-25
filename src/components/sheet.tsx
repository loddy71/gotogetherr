import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { MaxContentWidth, Motion, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Draggable header (title, search). Dragging it down dismisses the sheet. */
  header?: ReactNode;
  children: ReactNode;
  /** Fraction of the window height. */
  heightRatio?: number;
};

/**
 * Bottom sheet that springs up over a fading scrim. Drag the header down
 * (or flick it) to dismiss; tap the scrim to close.
 */
export function Sheet({ visible, onClose, header, children, heightRatio = 0.88 }: SheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = Math.round(windowHeight * heightRatio);

  const [mounted, setMounted] = useState(visible);
  // Mount as soon as we're asked to show; unmount only after the exit animation.
  if (visible && !mounted) setMounted(true);

  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      dragY.set(0);
      progress.set(withSpring(1, Motion.glide));
    } else {
      progress.set(
        withTiming(0, { duration: 220, easing: Motion.ease }, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, progress, dragY]);

  const drag = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((e) => {
      dragY.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > sheetHeight * 0.22 || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        dragY.set(withSpring(0, Motion.glide));
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetHeight + dragY.value }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity:
      progress.value * interpolate(dragY.value, [0, sheetHeight], [1, 0.2], Extrapolation.CLAMP),
  }));

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.scrim }, scrimStyle]}>
          <Pressable
            accessibilityLabel="Close"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, backgroundColor: theme.background, paddingBottom: insets.bottom },
            sheetStyle,
          ]}>
          <GestureDetector gesture={drag}>
            <View style={styles.header}>
              <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />
              {header}
            </View>
          </GestureDetector>
          <View style={{ flex: 1 }}>{children}</View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    borderTopLeftRadius: Radius.lg + 6,
    borderTopRightRadius: Radius.lg + 6,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 5,
    borderRadius: 3,
    marginTop: Spacing.two + 2,
  },
});
