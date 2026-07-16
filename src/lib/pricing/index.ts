import { MockPriceProvider } from './mock-provider';
import type { PriceProvider } from './provider';

export * from './provider';

const provider: PriceProvider = new MockPriceProvider();

/**
 * The active pricing source. Swap the instance above for
 * `new AmadeusPriceProvider(...)` once the quote proxy exists.
 */
export function getPriceProvider(): PriceProvider {
  return provider;
}
