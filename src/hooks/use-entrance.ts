import { useHydrated } from '@/hooks/use-hydrated';

/**
 * Entrance animations only after hydration. Reanimated hides a view with an
 * `entering` animation in the static web export until its animation starts;
 * with reduced motion it never starts, so the view stayed hidden, and for
 * everyone the first paint was blank until the bundle ran. Native and
 * in-app navigation keep their entrances.
 */
export function useEntrance() {
  const hydrated = useHydrated();
  return <T,>(animation: T): T | undefined => (hydrated ? animation : undefined);
}
