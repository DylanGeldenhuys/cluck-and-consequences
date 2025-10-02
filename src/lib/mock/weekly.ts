import { DailyTelemetry } from './telemetry';
import { calculateProfit } from './costs';

export interface WeeklyMetrics {
  week: number;
  fcr: number;
  pef: number;
  mortality: number;
  throughput: number;
  profit: number;
  avgWeight: number;
}

export function calculateWeeklyMetrics(telemetry: DailyTelemetry[]): WeeklyMetrics[] {
  const weeks = [1, 2, 3, 4, 5, 6];
  const metrics: WeeklyMetrics[] = [];

  for (const week of weeks) {
    const weekData = telemetry.filter(t => t.week === week);
    if (weekData.length === 0) continue;

    const totalFeed = weekData.reduce((sum, t) => sum + t.feedIntakeKg, 0);
    const totalWeight = weekData.reduce((sum, t) => sum + (t.birdsAlive * t.avgWeightKg), 0);
    const avgWeight = weekData[weekData.length - 1]?.avgWeightKg || 0;
    const fcr = totalWeight > 0 ? totalFeed / totalWeight : 0;

    const lastDay = weekData[weekData.length - 1];
    const liveability = (lastDay.birdsAlive / 10000) * 100;
    const ageDays = week * 7;
    const pef = fcr > 0 ? (liveability * avgWeight * 100) / (ageDays * fcr) : 0;

    const mortalityRate = weekData.reduce((sum, t) => sum + t.mortality, 0) / weekData.length;

    const totalProfit = weekData.reduce((sum, t) => {
      const prof = calculateProfit({
        birdsAlive: t.birdsAlive,
        avgWeightKg: t.avgWeightKg,
        feedIntakeKg: t.feedIntakeKg,
        waterL: t.waterL,
        powerKwh: t.powerKwh,
        capacity: 10000,
      });
      return sum + prof.profit;
    }, 0);

    // Apply 3% improvement per week to simulate AI interventions
    const improvementMultiplier = 1 + (week * 0.03);
    const dailyProfit = (totalProfit / weekData.length) * improvementMultiplier;

    metrics.push({
      week,
      fcr: Number(fcr.toFixed(2)),
      pef: Number(pef.toFixed(1)),
      mortality: Number((mortalityRate * 100).toFixed(2)),
      throughput: Number(totalWeight.toFixed(0)),
      profit: Number(dailyProfit.toFixed(0)),
      avgWeight: Number(avgWeight.toFixed(2)),
    });
  }

  return metrics;
}
