/**
 * Sanity checks for the travel dataset and the price estimator.
 *
 *   npm run check:data
 *
 * 1. Structural checks on every city (codes, coordinates, months, ranges).
 * 2. Fare calibration: the estimator's annual-average return fare on
 *    benchmark routes must land within ±30% of the published typical fare.
 * 3. Seasonality spot checks that the published data makes obvious.
 *
 * Benchmarks were gathered 2026-09-25; sources are listed in
 * docs/DATA_SOURCES.md. Re-verify and update them when refreshing the data.
 */
import { averageHighC, CITIES, getCity, hotelSeasonFactor, weatherFor } from '@/lib/data/cities';
import { hasVibe, passesFilters, restoreCity, sanitizeFilters, toggleVeto, vetoedCities } from '@/lib/filters';
import { flightLinks, hotelLink, isoDate, suggestedDates } from '@/lib/booking';
import { MockPriceProvider } from '@/lib/pricing/mock-provider';
import type { Trip } from '@/lib/types';

/** Typical return economy fare, USD (midpoint of the published range). */
const FARE_BENCHMARKS: { from: string; to: string; usd: number }[] = [
  { from: 'LON', to: 'BCN', usd: 120 }, // typical $68–175
  { from: 'NYC', to: 'LAX', usd: 385 }, // 12-month average $385
  { from: 'LON', to: 'NYC', usd: 620 }, // typical $494–799
  { from: 'LON', to: 'BKK', usd: 928 }, // average $928
  { from: 'NYC', to: 'TYO', usd: 1265 }, // average $1,265 (typical $1,060–1,535)
  { from: 'LON', to: 'SYD', usd: 1300 }, // typical £772–1,169
  { from: 'LAX', to: 'SYD', usd: 1010 }, // typical $852–1,168
];
const FARE_TOLERANCE = 0.3;

const failures: string[] = [];
const check = (ok: boolean, message: string) => {
  if (!ok) failures.push(message);
};

// ── 1. Structure ─────────────────────────────────────────────────────────
const codes = new Set<string>();
for (const c of CITIES) {
  const at = `${c.code} (${c.name})`;
  check(/^[A-Z]{3}$/.test(c.code), `${at}: code must be a 3-letter IATA code`);
  check(!codes.has(c.code), `${at}: duplicate code`);
  codes.add(c.code);
  check(Math.abs(c.lat) <= 90 && Math.abs(c.lon) <= 180, `${at}: coordinates out of range`);
  check(c.hub >= 0.75 && c.hub <= 1.15, `${at}: hub factor ${c.hub} looks wrong`);
  check(c.hotelNight >= 50 && c.hotelNight <= 500, `${at}: hotelNight ${c.hotelNight} out of range`);
  check(c.foodDay >= 20 && c.foodDay <= 150, `${at}: foodDay ${c.foodDay} out of range`);
  check(c.swing >= 0 && c.swing <= 0.5, `${at}: swing ${c.swing} out of range`);
  check(c.highC[0] >= -15 && c.highC[1] <= 45, `${at}: implausible temperatures`);
  const months = [...c.peak, ...c.low, ...(c.wet?.months ?? [])];
  check(months.every((m) => Number.isInteger(m) && m >= 1 && m <= 12), `${at}: month out of 1–12`);
  check(!c.peak.some((m) => c.low.includes(m)), `${at}: a month is both peak and low`);
  check(c.vibes.length >= 2, `${at}: needs at least two vibes`);
}

// ── 2. Fare calibration ──────────────────────────────────────────────────
async function fareReport(): Promise<string[]> {
  const provider = new MockPriceProvider();
  const report: string[] = [];
  for (const b of FARE_BENCHMARKS) {
    let sum = 0;
    for (let month = 1; month <= 12; month++) {
      const q = await provider.flightQuote({
        originCode: b.from,
        destinationCode: b.to,
        month,
        nights: 3,
      });
      sum += q.price;
    }
    const annual = Math.round(sum / 12);
    const off = annual / b.usd - 1;
    const pct = `${off >= 0 ? '+' : ''}${Math.round(off * 100)}%`;
    report.push(`  ${b.from}–${b.to}  model $${annual}  benchmark $${b.usd}  ${pct}`);
    check(Math.abs(off) <= FARE_TOLERANCE, `${b.from}–${b.to}: model $${annual} vs benchmark $${b.usd}`);
  }
  return report;
}

// ── 3. Seasonality spot checks ───────────────────────────────────────────
const nyc = getCity('NYC');
check(
  hotelSeasonFactor(nyc, 12) / hotelSeasonFactor(nyc, 1) > 2,
  'NYC: December rooms should cost over twice January (published $541 vs $196)',
);
const dxb = getCity('DXB');
check(hotelSeasonFactor(dxb, 7) < hotelSeasonFactor(dxb, 1), 'DXB: summer should be low season');
const bue = getCity('BUE');
check(hotelSeasonFactor(bue, 7) < hotelSeasonFactor(bue, 1), 'BUE: July is southern winter');
check(weatherFor(getCity('BOM'), 7).hazard === 'Monsoon', 'BOM: July must flag the monsoon');
check(weatherFor(dxb, 7).hazard === 'Extreme heat', 'DXB: July must flag extreme heat');
check(weatherFor(dxb, 9).hazard === 'Extreme heat', 'DXB: September is still ~39°C (normal)');
check(weatherFor(dxb, 11).hazard === undefined, 'DXB: November is fine');
const lon = getCity('LON');
check(averageHighC(lon, 1) === 8 && averageHighC(lon, 7) === 24, 'LON: Jan/Jul must equal the stored normals');
check(averageHighC(lon, 8) >= 23, 'LON: August stays warm (normal ~23.6°C)');

// ── Booking hand-off ─────────────────────────────────────────────────────
{
  const today = new Date(2026, 8, 25);
  const oct = suggestedDates(10, 3, today);
  check(oct.depart.getDay() === 5 && isoDate(oct.depart) === '2026-10-09', 'dates: second Friday of Oct 2026');
  check(isoDate(oct.return) === '2026-10-12', 'dates: return = depart + nights');
  check(suggestedDates(9, 2, today).depart.getFullYear() === 2027, 'dates: a passed month rolls to next year');
  const kayak = flightLinks('LON', 'NYC', oct)[0].url;
  check(kayak === 'https://www.kayak.com/flights/LON-NYC/2026-10-09/2026-10-12/', `kayak url: ${kayak}`);
  const hotel = new URL(hotelLink('BCN', oct, 3).url);
  check(
    hotel.searchParams.get('group_adults') === '3' && hotel.searchParams.get('no_rooms') === '2',
    'hotel link: 3 adults need 2 rooms',
  );
}

// ── 4. Filters ───────────────────────────────────────────────────────────
check(hasVibe(getCity('BCN'), 'beach', 7) && !hasVibe(getCity('PRG'), 'beach', 7), 'beach: BCN yes, PRG no');
check(!hasVibe(getCity('STO'), 'beach', 7), 'beach: Stockholm has islands, not beaches');
check(!hasVibe(getCity('ATH'), 'beach', 1), 'beach: Athens in January is not beach weather');
check(hasVibe(getCity('SYD'), 'beach', 1), 'beach: Sydney in January is');
check(hasVibe(getCity('SYD'), 'warm', 1) && !hasVibe(getCity('LON'), 'warm', 1), 'warm: Sydney in Jan, not London');
const trip = (month: number, origins: string[]): Trip => ({
  id: 't',
  name: 't',
  month,
  nights: 3,
  fairnessWeight: 0.5,
  createdAt: 0,
  travelers: origins.map((originCode, i) => ({ id: String(i), name: String(i), originCode })),
});
check(!passesFilters(trip(7, ['LON', 'NYC']), 'BOM'), 'bad weather: Mumbai hidden in July (monsoon)');
check(passesFilters(trip(11, ['LON', 'NYC']), 'BOM'), 'bad weather: Mumbai fine in November');
check(
  !passesFilters(trip(10, ['LON', 'NYC']), 'TYO', { vibes: [], maxFlightHours: 8, avoidBadWeather: true }),
  'flight limit: New York–Tokyo exceeds 8 h',
);
const group = trip(10, ['LON', 'NYC']);
const vetoed = toggleVeto(group, '0', 'LIS');
check(!passesFilters(vetoed, 'LIS') && passesFilters(group, 'LIS'), 'veto: one veto removes a city');
check(vetoedCities(vetoed).length === 1 && vetoedCities(vetoed)[0].by[0].id === '0', 'veto: listed with who');
check(passesFilters(toggleVeto(vetoed, '0', 'LIS'), 'LIS'), 'veto: toggling again restores');
check(passesFilters(restoreCity(toggleVeto(vetoed, '1', 'LIS'), 'LIS'), 'LIS'), 'veto: restore clears all');
const clean = sanitizeFilters({ vibes: ['beach', 'nope', 'beach'], maxFlightHours: 7, avoidBadWeather: 'x' });
check(
  JSON.stringify(clean) === JSON.stringify({ vibes: ['beach'], maxFlightHours: null, avoidBadWeather: true }),
  `sanitizeFilters drops unknown values (got ${JSON.stringify(clean)})`,
);

fareReport().then((report) => {
  console.log(`Checked ${CITIES.length} cities.`);
  console.log(`Fare calibration (annual average):\n${report.join('\n')}`);
  if (failures.length) {
    console.error(`\n${failures.length} data check(s) failed:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log('\nDATA OK');
});
