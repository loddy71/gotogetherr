import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/**
 * The GoTogether mark: three travelers' routes landing on one signal-orange point,
 * drawn from the same geometry as the app icon (scripts/icon/mark.svg).
 */
export function BrandMark({
  size = 28,
  dotColor,
  ringColor,
}: {
  size?: number;
  /** Origin dots; defaults to ink. */
  dotColor?: string;
  /** Gap ring around the meeting point; defaults to the page ground. */
  ringColor?: string;
}) {
  const theme = useTheme();
  const dots = dotColor ?? theme.text;
  return (
    <Svg width={size * 1.6} height={size} viewBox="96 300 830 520" accessible={false}>
      <Path d="M146 562 Q 326 152, 556 502" stroke="#2F5BEA" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Path d="M870 582 Q 736 282, 556 502" stroke="#E5A000" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Path d="M296 702 Q 416 502, 556 502" stroke="#0B7A6E" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Circle cx={146} cy={562} r={44} fill={dots} />
      <Circle cx={870} cy={582} r={44} fill={dots} />
      <Circle cx={296} cy={702} r={44} fill={dots} />
      <Circle cx={556} cy={502} r={96} fill={theme.tint} stroke={ringColor ?? theme.background} strokeWidth={32} />
    </Svg>
  );
}
