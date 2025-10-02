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
  };
}

export function generateHouseTelemetry(house: House): DailyTelemetry[] {
  const telemetry: DailyTelemetry[] = [];
  for (let day = 1; day <= house.currentDay; day++) {
    telemetry.push(generateDailyTelemetry(house, day));
  }
  return telemetry;
}
