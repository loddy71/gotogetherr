import { ThemedText, type ThemedTextProps } from '@/components/themed-text';
import { useTween } from '@/hooks/use-tween';

/** A figure that rolls to its new value instead of jumping. */
export function AnimatedNumber({
  value,
  format,
  fromZero,
  ...textProps
}: Omit<ThemedTextProps, 'children'> & {
  value: number;
  format: (n: number) => string;
  /** Count up from 0 on first render. */
  fromZero?: boolean;
}) {
  const shown = useTween(value, { from: fromZero ? 0 : undefined });
  return <ThemedText {...textProps}>{format(shown)}</ThemedText>;
}
