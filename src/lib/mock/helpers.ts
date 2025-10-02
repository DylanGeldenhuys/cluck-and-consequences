import { DailyTelemetry } from './telemetry';

export function calculateDailyFCR(telemetry: DailyTelemetry, cumulativeFeed: number, avgWeight: number, initialBirds: number): number {
  if (avgWeight === 0 || initialBirds === 0) return 0;
  const totalWeight = avgWeight * initialBirds;
  return cumulativeFeed / totalWeight;
}

export function calculateDailyPEF(
  avgWeight: number,
  fcr: number,
  mortalityRate: number,
  ageInDays: number
): number {
  if (fcr === 0 || ageInDays === 0) return 0;
  const livability = (1 - mortalityRate) * 100;
  return (livability * avgWeight * 100) / (fcr * ageInDays);
}
