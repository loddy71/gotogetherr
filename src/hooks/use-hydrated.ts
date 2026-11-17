import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * False while the static web export is being hydrated (and during static
 * rendering), true afterwards; always true on native. Use it to render a
 * neutral first paint for content that depends on the URL or the device.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
