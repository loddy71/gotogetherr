import { AmadeusPriceProvider } from './amadeus-provider';
import { FallbackProvider } from './fallback-provider';
import { MockPriceProvider } from './mock-provider';
import type { PriceProvider } from './provider';

export * from './provider';

/**
 * Set EXPO_PUBLIC_PRICE_PROXY_URL (see server/pricing-proxy.mjs) to get live
 * Amadeus quotes with per-route fallback to estimates. Without it, the app
 * runs fully offline on the deterministic estimator.
 */
const proxyUrl = process.env.EXPO_PUBLIC_PRICE_PROXY_URL;

const provider: PriceProvider = proxyUrl
  ? new FallbackProvider(new AmadeusPriceProvider(proxyUrl), new MockPriceProvider())
  : new MockPriceProvider();

export function getPriceProvider(): PriceProvider {
  return provider;
}
