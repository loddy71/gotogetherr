import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Tries the primary provider (live prices) and quietly falls back to the
 * secondary (estimates) per-quote, so one flaky route or a rate limit never
 * breaks a whole ranking. `source` on each quote tells the truth about
 * where the number came from.
 */
/** After this many primary failures in a row, skip the primary for a while. */
const TRIP_AFTER = 3;
const COOL_OFF_MS = 60_000;

export class FallbackProvider implements PriceProvider {
  readonly name: string;
  private failures = 0;
  private skipUntil = 0;

  constructor(
    private readonly primary: PriceProvider,
    private readonly secondary: PriceProvider,
  ) {
    this.name = `${primary.name}+${secondary.name}`;
  }

  flightQuote(q: FlightQuery): Promise<FlightQuote> {
    return this.attempt(
      () => this.primary.flightQuote(q),
      () => this.secondary.flightQuote(q),
    );
  }

  stayQuote(q: StayQuery): Promise<StayQuote> {
    return this.attempt(
      () => this.primary.stayQuote(q),
      () => this.secondary.stayQuote(q),
    );
  }

  /** Circuit breaker: a dead proxy costs a few timeouts, not one per route. */
  private async attempt<T>(primary: () => Promise<T>, secondary: () => Promise<T>): Promise<T> {
    if (Date.now() < this.skipUntil) return secondary();
    try {
      const quote = await primary();
      this.failures = 0;
      return quote;
    } catch {
      if (++this.failures >= TRIP_AFTER) this.skipUntil = Date.now() + COOL_OFF_MS;
      return secondary();
    }
  }
}
