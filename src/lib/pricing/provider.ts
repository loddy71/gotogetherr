/**
 * Pricing abstraction. The app only ever talks to this interface, so the
 * deterministic estimator can be swapped for live APIs (see
 * docs/DATA_SOURCES.md) without touching any screen or the ranking engine.
 */

export type FlightQuery = {
  originCode: string;
  destinationCode: string;
  month: number; // 1-12
  nights: number;
};

export type StayQuery = {
  cityCode: string;
  month: number;
  nights: number;
  /** Group size sharing rooms (double occupancy assumed). */
  travelers: number;
};

export type FlightQuote = {
  /** Return fare per person, USD. */
  price: number;
  /** Where the number came from, e.g. 'estimate' | 'live'. */
  source: string;
};

export type StayQuote = {
  /** Total accommodation cost for the whole group, USD. */
  groupTotal: number;
  rooms: number;
  source: string;
};

export interface PriceProvider {
  readonly name: string;
  flightQuote(query: FlightQuery): Promise<FlightQuote>;
  stayQuote(query: StayQuery): Promise<StayQuote>;
}
