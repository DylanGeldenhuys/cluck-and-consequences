import { House } from './houses';
import { createRNG } from './seed';

export interface DailyTelemetry {
  houseId: string;
  day: number;
  week: number;
  timestamp: Date;
  // Environmental
  tempSetpoint: number;
  tempActual: number;
  humidity: number;
  co2: number;
  nh3: number;
  dust: number;
  // Resources
  feedIntakeKg: number;
  waterL: number;
  powerKwh: number;
  powerHeater: number;
  powerFans: number;
  powerLights: number;
  // Outside weather
  outsideTemp: number;
  outsideHumidity: number;
  outsidePressure: number;
  // Operations
  staffEntries: number;
  litterTurns: number;
  vaccineEvents: number;
  // Birds
  birdsAlive: number;
  avgWeightKg: number;
  mortality: number;
  // NEW: Bird behavior metrics
  airspeedMs: number;
  chickenNoiseDb: number;
  coughingDetected: boolean;
  raisedVolumeDetected: boolean;
  // NEW: Movement & spatial metrics
  chickenClustering: number[][];
  spreadMetric: number;
  movementIndex: number;
}

export function generateDailyTelemetry(house: House, day: number): DailyTelemetry {
  const rng = createRNG(`${house.id}-day${day}`);
  const week = Math.ceil(day / 7);

  // Temperature decreases by 1.5°C per week
  const tempSetpoint = 32 - ((week - 1) * 1.5);
  const tempBias = house.climateBias === 'hotter' ? 2 : house.climateBias === 'cooler' ? -2 : 0;
  const tempActual = tempSetpoint + tempBias + rng.range(-0.5, 0.5);

  // Humidity varies by climate
  const humidityBase = house.climateBias === 'humid' ? 75 : 60;
  const humidity = humidityBase + rng.range(-5, 5);

  // Feed and water increase with week
  const feedIntakeKg = house.currentBirds * (0.05 + (week * 0.015)) + rng.range(-10, 10);
  const waterL = feedIntakeKg * 1.8 + rng.range(-20, 20);

  // Power consumption
  const powerHeater = (32 - tempActual) * 2.5 + rng.range(0, 5);
  const powerFans = week * 8 + rng.range(-2, 2);
  const powerLights = 15 + rng.range(-1, 1);
  const powerKwh = powerHeater + powerFans + powerLights;

  // Litter turns affect NH3
  const daysSinceLastTurn = day % rng.integer(3, 7);
  const nh3Base = daysSinceLastTurn * 3;
  const nh3 = Math.max(0, nh3Base + rng.range(-2, 8));

  // CO2 increases with density and humidity
  const co2 = 1500 + (week * 150) + (humidity * 5) + rng.range(-100, 100);

  // Dust has occasional spikes
  const dustSpike = rng.boolean(0.15) ? rng.range(5, 15) : 0;
  const dust = 3 + dustSpike + rng.range(-0.5, 0.5);

  // Weight follows sigmoid curve
  const avgWeightKg = 2.8 / (1 + Math.exp(-(day - 25) / 7));

  // Mortality
  const mortalityDaily = house.baselineMortality / 42 + rng.range(-0.01, 0.02);
  const birdsAlive = Math.floor(house.capacity * (1 - (house.baselineMortality * day / 42)));

  // Outside weather
  const outsideTemp = 22 + rng.range(-5, 10);
  const outsideHumidity = 55 + rng.range(-10, 15);
  const outsidePressure = 1013 + rng.range(-10, 10);

  // Operations
  const staffEntries = rng.integer(2, 6);
  const litterTurns = daysSinceLastTurn === 0 ? 1 : 0;
  const vaccineEvents = [7, 14, 21].includes(day) ? 1 : 0;

  const timestamp = new Date(house.cycleStartDate);
  timestamp.setDate(timestamp.getDate() + day);

  // NEW: Bird behavior metrics
  const airspeedMs = 0.5 + (week * 0.2) + rng.range(-0.1, 0.2);
  const thi = tempActual + (0.36 * humidity);
  const baseNoise = 55 + rng.range(-3, 8);
  const stressedNoise = (nh3 > 20 || dust > 10 || thi > 85) ? rng.range(68, 80) : baseNoise;
  const chickenNoiseDb = stressedNoise;
  const coughingDetected = (nh3 > 20 || dust > 10) && rng.boolean(0.05);
  const raisedVolumeDetected = (thi > 85 || mortalityDaily > 0.15) && rng.boolean(0.08);

  // NEW: Movement & spatial metrics - generate 10x10 clustering grid
  const chickenClustering: number[][] = [];
  const numClusters = rng.integer(2, 3);
  for (let i = 0; i < 10; i++) {
    chickenClustering[i] = [];
    for (let j = 0; j < 10; j++) {
      let density = 0.5 + rng.range(-0.2, 0.2);
      // Add Gaussian clusters (hot spots)
      for (let c = 0; c < numClusters; c++) {
        const cx = rng.range(2, 8);
        const cy = rng.range(2, 8);
        const dist = Math.sqrt((i - cx) ** 2 + (j - cy) ** 2);
        density += Math.exp(-(dist ** 2) / 8) * rng.range(0.2, 0.4);
      }
      chickenClustering[i][j] = Math.min(1, Math.max(0, density));
    }
  }

  // Calculate spread metric (coefficient of variation - lower is more uniform)
  const flatDensities = chickenClustering.flat();
  const meanDensity = flatDensities.reduce((a, b) => a + b, 0) / flatDensities.length;
  const variance = flatDensities.reduce((sum, d) => sum + (d - meanDensity) ** 2, 0) / flatDensities.length;
  const stdDev = Math.sqrt(variance);
  const spreadMetric = 1 - Math.min(1, stdDev / meanDensity); // Normalize to 0-1

  // Movement index (decreases with age and heat stress)
  const movementIndex = Math.max(10, 40 + (week * 5) - (thi * 0.3) + rng.range(-10, 10));

  return {
    houseId: house.id,
    day,
    week,
    timestamp,
    tempSetpoint,
    tempActual,
    humidity,
    co2,
    nh3,
    dust,
    feedIntakeKg,
    waterL,
    powerKwh,
    powerHeater,
    powerFans,
    powerLights,
    outsideTemp,
    outsideHumidity,
    outsidePressure,
    staffEntries,
    litterTurns,
    vaccineEvents,
    birdsAlive,
    avgWeightKg,
    mortality: mortalityDaily,
    airspeedMs,
    chickenNoiseDb,
    coughingDetected,
    raisedVolumeDetected,
    chickenClustering,
    spreadMetric,
    movementIndex,
  };
}

export function generateHouseTelemetry(house: House): DailyTelemetry[] {
  const telemetry: DailyTelemetry[] = [];
  for (let day = 1; day <= house.currentDay; day++) {
    telemetry.push(generateDailyTelemetry(house, day));
  }
  return telemetry;
}
