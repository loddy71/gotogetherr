import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Tries the primary provider (live prices) and quietly falls back to the
 * secondary (estimates) per-quote, so one flaky route or a rate limit never
 * breaks a whole ranking. `source` on each quote tells the truth about
 * where the number came from.
 */
export class FallbackProvider implements PriceProvider {
  readonly name: string;

  constructor(
    private readonly primary: PriceProvider,
    private readonly secondary: PriceProvider,
  ) {
    this.name = `${primary.name}+${secondary.name}`;
  }

  async flightQuote(q: FlightQuery): Promise<FlightQuote> {
    try {
      return await this.primary.flightQuote(q);
    } catch {
      return this.secondary.flightQuote(q);
    }
  }

  async stayQuote(q: StayQuery): Promise<StayQuote> {
    try {
      return await this.primary.stayQuote(q);
    } catch {
      return this.secondary.stayQuote(q);
    }
  }
}
