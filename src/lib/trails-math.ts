// Reconstructed from Module 4133 of poggufanz.xyz production bundle

export const TWO_PI = 2 * Math.PI;
export const EXPOSURE_DURATION_SEC = 1.6;
export const SEG_HEIGHT_SVH = 90;

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const QUARTER_MONTHS = [0, 3, 6, 9].map((m) => ({
  month: MONTH_NAMES[m],
  turn: (m + 0.5) / 12,
}));

export const clamp = (e: number) => Math.min(1, Math.max(0, e));

export const smoothstep = (min: number, max: number, x: number) => {
  const t = clamp((x - min) / (max - min));
  return t * t * (3 - 2 * t);
};

/**
 * Calculates radius for role index in orbit diagram
 */
export function calcRoleRadius(idx: number, count: number): number {
  return count <= 1 ? 0.54 : 0.3 + (0.48 * idx) / (count - 1);
}

/**
 * Converts month string like 'Oct 2023' into month number (12 * year + month)
 */
export function parseMonthYear(str: string): number | null {
  const match = str.trim().match(/^([A-Z][a-z]{2})\s+(\d{4})$/);
  if (!match) return null;
  const monthIdx = MONTH_NAMES.indexOf(match[1]);
  if (monthIdx < 0) return null;
  return 12 * Number(match[2]) + monthIdx;
}

export function getCurrentMonthFloat(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const dayProgress = (date.getTime() - Date.UTC(year, month, 1)) / (86400000 * daysInMonth);
  return 12 * year + month + dayProgress;
}

export interface PeriodSpan {
  start: number;
  span: number;
  live: boolean;
}

export function calcPeriodSpan(periodStr: string, now: Date = new Date()): PeriodSpan {
  const [startStr = "", endStr = ""] = periodStr.split(/\s+-\s+/);
  const startIdx = parseMonthYear(startStr);
  if (startIdx === null) return { start: 0, span: 0, live: false };

  const isLive = /present/i.test(endStr);
  const endIdx = isLive ? null : parseMonthYear(endStr);
  const finish = isLive ? getCurrentMonthFloat(now) : (endIdx !== null ? endIdx : startIdx) + 1;

  const startAngle = ((startIdx % 12) / 12) * TWO_PI;
  const spanAngle = (Math.min(Math.max(finish - startIdx, 0), 12) / 12) * TWO_PI;

  return {
    start: startAngle,
    span: spanAngle,
    live: isLive,
  };
}

/**
 * Maps angle in radians to (x, y) circle coordinates
 */
export function projectCircle(angle: number): { x: number; y: number } {
  return {
    x: Math.sin(angle),
    y: -Math.cos(angle),
  };
}

/**
 * Earliest period string across all experiences
 */
export function getEarliestPeriod(periods: string[]): string {
  let earliest: { at: number; text: string } | null = null;
  for (const p of periods) {
    const startText = p.split(/\s+-\s+/)[0]?.trim() || "";
    const at = parseMonthYear(startText);
    if (at !== null && (!earliest || at < earliest.at)) {
      earliest = { at, text: startText };
    }
  }
  return earliest?.text || "";
}

export function calcTrailsStationMetrics(progress: number, count: number) {
  const n = count + 1;
  const scaled = clamp(progress) * n;
  const floor = Math.min(Math.floor(scaled), n - 1);
  const from = floor - 1;
  const to = floor < n - 1 ? floor : from;
  const travel = to === from ? 0 : smoothstep(0.78, 1.0, scaled - floor);
  return {
    from,
    to,
    mix: travel,
    nearest: travel < 0.5 ? from : to,
  };
}

export function calcTrailsVis(stationIdx: number, metrics: { from: number; to: number; mix: number }): number {
  if (metrics.from === stationIdx) {
    return metrics.to === stationIdx ? 1 : 1 - smoothstep(0, 0.5, metrics.mix);
  }
  if (metrics.to === stationIdx) {
    return smoothstep(0.5, 1.0, metrics.mix);
  }
  return 0;
}
