import { Platform, Share } from 'react-native';

import { CITIES } from '@/lib/data/cities';
import { sanitizeFilters } from '@/lib/filters';
import { newId } from '@/lib/format';
import type { Trip } from '@/lib/types';

/**
 * Shareable trip links with no backend: the whole trip is encoded into the
 * URL as base64url JSON. Friends open the link, the /join screen decodes it
 * and saves a local copy they can tweak (add themselves, change budgets).
 */

type SharePayload = {
  v: 1;
  trip: Omit<Trip, 'id' | 'createdAt'>;
};

export function encodeTrip(trip: Trip): string {
  const payload: SharePayload = {
    v: 1,
    trip: {
      name: trip.name,
      month: trip.month,
      nights: trip.nights,
      travelers: trip.travelers,
      fairnessWeight: trip.fairnessWeight,
      filters: trip.filters,
    },
  };
  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeTrip(encoded: string): Trip | null {
  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as SharePayload;
    if (payload.v !== 1) return null;
    const t = payload.trip;
    if (!t || typeof t.name !== 'string' || !Array.isArray(t.travelers)) return null;
    return {
      id: newId(),
      name: t.name,
      month: clampInt(t.month, 1, 12),
      nights: clampInt(t.nights, 1, 21),
      fairnessWeight: Math.min(1, Math.max(0, Number(t.fairnessWeight) || 0.5)),
      filters: sanitizeFilters(t.filters),
      travelers: t.travelers
        .filter((tr) => tr && typeof tr.originCode === 'string' && tr.originCode)
        .map((tr, i) => ({
          id: newId(),
          name: String(tr.name || `Friend ${i + 1}`).slice(0, 40),
          originCode: tr.originCode,
          budget: tr.budget ? clampInt(tr.budget, 1, 1_000_000) : undefined,
          vetoes: Array.isArray(tr.vetoes)
            ? [...new Set(tr.vetoes.filter((c): c is string => typeof c === 'string' && isCityCode(c)))]
            : undefined,
        })),
      createdAt: Date.now(),
    };
  } catch {
    return null;
  }
}

export function tripShareUrl(trip: Trip): string {
  const base =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
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

function clampInt(n: unknown, min: number, max: number): number {
  const v = Math.round(Number(n));
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
}

// ── base64url without btoa/atob (not available in Hermes) ────────────────

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function base64UrlEncode(str: string): string {
  const bytes = utf8Encode(str);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    if (b1 !== undefined) out += B64[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    if (b2 !== undefined) out += B64[b2 & 63];
  }
  return out;
}

function base64UrlDecode(str: string): string {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of str) {
    const value = B64.indexOf(ch);
    if (value < 0) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return utf8Decode(bytes);
}

function utf8Encode(str: string): number[] {
  const bytes: number[] = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else
      bytes.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 63),
        0x80 | ((cp >> 6) & 63),
        0x80 | (cp & 63),
      );
  }
  return bytes;
}

function utf8Decode(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b0 = bytes[i++];
    let cp: number;
    if (b0 < 0x80) cp = b0;
    else if (b0 < 0xe0) cp = ((b0 & 31) << 6) | (bytes[i++] & 63);
    else if (b0 < 0xf0) cp = ((b0 & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
    else
      cp =
        ((b0 & 7) << 18) |
        ((bytes[i++] & 63) << 12) |
        ((bytes[i++] & 63) << 6) |
        (bytes[i++] & 63);
    out += String.fromCodePoint(cp);
  }
  return out;
}

const CITY_CODES = new Set(CITIES.map((c) => c.code));
function isCityCode(code: string): boolean {
  return CITY_CODES.has(code);
}
