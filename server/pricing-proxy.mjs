/**
 * Minimal pricing proxy for GoTogether — wraps the Amadeus Self-Service APIs
 * so the API key never ships in the app bundle.
 *
 * Usage:
 *   AMADEUS_CLIENT_ID=xxx AMADEUS_CLIENT_SECRET=yyy node server/pricing-proxy.mjs
 *   # then start the app with:
 *   EXPO_PUBLIC_PRICE_PROXY_URL=http://localhost:8787 npx expo start
 *
 * Endpoints (all return JSON {price} in USD):
 *   GET /flight?origin=LON&dest=BCN&month=6&nights=3   → cheapest return fare, per person
 *   GET /stay?city=BCN&month=6&nights=3                → median hotel price per room-night
 *
 * Env:
 *   AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET  (required)
 *   AMADEUS_ENV=production                     (default: test sandbox)
 *   PORT=8787
 *
 * Notes: responses are cached in-memory for 24h per route+month. The free
 * Amadeus test tier is rate-limited and only covers a subset of routes —
 * the app falls back to its estimator per-route on any error, so partial
 * coverage is fine.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);
const BASE =
  process.env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET (see https://developers.amadeus.com).');
  process.exit(1);
}

const DAY_MS = 86_400_000;
const cache = new Map(); // key → {value, expires}

let tokenPromise = null;
let tokenExpires = 0;

async function getToken() {
  if (!tokenPromise || Date.now() > tokenExpires) {
    tokenPromise = (async () => {
      const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
      });
      if (!res.ok) throw new Error(`token request failed: ${res.status}`);
      const body = await res.json();
      tokenExpires = Date.now() + (body.expires_in - 60) * 1000;
      return body.access_token;
    })();
    tokenPromise.catch(() => {
      tokenPromise = null;
    });
  }
  return tokenPromise;
}

async function amadeus(path, params) {
  const token = await getToken();
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

/** ~6 weeks out, inside the requested month (next occurrence of that month). */
function travelDates(month, nights) {
  const now = new Date();
  let year = now.getFullYear();
  if (month - 1 < now.getMonth() || (month - 1 === now.getMonth() && now.getDate() > 10)) year++;
  const depart = new Date(Date.UTC(year, month - 1, 15));
  const ret = new Date(depart.getTime() + nights * DAY_MS);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { depart: iso(depart), ret: iso(ret) };
}

async function flightPrice(origin, dest, month, nights) {
  const { depart, ret } = travelDates(month, nights);
  const body = await amadeus('/v2/shopping/flight-offers', {
    originLocationCode: origin,
    destinationLocationCode: dest,
    departureDate: depart,
    returnDate: ret,
    adults: 1,
    currencyCode: 'USD',
    max: 5,
  });
  const prices = (body.data ?? []).map((offer) => Number(offer.price?.grandTotal)).filter(Number.isFinite);
  if (!prices.length) throw new Error(`no offers for ${origin}-${dest}`);
  return Math.round(Math.min(...prices));
}

async function stayPricePerNight(city, month, nights) {
  const hotels = await amadeus('/v1/reference-data/locations/hotels/by-city', {
    cityCode: city,
    radius: 20,
    radiusUnit: 'KM',
  });
  const hotelIds = (hotels.data ?? []).slice(0, 20).map((h) => h.hotelId);
  if (!hotelIds.length) throw new Error(`no hotels for ${city}`);

  const { depart, ret } = travelDates(month, nights);
  const offers = await amadeus('/v3/shopping/hotel-offers', {
    hotelIds: hotelIds.join(','),
    checkInDate: depart,
    checkOutDate: ret,
    adults: 2,
    roomQuantity: 1,
    currency: 'USD',
    bestRateOnly: true,
  });
  const nightly = (offers.data ?? [])
    .map((h) => Number(h.offers?.[0]?.price?.total) / nights)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!nightly.length) throw new Error(`no hotel offers for ${city}`);
  return Math.round(nightly[Math.floor(nightly.length / 2)]);
}

async function handle(url) {
  const p = url.searchParams;
  const month = Math.min(12, Math.max(1, Number(p.get('month')) || 6));
  const nights = Math.min(21, Math.max(1, Number(p.get('nights')) || 3));

  if (url.pathname === '/flight') {
    const origin = (p.get('origin') ?? '').toUpperCase();
    const dest = (p.get('dest') ?? '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(dest)) throw new Error('bad origin/dest');
    return { price: await flightPrice(origin, dest, month, nights) };
  }
  if (url.pathname === '/stay') {
    const city = (p.get('city') ?? '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(city)) throw new Error('bad city');
    return { price: await stayPricePerNight(city, month, nights) };
  }
  if (url.pathname === '/health') return { ok: true };
  throw new Error('unknown endpoint');
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const key = url.pathname + url.search;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) {
    res.end(JSON.stringify(hit.value));
    return;
  }

  try {
    const value = await handle(url);
    cache.set(key, { value, expires: Date.now() + DAY_MS });
    res.end(JSON.stringify(value));
  } catch (err) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: String(err.message ?? err) }));
  }
}).listen(PORT, () => {
  console.log(`GoTogether pricing proxy on http://localhost:${PORT} (${BASE})`);
});
