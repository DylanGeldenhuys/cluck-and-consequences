import { createRNG } from './seed';

export interface House {
  id: string;
  name: string;
  floorArea: number;
  capacity: number;
  baselineMortality: number;
  climateBias: 'hotter' | 'humid' | 'stable' | 'cooler';
  currentBirds: number;
  currentDay: number;
  cycleStartDate: Date;
}

export const WEEKS = [1, 2, 3, 4, 5, 6];
export const TOTAL_DAYS = 42;

export function generateHouses(): House[] {
  const rng = createRNG('houses-v1');
  const houses: House[] = [];
  const climates: Array<'hotter' | 'humid' | 'stable' | 'cooler'> = ['hotter', 'humid', 'stable', 'cooler'];

  for (let i = 1; i <= 10; i++) {
    const id = `H${String(i).padStart(2, '0')}`;
    const floorArea = rng.integer(800, 1200);
    const capacity = Math.floor(floorArea * 10);
    const currentDay = rng.integer(15, 35);
    const baselineMortality = rng.range(0.08, 0.12);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - currentDay);

    houses.push({
      id,
      name: `Broiler House ${id}`,
      floorArea,
      capacity,
      baselineMortality,
      climateBias: rng.choice(climates),
      currentBirds: capacity,
      currentDay,
      cycleStartDate: startDate,
    });
  }

  return houses;
}
