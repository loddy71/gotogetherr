import type { FlightQuery, FlightQuote, PriceProvider, StayQuery, StayQuote } from './provider';

/**
 * Live pricing via the proxy in `server/pricing-proxy.mjs`, which wraps the
 * Amadeus Self-Service APIs (the API key stays server-side; the app only
 * knows the proxy URL). Quotes are cached in-memory per route+month for the
 * session; the proxy adds its own longer-lived cache on top.
 *
 * Any network / upstream failure throws — wrap in `FallbackProvider` so the
 * ranking engine degrades to estimates per-route instead of failing whole.
 */
export class AmadeusPriceProvider implements PriceProvider {
  readonly name = 'amadeus';
  private cache = new Map<string, Promise<number>>();

  constructor(private readonly proxyBaseUrl: string) {}

  async flightQuote(q: FlightQuery): Promise<FlightQuote> {
    if (q.originCode === q.destinationCode) return { price: 0, source: this.name };
    const price = await this.cached(
      `f:${q.originCode}:${q.destinationCode}:${q.month}:${q.nights}`,
      `/flight?origin=${q.originCode}&dest=${q.destinationCode}&month=${q.month}&nights=${q.nights}`,
    );
    return { price, source: this.name };
  }

  async stayQuote(q: StayQuery): Promise<StayQuote> {
    const rooms = Math.max(1, Math.ceil(q.travelers / 2));
    const nightPrice = await this.cached(
      `s:${q.cityCode}:${q.month}`,
      `/stay?city=${q.cityCode}&month=${q.month}&nights=${q.nights}`,
    );
    return { groupTotal: Math.round(nightPrice * q.nights * rooms), rooms, source: this.name };
  }

  private cached(key: string, path: string): Promise<number> {
    let entry = this.cache.get(key);
    if (!entry) {
      entry = this.fetchPrice(path);
      // Don't poison the cache with transient failures.
      entry.catch(() => this.cache.delete(key));
      this.cache.set(key, entry);
    }
    return entry;
  }

  private async fetchPrice(path: string): Promise<number> {
    const res = await fetch(`${this.proxyBaseUrl}${path}`);
    if (!res.ok) throw new Error(`pricing proxy ${res.status} for ${path}`);
    const body = (await res.json()) as { price?: number };
    if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
      throw new Error(`pricing proxy returned no price for ${path}`);
    }
    return body.price;
  }
}
