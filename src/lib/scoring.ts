import { CITIES } from '@/lib/data/cities';
import { getPriceProvider, type PriceProvider } from '@/lib/pricing';
import type { DestinationResult, TravelerCost, Trip } from '@/lib/types';

/**
 * The heart of the app: score every candidate city for a trip and rank them.
 *
 * Two forces pull against each other:
 *  - total group cost (cheapest trip overall), and
 *  - fairness (nobody pays wildly more than the rest because they live
 *    further away).
 *
 * `trip.fairnessWeight` (0..1) blends the two. Blowing someone's budget is
 * penalised multiplicatively so over-budget cities sink regardless of blend.
 */
/** Cost lines for every city: depends on who flies from where, when, for how long, and budgets. */
export type CostGrid = Omit<DestinationResult, 'score'>[];

/**
 * Everything that changes a quote. The ranking mode, filters, vetoes and
 * names don't, so switching mode or ruling a city out never re-prices.
 */
export function pricingKey(trip: Trip, provider: PriceProvider = getPriceProvider()): string {
  return JSON.stringify([
    provider.name,
    trip.month,
    trip.nights,
    trip.travelers.map((t) => [t.id, t.originCode, t.budget ?? 0]),
  ]);
}

const GRID_CACHE_SIZE = 48;
const gridCache = new Map<string, Promise<CostGrid>>();

/** Prices every city for a trip, once per pricing key (cached for the session). */
export function priceGrid(trip: Trip, provider: PriceProvider = getPriceProvider()): Promise<CostGrid> {
  const key = pricingKey(trip, provider);
  let grid = gridCache.get(key);
  if (!grid) {
    grid = buildGrid(trip, provider);
    grid.catch(() => gridCache.delete(key));
    gridCache.set(key, grid);
    if (gridCache.size > GRID_CACHE_SIZE) gridCache.delete(gridCache.keys().next().value!);
  }
  return grid;
}

async function buildGrid(trip: Trip, provider: PriceProvider): Promise<CostGrid> {
  // Quotes are independent, so fetch them together: with a live proxy this is
  // one round of requests instead of 50 × (1 + travelers) in a row.
  return Promise.all(
    CITIES.map(async (city) => {
      const [stay, flights] = await Promise.all([
        provider.stayQuote({
          cityCode: city.code,
          month: trip.month,
          nights: trip.nights,
          travelers: trip.travelers.length,
        }),
        Promise.all(
          trip.travelers.map((traveler) =>
            provider.flightQuote({
              originCode: traveler.originCode,
              destinationCode: city.code,
              month: trip.month,
              nights: trip.nights,
            }),
          ),
        ),
      ]);
      const hotelShare = stay.groupTotal / trip.travelers.length;
      const daily = city.foodDay * trip.nights;

      const perTraveler: TravelerCost[] = trip.travelers.map((traveler, i) => {
        const flight = flights[i];
        const total = Math.round(flight.price + hotelShare + daily);
        return {
          travelerId: traveler.id,
          flight: flight.price,
          hotelShare: Math.round(hotelShare),
          daily: Math.round(daily),
          total,
          isHome: traveler.originCode === city.code,
          overBudget: !!traveler.budget && total > traveler.budget,
        };
      });

      const totals = perTraveler.map((t) => t.total);
      const totalCost = totals.reduce((a, b) => a + b, 0);
      const avgCost = totalCost / totals.length;
      const variance = totals.reduce((a, b) => a + (b - avgCost) ** 2, 0) / totals.length;
      // Coefficient of variation → 0..1 fairness (1 = everyone pays the same).
      const fairness = Math.max(0, 1 - Math.sqrt(variance) / avgCost);

      return {
        cityCode: city.code,
        perTraveler,
        totalCost,
        avgCost: Math.round(avgCost),
        minCost: Math.min(...totals),
        maxCost: Math.max(...totals),
        fairness,
        overBudgetCount: perTraveler.filter((t) => t.overBudget).length,
      };
    }),
  );
}

/** Scores a priced grid for a cost/fairness blend. Synchronous and cheap (< 1 ms). */
export function scoreGrid(grid: CostGrid, fairnessWeight: number): DestinationResult[] {
  const cheapest = Math.min(...grid.map((r) => r.totalCost));
  const w = clamp01(fairnessWeight);

  return grid
    .map((r) => {
      const costScore = cheapest / r.totalCost; // 1 for the cheapest city, <1 otherwise
      const budgetPenalty = 0.7 ** r.overBudgetCount;
      const score = ((1 - w) * costScore + w * r.fairness) * budgetPenalty;
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);
}

export async function rankDestinations(
  trip: Trip,
  provider: PriceProvider = getPriceProvider(),
): Promise<DestinationResult[]> {
  return scoreGrid(await priceGrid(trip, provider), trip.fairnessWeight);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
