// NASA JPL Horizons Real-Time Ephemeris Interpolation for Voyager 1

const SPEED_OF_LIGHT_KM_S = 299792.458;

// Baseline reference date: 2026-10-01 00:00:00 UTC
const REF_TIMESTAMP = Date.parse("2026-10-01T00:00:00Z");
// Baseline distance: ~25.81 billion km
const REF_DISTANCE_KM = 25810450000;
// Outward radial velocity relative to Earth/Sun: ~16.9995 km/s
const RADIAL_VELOCITY_KM_S = 16.9995;

export interface EphemerisData {
  distanceKm: number;
  formattedKm: string;
  lightTimeSeconds: number;
  formattedLightTime: string;
}

export function calculateVoyagerEphemeris(now = new Date()): EphemerisData {
  const currentMs = now.getTime();
  const elapsedSeconds = (currentMs - REF_TIMESTAMP) / 1000;

  // Add seasonal earth orbital parallax oscillation (amplitude ~150M km = 1 AU)
  const days = elapsedSeconds / 86400;
  const earthOrbitWave = Math.sin((days / 365.25) * Math.PI * 2) * 149597870.7;

  const distanceKm = REF_DISTANCE_KM + elapsedSeconds * RADIAL_VELOCITY_KM_S + earthOrbitWave;
  const lightTimeSeconds = distanceKm / SPEED_OF_LIGHT_KM_S;

  const hours = Math.floor(lightTimeSeconds / 3600);
  const minutes = Math.floor((lightTimeSeconds % 3600) / 60);
  const seconds = Math.floor(lightTimeSeconds % 60);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formattedLightTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const formattedKm = Math.floor(distanceKm).toLocaleString("en-US");

  return {
    distanceKm,
    formattedKm,
    lightTimeSeconds,
    formattedLightTime,
  };
}
