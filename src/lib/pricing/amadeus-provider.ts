import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Live-pricing provider backed by the Amadeus Self-Service APIs.
 *
 * Not wired up yet — this is the seam where real quotes come in. The plan
 * (see docs/BRAINSTORM.md, "Live pricing"):
 *
 *  1. Quotes must be fetched through a small server proxy (Expo API routes or
 *     a worker) so the API key never ships in the client bundle.
 *  2. Flight Offers Search for `originCode → destinationCode` on the cheapest
 *     dates in the chosen month; Hotel Search for the stay.
 *  3. Cache aggressively (route+month keys, ~24h TTL) — the ranking engine
 *     fires ~50 destinations × N travelers queries per trip.
 *  4. Fall back to MockPriceProvider per-route when the API errors or the
 *     rate limit is hit, keeping `source` honest so the UI can label
 *     estimates vs. live prices.
 */
export class AmadeusPriceProvider implements PriceProvider {
  readonly name = 'amadeus';

  constructor(private readonly proxyBaseUrl: string) {}

  async flightQuote(_query: FlightQuery): Promise<FlightQuote> {
    throw new Error('AmadeusPriceProvider is not implemented yet — use MockPriceProvider.');
  }

  async stayQuote(_query: StayQuery): Promise<StayQuote> {
    throw new Error('AmadeusPriceProvider is not implemented yet — use MockPriceProvider.');
  }
}
