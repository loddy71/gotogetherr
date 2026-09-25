import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Tweens a number on the JS thread and re-renders with each frame. For a
 * handful of on-screen figures and small SVGs this is cheaper and more
 * portable (web + native) than animating text on the UI thread.
 *
 * The first value renders immediately unless `from` is given. With reduced
 * motion enabled the target is returned as-is.
 */
export function useTween(
  target: number,
  { duration = 520, from }: { duration?: number; from?: number } = {},
) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(from ?? target);
  const current = useRef(from ?? target);

  useEffect(() => {
    if (reduceMotion) return;
    const start = current.current;
    if (start === target) return;
    const began = Date.now();
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - began) / duration);
      const next = start + (target - start) * easeOutCubic(t);
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduceMotion]);

  return reduceMotion ? target : value;
}

/**
 * Plays 0 → 1 (ease-out) each time `key` changes, e.g. to draw a route in
 * when the destination changes. Returns 1 immediately with reduced motion.
 */
export function useReplay(key: string, duration = 900) {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState({ key, t: 0 });
  // Restart from zero during render when the key changes, so no frame ever
  // shows the previous route fully drawn.
  if (state.key !== key) setState({ key, t: 0 });

  useEffect(() => {
    if (reduceMotion) return;
    const began = Date.now();
    let frame = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - began) / duration);
      setState({ key, t: easeOutCubic(p) });
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [key, duration, reduceMotion]);

  return reduceMotion ? 1 : state.key === key ? state.t : 0;
}
