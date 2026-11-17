import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

/**
 * The GoTogether mark: three flight arcs landing on one stamp-red point,
 * drawn from the same geometry as the app icon (scripts/icon/mark.svg).
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Svg width={size * 1.6} height={size} viewBox="96 300 830 520" accessible={false}>
      <Path d="M146 562 Q 326 152, 556 502" stroke="#35635A" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Path d="M870 582 Q 736 282, 556 502" stroke="#C0913F" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Path d="M296 702 Q 416 502, 556 502" stroke="#B0513A" strokeWidth={56} strokeLinecap="round" fill="none" />
      <Circle cx={146} cy={562} r={44} fill={theme.text} />
      <Circle cx={870} cy={582} r={44} fill={theme.text} />
      <Circle cx={296} cy={702} r={44} fill={theme.text} />
      <Circle cx={556} cy={502} r={96} fill={theme.tint} stroke={theme.background} strokeWidth={32} />
    </Svg>
  );
}
