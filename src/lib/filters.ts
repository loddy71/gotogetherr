import { averageHighC, CITIES, getCity, weatherFor, type City } from '@/lib/data/cities';
import { flightHours } from '@/lib/pricing/mock-provider';
import type { DestinationResult, Traveler, Trip, TripFilters, VibeKey } from '@/lib/types';

/**
 * Narrowing the ranking to cities the group would actually go to. Vibes map
 * onto the free-form tags in the city dataset; "warm" comes from climate
 * data for the trip month rather than a tag.
 */

export const VIBES: { key: VibeKey; label: string; tags?: string[] }[] = [
  { key: 'beach', label: 'Beach', tags: ['beach', 'sun'] },
  { key: 'nightlife', label: 'Nightlife', tags: ['nightlife', 'pubs', 'beer', 'shows', 'tango'] },
  {
    key: 'culture',
    label: 'Culture',
    tags: ['history', 'museums', 'art', 'culture', 'temples', 'architecture', 'design', 'fashion', 'music'],
  },
  {
    key: 'nature',
    label: 'Nature',
    tags: ['nature', 'hiking', 'mountains', 'hot springs', 'desert', 'wine', 'wellness'],
  },
  { key: 'warm', label: 'Warm, 25°C+' },
];

export const WARM_THRESHOLD_C = 25;
/** A beach city only counts as a beach trip in beach weather. */
export const BEACH_THRESHOLD_C = 23;

/** Offered limits on the longest flight anyone takes, in hours. */
export const FLIGHT_LIMITS = [5, 8, 12] as const;

export const DEFAULT_FILTERS: TripFilters = {
  vibes: [],
  maxFlightHours: null,
  avoidBadWeather: true,
};

export function filtersOf(trip: Trip): TripFilters {
  return { ...DEFAULT_FILTERS, ...trip.filters };
}

export function hasVibe(city: City, vibe: VibeKey, month: number): boolean {
  if (vibe === 'warm') return averageHighC(city, month) >= WARM_THRESHOLD_C;
  const tags = VIBES.find((v) => v.key === vibe)?.tags ?? [];
  const tagged = city.vibes.some((t) => tags.includes(t));
  if (vibe === 'beach') return tagged && averageHighC(city, month) >= BEACH_THRESHOLD_C;
  return tagged;
}

export function longestFlightHours(trip: Trip, cityCode: string): number {
  return Math.max(0, ...trip.travelers.map((t) => flightHours(t.originCode, cityCode)));
}

/** Travelers who have ruled this city out. */
export function vetoedBy(trip: Trip, cityCode: string): Traveler[] {
  return trip.travelers.filter((t) => t.vetoes?.includes(cityCode));
}

/** Every vetoed city, in dataset order, with who ruled it out. */
export function vetoedCities(trip: Trip): { cityCode: string; by: Traveler[] }[] {
  return CITIES.map((c) => ({ cityCode: c.code, by: vetoedBy(trip, c.code) })).filter(
    (v) => v.by.length > 0,
  );
}

/** Toggle one traveler's veto on a city; returns the updated trip. */
export function toggleVeto(trip: Trip, travelerId: string, cityCode: string): Trip {
  return {
    ...trip,
    travelers: trip.travelers.map((t) => {
      if (t.id !== travelerId) return t;
      const vetoes = t.vetoes ?? [];
      return {
        ...t,
        vetoes: vetoes.includes(cityCode)
          ? vetoes.filter((c) => c !== cityCode)
          : [...vetoes, cityCode],
      };
    }),
  };
}

/** Clear every veto on a city. */
export function restoreCity(trip: Trip, cityCode: string): Trip {
  return {
    ...trip,
    travelers: trip.travelers.map((t) =>
      t.vetoes?.includes(cityCode) ? { ...t, vetoes: t.vetoes.filter((c) => c !== cityCode) } : t,
    ),
  };
}

export function passesFilters(trip: Trip, cityCode: string, filters = filtersOf(trip)): boolean {
  if (vetoedBy(trip, cityCode).length > 0) return false;
  const city = getCity(cityCode);
  if (!filters.vibes.every((v) => hasVibe(city, v, trip.month))) return false;
  if (filters.maxFlightHours !== null && longestFlightHours(trip, cityCode) > filters.maxFlightHours) {
    return false;
  }
  if (filters.avoidBadWeather && weatherFor(city, trip.month).hazard) return false;
  return true;
}

/** Ranked results with the trip's filters applied; order is preserved. */
export function applyFilters(trip: Trip, results: DestinationResult[]): DestinationResult[] {
  const filters = filtersOf(trip);
  return results.filter((r) => passesFilters(trip, r.cityCode, filters));
}

/** Short labels for the filters that differ from the defaults. */
export function describeFilters(filters: TripFilters): string[] {
  const labels = filters.vibes.map((v) => VIBES.find((x) => x.key === v)?.label ?? v);
  if (filters.maxFlightHours !== null) labels.push(`Flights ≤ ${filters.maxFlightHours} h`);
  if (!filters.avoidBadWeather) labels.push('Any weather');
  return labels;
}

/** Validates filters from an untrusted source (share links, storage). */
export function sanitizeFilters(raw: unknown): TripFilters | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const r = raw as Partial<Record<keyof TripFilters, unknown>>;
  const known = new Set(VIBES.map((v) => v.key));
  const vibes = Array.isArray(r.vibes)
    ? [...new Set(r.vibes.filter((v): v is VibeKey => known.has(v as VibeKey)))]
    : [];
  const maxFlightHours = FLIGHT_LIMITS.includes(r.maxFlightHours as (typeof FLIGHT_LIMITS)[number])
    ? (r.maxFlightHours as number)
    : null;
  const avoidBadWeather = typeof r.avoidBadWeather === 'boolean' ? r.avoidBadWeather : true;
  return { vibes, maxFlightHours, avoidBadWeather };
}
