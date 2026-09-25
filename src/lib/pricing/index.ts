import { FallbackProvider } from './fallback-provider';
import { MockPriceProvider } from './mock-provider';
import type { PriceProvider } from './provider';
import { ProxyPriceProvider } from './proxy-provider';

export * from './provider';

/**
 * Set EXPO_PUBLIC_PRICE_PROXY_URL to a pricing proxy (contract in
 * proxy-provider.ts) for live quotes with per-route fallback to estimates.
 * Without it, the app runs fully offline on the calibrated estimator.
 */
const proxyUrl = process.env.EXPO_PUBLIC_PRICE_PROXY_URL;

const provider: PriceProvider = proxyUrl
  ? new FallbackProvider(new ProxyPriceProvider(proxyUrl), new MockPriceProvider())
  : new MockPriceProvider();

export function getPriceProvider(): PriceProvider {
  return provider;
}
