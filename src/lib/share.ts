import { Platform, Share } from 'react-native';

import { encodeTrip } from '@/lib/share-codec';
import type { Trip } from '@/lib/types';

export { decodeTrip, encodeTrip } from '@/lib/share-codec';

export function tripShareUrl(trip: Trip): string {
  const base =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin + (process.env.EXPO_PUBLIC_BASE_URL ?? '')
      : (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://gotogether.example');
  return `${base}/join?d=${encodeTrip(trip)}`;
}

/** Share the trip link via the platform share sheet (clipboard fallback on web). */
export async function shareTrip(trip: Trip): Promise<'shared' | 'copied'> {
  const url = tripShareUrl(trip);
  const message = `Help plan "${trip.name}" — see where it's cheapest and fairest for all of us to meet: ${url}`;

  if (Platform.OS === 'web') {
    const nav = navigator as Navigator & { share?: (data: { text: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ text: message });
        return 'shared';
      } catch {
        // fall through to clipboard (user cancelled or share unsupported)
      }
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
  }

  await Share.share({ message });
  return 'shared';
}
