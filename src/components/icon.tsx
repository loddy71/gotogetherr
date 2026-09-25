import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

export type IconName =
  | 'back'
  | 'chevron-down'
  | 'share'
  | 'edit'
  | 'plus'
  | 'close'
  | 'search'
  | 'plane'
  | 'sun'
  | 'rain'
  | 'arrow-right'
  | 'sliders';

/** Stroke paths on a 24×24 grid. Drawn in-house; kept deliberately plain. */
const PATHS: Record<IconName, string[]> = {
  back: ['M15 5l-7 7 7 7'],
  'chevron-down': ['M6 9l6 6 6-6'],
  share: ['M12 15V3', 'M7.5 7.5L12 3l4.5 4.5', 'M5 12v6.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V12'],
  edit: ['M4 20h4.5L19 9.5 14.5 5 4 15.5V20z', 'M12.5 7l4.5 4.5'],
  plus: ['M12 5v14', 'M5 12h14'],
  close: ['M6 6l12 12', 'M18 6L6 18'],
  search: ['M20 20l-4.2-4.2'],
  plane: ['M3 13.5l7-1.5 4.5-7.5h2l-2 7.5 5-.5 1.5-2h1.5l-1 4 1 4H21l-1.5-2-5-.5 2 7.5h-2L10 15l-7-1.5z'],
  sun: ['M12 2.5v2', 'M12 19.5v2', 'M2.5 12h2', 'M19.5 12h2', 'M5.3 5.3l1.4 1.4', 'M17.3 17.3l1.4 1.4', 'M5.3 18.7l1.4-1.4', 'M17.3 6.7l1.4-1.4'],
  rain: ['M7 16a4 4 0 01-.5-8A5.5 5.5 0 0117 7.5a3.5 3.5 0 01.5 7', 'M9 18l-1 2.5', 'M13 18l-1 2.5', 'M17 18l-1 2.5'],
  'arrow-right': ['M5 12h14', 'M13 6l6 6-6 6'],
  sliders: ['M4 7h9', 'M17 7h3', 'M4 17h3', 'M11 17h9', 'M15 5v4', 'M9 15v4'],
};

export function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const theme = useTheme();
  const stroke = color ?? theme.text;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'search' && <Circle cx={10.5} cy={10.5} r={6.5} stroke={stroke} strokeWidth={strokeWidth} />}
      {name === 'sun' && <Circle cx={12} cy={12} r={4} stroke={stroke} strokeWidth={strokeWidth} />}
      {PATHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
    </Svg>
  );
}
