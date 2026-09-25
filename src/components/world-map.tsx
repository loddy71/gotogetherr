import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useReplay, useTween } from '@/hooks/use-tween';
import { getCity } from '@/lib/data/cities';
import { LAND_DOTS, LAND_STEP } from '@/lib/data/land-dots';

type Origin = { key: string; code: string; color: string };

type WorldMapProps = {
  /** Where each traveler flies from, in their ink colour. */
  origins?: Origin[];
  /** Meeting city; arcs draw in from every origin. */
  destination?: string;
  /** Plain markers (e.g. every city in the index). */
  markers?: string[];
  /** Width ÷ height of the map. */
  aspect?: number;
  /** Zoom to fit the plotted points instead of showing the whole world. */
  focus?: boolean;
};

type Box = { x: number; y: number; w: number; h: number };

const WORLD: Box = { x: -180, y: -78, w: 360, h: 136 };

/** Equirectangular: x = longitude, y = −latitude (north up), in degrees. */
function frame(points: { lon: number; lat: number }[], aspect: number): Box {
  if (points.length === 0) return fit(WORLD, aspect);
  const lons = points.map((p) => p.lon);
  const lats = points.map((p) => p.lat);
  const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const pad = 14;
  let w = Math.max(maxLon - minLon + pad * 2, 64);
  let h = Math.max(maxLat - minLat + pad * 2, 30);
  if (w / h < aspect) w = h * aspect;
  else h = w / aspect;
  if (w > 360) {
    w = 360;
    h = 360 / aspect;
  }
  const cx = (minLon + maxLon) / 2;
  const cy = -(minLat + maxLat) / 2;
  const x = Math.min(Math.max(cx - w / 2, -180), 180 - w);
  const y = Math.min(Math.max(cy - h / 2, -84), 62 - h);
  return { x, y, w, h };
}

function fit(box: Box, aspect: number): Box {
  const h = box.w / aspect;
  return { x: box.x, y: box.y + (box.h - h) / 2, w: box.w, h };
}

function landPath(radius: number): string {
  const parts: string[] = [];
  for (let i = 0; i < LAND_DOTS.length; i += 2) {
    const x = LAND_DOTS[i] - radius;
    const y = -LAND_DOTS[i + 1];
    parts.push(`M${x.toFixed(2)} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`);
  }
  return parts.join('');
}

export function WorldMap({ origins = [], destination, markers = [], aspect = 1.9, focus = true }: WorldMapProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const height = width / aspect;

  const dots = useMemo(() => landPath(LAND_STEP * 0.24), []);

  const originPoints = origins.map((o) => ({ ...o, city: getCity(o.code) }));
  const dest = destination ? getCity(destination) : undefined;

  const target = focus
    ? frame([...originPoints.map((o) => o.city), ...(dest ? [dest] : [])], aspect)
    : fit(WORLD, aspect);

  // Pan and zoom by tweening the viewBox.
  const x = useTween(target.x, { duration: 700 });
  const y = useTween(target.y, { duration: 700 });
  const w = useTween(target.w, { duration: 700 });
  const h = w / aspect;

  const draw = useReplay(`${destination ?? ''}-${origins.map((o) => o.code).join()}`);

  const px = width > 0 ? w / width : 1; // degrees per screen pixel
  const toScreen = (lon: number, lat: number) => ({
    left: ((lon - x) / w) * width,
    top: ((-lat - y) / h) * height,
  });

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.frame, { height: height || undefined, aspectRatio: aspect }]}>
      {width > 0 && (
        <Svg width={width} height={height} viewBox={`${x} ${y} ${w} ${h}`}>
          <Path d={dots} fill={theme.land} />

          {markers.map((code) => {
            const c = getCity(code);
            return <Circle key={code} cx={c.lon} cy={-c.lat} r={2.2 * px} fill={theme.tint} opacity={0.8} />;
          })}

          {dest &&
            originPoints.map((o) => {
              if (o.code === dest.code) return null;
              const x1 = o.city.lon;
              const y1 = -o.city.lat;
              const x2 = dest.lon;
              const y2 = -dest.lat;
              const dx = x2 - x1;
              const dy = y2 - y1;
              const len = Math.hypot(dx, dy);
              // Bow the arc toward the pole, like a great-circle route on a flat map.
              const bow = Math.min(len * 0.22, 26);
              const cx = (x1 + x2) / 2;
              const cy = (y1 + y2) / 2 - bow;
              const approxLength = len * 1.25;
              return (
                <Path
                  key={o.key}
                  d={`M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}`}
                  stroke={o.color}
                  strokeWidth={2 * px}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${approxLength} ${approxLength}`}
                  strokeDashoffset={approxLength * (1 - draw)}
                />
              );
            })}

          {originPoints.map((o) => (
            <Circle
              key={o.key}
              cx={o.city.lon}
              cy={-o.city.lat}
              r={4 * px}
              fill={o.color}
              stroke={theme.card}
              strokeWidth={1.5 * px}
            />
          ))}

          {dest && (
            <>
              <Circle cx={dest.lon} cy={-dest.lat} r={9 * px * draw} fill={theme.tint} opacity={0.18} />
              <Circle
                cx={dest.lon}
                cy={-dest.lat}
                r={5 * px}
                fill={theme.tint}
                stroke={theme.card}
                strokeWidth={2 * px}
              />
            </>
          )}
        </Svg>
      )}

      {width > 0 && dest && (
        <View
          pointerEvents="none"
          style={[
            styles.label,
            { backgroundColor: theme.text, opacity: draw },
            labelPosition(toScreen(dest.lon, dest.lat), width, height),
          ]}>
          <ThemedText type="caption" style={{ color: theme.background }}>
            {dest.name}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

/**
 * Keep the destination label on-canvas. Routes bow northward and arrive from
 * above, so the label sits below the marker unless that runs off the map.
 */
function labelPosition(p: { left: number; top: number }, width: number, height: number) {
  const labelWidth = 124;
  const labelHeight = 24;
  const left = Math.min(Math.max(p.left - labelWidth / 2, 6), width - labelWidth - 6);
  const below = p.top + 12;
  const top = below + labelHeight > height - 4 ? Math.max(p.top - labelHeight - 12, 4) : below;
  return { left, top, width: labelWidth };
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.md,
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
});
