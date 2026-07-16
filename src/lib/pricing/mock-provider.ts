import { getCity } from '@/lib/data/cities';

import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Deterministic price estimator. Same inputs always produce the same quote,
 * so rankings are stable across devices and reloads without a backend.
 *
 * Flight model: distance-banded per-km rates (short-haul is expensive per km,
 * long-haul cheapens out), scaled by how competitive each airport is (hub
 * factor), the travel month, and a small route-specific jitter so results
 * don't look artificially smooth.
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

/** June–August and December run hot; deep winter runs cold. */
export function seasonFactor(month: number): number {
  if (month === 6 || month === 7 || month === 8 || month === 12) return 1.15;
  if (month === 1 || month === 2 || month === 11) return 0.9;
  return 1.0;
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

    const shortHaul = Math.min(km, 1500);
    const midHaul = Math.max(0, Math.min(km, 6000) - 1500);
    const longHaul = Math.max(0, km - 6000);
    let price = 45 + 0.11 * shortHaul + 0.075 * midHaul + 0.05 * longHaul;

    price *= origin.hub * dest.hub;
    price *= seasonFactor(q.month);
    // ±8% route jitter, stable for a given route + month.
    price *= 0.92 + 0.16 * hash01(`${q.originCode}-${q.destinationCode}-${q.month}`);

    return { price: Math.round(price), source: this.name };
  }

  async stayQuote(q: StayQuery): Promise<StayQuote> {
    const city = getCity(q.cityCode);
    const rooms = Math.max(1, Math.ceil(q.travelers / 2));
    const groupTotal = Math.round(city.hotelNight * seasonFactor(q.month) * q.nights * rooms);
    return { groupTotal, rooms, source: this.name };
  }
}
