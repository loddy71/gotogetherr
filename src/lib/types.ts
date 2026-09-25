/**
 * Core domain types for GoTogether — the meet-in-the-middle trip planner.
 * All money values are USD for the MVP (see docs/BRAINSTORM.md for the
 * multi-currency plan).
 */

export type Traveler = {
  id: string;
  name: string;
  /** City code (see src/lib/data/cities.ts) the traveler flies out of. */
  originCode: string;
  /** Max total spend for the whole trip, in USD. 0 / undefined = no budget. */
  budget?: number;
  /** City codes this traveler has ruled out ("I'm out on Vegas"). */
  vetoes?: string[];
};

export type Trip = {
  id: string;
  name: string;
  /** 1-12. Used for seasonality pricing. */
  month: number;
  nights: number;
  travelers: Traveler[];
  /** Ranking preference: 0 = cheapest total, 1 = fairest split. */
  fairnessWeight: number;
  /** Narrowing applied to the ranking. Missing = defaults (see lib/filters). */
  filters?: TripFilters;
  createdAt: number;
};

export type VibeKey = 'beach' | 'nightlife' | 'culture' | 'nature' | 'warm';

export type TripFilters = {
  /** Every selected vibe must match. */
  vibes: VibeKey[];
  /** Nobody flies longer than this (hours in the air); null = no limit. */
  maxFlightHours: number | null;
  /** Hide cities with a weather hazard in the trip month. */
  avoidBadWeather: boolean;
};

/** One traveler's estimated cost of attending a given destination. */
export type TravelerCost = {
  travelerId: string;
  flight: number;
  hotelShare: number;
  daily: number;
  total: number;
  /** True when the destination is the traveler's home city. */
  isHome: boolean;
  overBudget: boolean;
};

/** A candidate destination scored for a trip. */
export type DestinationResult = {
  cityCode: string;
  perTraveler: TravelerCost[];
  totalCost: number;
  avgCost: number;
  minCost: number;
  maxCost: number;
  /** 0..1 — how evenly the cost is spread across the group (1 = perfectly even). */
  fairness: number;
  /** Number of travelers whose total exceeds their budget. */
  overBudgetCount: number;
  /** Composite ranking score, 0..1, higher is better. */
  score: number;
};
