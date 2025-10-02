import { DailyTelemetry } from './telemetry';
import { createRNG } from './seed';

export type AnomalySeverity = 'low' | 'medium' | 'high';

export interface Anomaly {
  id: string;
  houseId: string;
  day: number;
  timestamp: Date;
  metric: string;
  value: number;
  severity: AnomalySeverity;
  message: string;
  suggestion: string;
}

export function detectAnomalies(telemetry: DailyTelemetry[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const rng = createRNG('anomaly-detection');

  for (let i = 0; i < telemetry.length; i++) {
    const t = telemetry[i];
    const prev = i > 0 ? telemetry[i - 1] : null;

    // NH3 spike
    if (t.nh3 > 25) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-nh3`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Ammonia (NH₃)',
        value: t.nh3,
        severity: t.nh3 > 35 ? 'high' : 'medium',
        message: `Ammonia levels elevated at ${t.nh3.toFixed(1)} ppm`,
        suggestion: 'Increase ventilation and turn litter immediately',
      });
    } else if (prev && t.nh3 > prev.nh3 + 8) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-nh3-spike`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Ammonia (NH₃)',
        value: t.nh3,
        severity: 'medium',
        message: `Sharp ammonia increase: ${(t.nh3 - prev.nh3).toFixed(1)} ppm`,
        suggestion: 'Check litter moisture and ventilation rates',
      });
    }

    // CO2 high
    if (t.co2 > 2500) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-co2`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Carbon Dioxide (CO₂)',
        value: t.co2,
        severity: t.co2 > 3000 ? 'high' : 'medium',
        message: `CO₂ concentration at ${t.co2.toFixed(0)} ppm`,
        suggestion: 'Boost ventilation fans to maintain air quality',
      });
    }

    // Dust spike
    if (t.dust > 13) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-dust`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Dust Concentration',
        value: t.dust,
        severity: 'medium',
        message: `Dust levels elevated at ${t.dust.toFixed(1)} mg/m³`,
        suggestion: 'Reduce activity and check ventilation system',
      });
    }

    // Heat stress (THI)
    const thi = t.tempActual + (0.36 * t.humidity);
    if (thi > 85) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-heat`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Heat Stress Index',
        value: thi,
        severity: thi > 90 ? 'high' : 'medium',
        message: `Heat stress conditions detected (THI: ${thi.toFixed(1)})`,
        suggestion: 'Increase fan speed, consider evaporative cooling',
      });
    }

    // High mortality
    if (t.mortality > 0.15) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-mort`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Mortality Rate',
        value: t.mortality * 100,
        severity: 'high',
        message: `Daily mortality at ${(t.mortality * 100).toFixed(2)}%`,
        suggestion: 'Inspect flock health, consult veterinarian',
      });
    }

    // NEW: Coughing detected
    if (t.coughingDetected) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-coughing`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Respiratory Distress',
        value: 1,
        severity: 'medium',
        message: 'AI detected coughing sounds from flock',
        suggestion: 'Check air quality (NH₃, dust levels). Inspect ventilation system.',
      });
    }

    // NEW: Raised volume detected
    if (t.raisedVolumeDetected) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-raisedvolume`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Stress Vocalizations',
        value: t.chickenNoiseDb,
        severity: 'medium',
        message: `Elevated stress vocalizations detected (${t.chickenNoiseDb.toFixed(0)} dB)`,
        suggestion: 'Inspect flock for health issues, check temperature and humidity comfort.',
      });
    }

    // NEW: Poor spread
    if (t.spreadMetric < 0.6) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-clustering`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Poor Flock Distribution',
        value: t.spreadMetric,
        severity: 'low',
        message: `Birds clustering unevenly (spread score: ${t.spreadMetric.toFixed(2)})`,
        suggestion: 'Check temperature zones, ensure water and feed access is uniform.',
      });
    }

    // NEW: Low movement
    if (t.movementIndex < 30) {
      anomalies.push({
        id: `${t.houseId}-d${t.day}-lowmovement`,
        houseId: t.houseId,
        day: t.day,
        timestamp: t.timestamp,
        metric: 'Low Activity',
        value: t.movementIndex,
        severity: 'medium',
        message: `Low flock activity detected (movement index: ${t.movementIndex.toFixed(0)})`,
        suggestion: 'Assess flock health and environmental comfort. Check for illness or heat stress.',
      });
    }
  }

  return anomalies;
}
