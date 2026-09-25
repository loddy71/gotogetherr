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
import { CITIES, getCity, hotelSeasonFactor, weatherFor } from '@/lib/data/cities';
import { MockPriceProvider } from '@/lib/pricing/mock-provider';

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

fareReport().then((report) => {
  console.log(`Checked ${CITIES.length} cities.`);
  console.log(`Fare calibration (annual average):\n${report.join('\n')}`);
  if (failures.length) {
    console.error(`\n${failures.length} data check(s) failed:\n- ${failures.join('\n- ')}`);
    process.exit(1);
  }
  console.log('\nDATA OK');
});
