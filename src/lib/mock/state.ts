import { House, generateHouses } from './houses';
import { DailyTelemetry, generateHouseTelemetry } from './telemetry';
import { WeeklyMetrics, calculateWeeklyMetrics } from './weekly';
import { Anomaly, detectAnomalies } from './anomalies';

export interface AppState {
  houses: House[];
  telemetry: Map<string, DailyTelemetry[]>;
  weeklyMetrics: Map<string, WeeklyMetrics[]>;
  anomalies: Map<string, Anomaly[]>;
}

let appState: AppState | null = null;

export function initializeAppState(): AppState {
  const houses = generateHouses();
  const telemetry = new Map<string, DailyTelemetry[]>();
  const weeklyMetrics = new Map<string, WeeklyMetrics[]>();
  const anomalies = new Map<string, Anomaly[]>();

  for (const house of houses) {
    const houseTelemetry = generateHouseTelemetry(house);
    telemetry.set(house.id, houseTelemetry);
    
    const houseWeekly = calculateWeeklyMetrics(houseTelemetry);
    weeklyMetrics.set(house.id, houseWeekly);

    const houseAnomalies = detectAnomalies(houseTelemetry);
    anomalies.set(house.id, houseAnomalies);
  }

  appState = {
    houses,
    telemetry,
    weeklyMetrics,
    anomalies,
  };

  return appState;
}

export function getAppState(): AppState {
  if (!appState) {
    return initializeAppState();
  }
  return appState;
}

export function getHouse(id: string): House | undefined {
  return getAppState().houses.find(h => h.id === id);
}

export function getHouseTelemetry(id: string): DailyTelemetry[] {
  return getAppState().telemetry.get(id) || [];
}

export function getHouseWeeklyMetrics(id: string): WeeklyMetrics[] {
  return getAppState().weeklyMetrics.get(id) || [];
}

export function getHouseAnomalies(id: string): Anomaly[] {
  return getAppState().anomalies.get(id) || [];
}
