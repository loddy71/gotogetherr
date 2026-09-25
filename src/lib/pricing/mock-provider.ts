import { getCity, hotelSeasonFactor, seasonOf } from '@/lib/data/cities';

import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Deterministic price estimator. Same inputs always produce the same quote,
 * so rankings are stable across devices and reloads without a backend.
 *
 * Calibrated 2026-09 against published typical return economy fares on
 * benchmark routes (see docs/DATA_SOURCES.md and scripts/check-data.ts).
 */

const EARTH_RADIUS_KM = 6371;

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Typical return economy fare, USD, before airport competitiveness and
 * season. Per-km rates by distance band:
 *
 * - up to 1,500 km: short-haul, where low-cost carriers compete hard
 * - 1,500–3,000 km: still mostly narrowbody, cheaper per km
 * - 3,000–5,500 km: the step up to long-haul widebody routes (ocean
 *   crossings), where fares jump
 * - beyond 5,500 km: each extra km adds comparatively little
 */
export function baseFare(km: number): number {
  const band = (from: number, to: number, rate: number) =>
    Math.max(0, Math.min(km, to) - from) * rate;
  return (
    60 +
    band(0, 1500, 0.1) +
    band(1500, 3000, 0.08) +
    band(3000, 5500, 0.2) +
    band(5500, Infinity, 0.08)
  );
}

/**
 * Routes between the Americas and North/East Asia price above what distance
 * alone predicts (few low-cost or Gulf-carrier alternatives). Oceania is
 * excluded: LA–Sydney is contested enough to price like any long-haul.
 */
export function isTranspacificToAsia(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): boolean {
  const americas = (c: { lon: number }) => c.lon < -30;
  const eastAsia = (c: { lat: number; lon: number }) => c.lon > 95 && c.lat > 10;
  return (americas(a) && eastAsia(b)) || (americas(b) && eastAsia(a));
}

/** Global demand: northern summer and the Christmas holidays run hot. */
const GLOBAL_DEMAND = [0.92, 0.92, 1, 1, 1, 1.08, 1.15, 1.12, 0.95, 1, 0.92, 1.15];

export function flightSeasonFactor(destinationCode: string, month: number): number {
  const season = seasonOf(getCity(destinationCode), month);
  const local = season === 'peak' ? 1.08 : season === 'low' ? 0.93 : 1;
  return GLOBAL_DEMAND[month - 1] * local;
}

/** Hours in the air on a direct routing, including taxi and climb. */
export function flightHours(originCode: string, destinationCode: string): number {
  if (originCode === destinationCode) return 0;
  const a = getCity(originCode);
  const b = getCity(destinationCode);
  return distanceKm(a.lat, a.lon, b.lat, b.lon) / 820 + 0.6;
}

/** Small stable hash → 0..1, used for per-route jitter. */
function hash01(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export class MockPriceProvider implements PriceProvider {
  readonly name = 'estimate';

  async flightQuote(q: FlightQuery): Promise<FlightQuote> {
    if (q.originCode === q.destinationCode) return { price: 0, source: this.name };

    const origin = getCity(q.originCode);
    const dest = getCity(q.destinationCode);
    const km = distanceKm(origin.lat, origin.lon, dest.lat, dest.lon);

    let price = baseFare(km);
    if (isTranspacificToAsia(origin, dest)) price *= 1.2;
    price *= origin.hub * dest.hub;
    price *= flightSeasonFactor(q.destinationCode, q.month);
    // ±8% route jitter, stable for a given route + month.
    price *= 0.92 + 0.16 * hash01(`${q.originCode}-${q.destinationCode}-${q.month}`);

    return { price: Math.round(price), source: this.name };
  }

  async stayQuote(q: StayQuery): Promise<StayQuote> {
    const city = getCity(q.cityCode);
    const rooms = Math.max(1, Math.ceil(q.travelers / 2));
    const nightly = city.hotelNight * hotelSeasonFactor(city, q.month);
    const groupTotal = Math.round(nightly * q.nights * rooms);
    return { groupTotal, rooms, source: this.name };
  }
}
