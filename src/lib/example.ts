import { newId } from '@/lib/format';
import type { Trip } from '@/lib/types';

/** A ready-made trip for first-time visitors: three friends on three continents. */
export function exampleTrip(today = new Date()): Trip {
  return {
    id: newId(),
    name: 'Example: the reunion',
    // Next month, so the suggested dates are in the future.
    month: ((today.getMonth() + 1) % 12) + 1,
    nights: 3,
    fairnessWeight: 0.5,
    createdAt: Date.now(),
    travelers: [
      { id: newId(), name: 'Maya', originCode: 'LON' },
      { id: newId(), name: 'Sam', originCode: 'NYC' },
      { id: newId(), name: 'Kenji', originCode: 'TYO' },
    ],
  };
}
