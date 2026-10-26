// Reconstructed from Module 4214 of poggufanz.xyz production bundle

export const SEG_HEIGHT_SVH = 92;
export const INITIAL_STATION = -1;

export const clamp = (e: number) => Math.min(1, Math.max(0, e));

export const smoothstep = (min: number, max: number, x: number) => {
  const t = clamp((x - min) / (max - min));
  return t * t * (3 - 2 * t);
};

export const quintic = (e: number) => e * e * e * (e * (6 * e - 15) + 10);

/**
 * Calculates normalized scroll progress through a pinned section
 */
export function calcScrollProgress(top: number, height: number, vh: number): number {
  const scrollableDist = height - vh;
  return scrollableDist <= 1 ? 0 : clamp(-top / scrollableDist);
}

export interface StationMetrics {
  from: number;
  to: number;
  mix: number;
  travel: number;
  nearest: number;
}

/**
 * Calculates current station transition metrics (from, to, mix, nearest)
 */
export function calcStationMetrics(progress: number, count: number): StationMetrics {
  const n = count + 1;
  const scaled = clamp(progress) * n;
  const floor = Math.min(Math.floor(scaled), n - 1);
  const from = floor - 1;
  const to = floor >= count ? from : floor;
  const travel = to === from ? 0 : smoothstep(0.56, 1.0, scaled - floor);
  const mix = quintic(travel);
  return {
    from,
    to,
    mix,
    travel,
    nearest: mix < 0.5 ? from : to,
  };
}

/**
 * Calculates visibility [0..1] of a station given current metrics
 */
export function calcStationVis(stationIdx: number, metrics: StationMetrics): number {
  if (metrics.from === stationIdx && metrics.to === stationIdx) return 1;
  if (metrics.from === stationIdx) return 1 - smoothstep(0.04, 0.42, metrics.mix);
  if (metrics.to === stationIdx) return smoothstep(0.6, 0.96, metrics.mix);
  return 0;
}

/**
 * Calculates z-axis 3D fly translation offset for a station
 */
export function calcStationFly(stationIdx: number, metrics: StationMetrics): number {
  if (metrics.from === stationIdx && metrics.to === stationIdx) return 0;
  if (metrics.from === stationIdx) return metrics.mix;
  if (metrics.to === stationIdx) return metrics.mix - 1;
  return stationIdx < metrics.from ? 1 : -1;
}

export function calcTopProgress(top: number, vh: number): number {
  return clamp(1 - top / Math.max(1, vh));
}

export function calcScrim(p: number): number {
  return smoothstep(0.5, 0.92, p);
}

export function calcStationScrollFraction(stationIdx: number, count: number): number {
  const n = stationIdx + 1;
  return clamp((n + (n >= count ? 0.5 : 0.28)) / (count + 1));
}
