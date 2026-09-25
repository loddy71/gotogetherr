import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticKind = 'light' | 'selection' | 'success';

/**
 * Fire-and-forget haptic feedback. Skipped on web, where the Vibration API
 * buzzes the whole phone — too heavy for a button press.
 */
export function haptic(kind: HapticKind = 'light') {
  if (Platform.OS === 'web') return;
  const run =
    kind === 'selection'
      ? Haptics.selectionAsync()
      : kind === 'success'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  run.catch(() => {});
}
