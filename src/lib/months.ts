import { applyFilters } from '@/lib/filters';
import { MockPriceProvider } from '@/lib/pricing/mock-provider';
import { rankDestinations } from '@/lib/scoring';
import type { Trip } from '@/lib/types';

export type MonthOption = {
  month: number;
  /** Best city that month under the trip's mode and filters; null if none pass. */
  cityCode: string | null;
  avgCost: number;
  fairness: number;
};

const estimator = new MockPriceProvider();

/**
 * Re-runs the ranking for every month of the year, keeping the trip's
 * ranking mode and filters (weather filters change month to month). Always
 * uses the estimator: 12 × 50 × travelers quotes would be too many live calls.
 */
export async function compareMonths(trip: Trip): Promise<MonthOption[]> {
  const options: MonthOption[] = [];
  for (let month = 1; month <= 12; month++) {
    const variant = { ...trip, month };
    const best = applyFilters(variant, await rankDestinations(variant, estimator))[0];
    options.push({
      month,
      cityCode: best?.cityCode ?? null,
      avgCost: best?.avgCost ?? 0,
      fairness: best?.fairness ?? 0,
    });
  }
  return options;
}

export function cheapestMonth(options: MonthOption[]): MonthOption | undefined {
  return options
    .filter((o) => o.cityCode)
    .reduce<MonthOption | undefined>((best, o) => (!best || o.avgCost < best.avgCost ? o : best), undefined);
}
