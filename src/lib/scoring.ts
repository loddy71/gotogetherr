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
export async function rankDestinations(
  trip: Trip,
  provider: PriceProvider = getPriceProvider(),
): Promise<DestinationResult[]> {
  const results: Omit<DestinationResult, 'score'>[] = [];

  for (const city of CITIES) {
    const stay = await provider.stayQuote({
      cityCode: city.code,
      month: trip.month,
      nights: trip.nights,
      travelers: trip.travelers.length,
    });
    const hotelShare = stay.groupTotal / trip.travelers.length;
    const daily = city.foodDay * trip.nights;

    const perTraveler: TravelerCost[] = [];
    for (const traveler of trip.travelers) {
      const flight = await provider.flightQuote({
        originCode: traveler.originCode,
        destinationCode: city.code,
        month: trip.month,
        nights: trip.nights,
      });
      const total = Math.round(flight.price + hotelShare + daily);
      perTraveler.push({
        travelerId: traveler.id,
        flight: flight.price,
        hotelShare: Math.round(hotelShare),
        daily: Math.round(daily),
        total,
        isHome: traveler.originCode === city.code,
        overBudget: !!traveler.budget && total > traveler.budget,
      });
    }

    const totals = perTraveler.map((t) => t.total);
    const totalCost = totals.reduce((a, b) => a + b, 0);
    const avgCost = totalCost / totals.length;
    const variance = totals.reduce((a, b) => a + (b - avgCost) ** 2, 0) / totals.length;
    // Coefficient of variation → 0..1 fairness (1 = everyone pays the same).
    const fairness = Math.max(0, 1 - Math.sqrt(variance) / avgCost);

    results.push({
      cityCode: city.code,
      perTraveler,
      totalCost,
      avgCost: Math.round(avgCost),
      minCost: Math.min(...totals),
      maxCost: Math.max(...totals),
      fairness,
      overBudgetCount: perTraveler.filter((t) => t.overBudget).length,
    });
  }

  const cheapest = Math.min(...results.map((r) => r.totalCost));
  const w = clamp01(trip.fairnessWeight);

  return results
    .map((r) => {
      const costScore = cheapest / r.totalCost; // 1 for the cheapest city, <1 otherwise
      const budgetPenalty = 0.7 ** r.overBudgetCount;
      const score = ((1 - w) * costScore + w * r.fairness) * budgetPenalty;
      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
