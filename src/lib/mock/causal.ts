import { createRNG } from './seed';

export type Factor = 'light' | 'temp' | 'vent' | 'protein';

export interface DoseResponse {
  factor: Factor;
  week: number;
  current: number;
  optimal: number;
  doses: number[];
  pefUplift: number[];
  profitDelta: number[];
  ciLower: number[];
  ciUpper: number[];
  support: number[];
}

export interface PairwiseSurface {
  factor1: Factor;
  factor2: Factor;
  week: number;
  doses1: number[];
  doses2: number[];
  pefUplift: number[][];
  safe: boolean[][];
}

export interface Recommendation {
  factor: Factor;
  week: number;
  currentValue: number;
  recommendedValue: number;
  pefUplift: number;
  profitDelta: number;
  confidence: [number, number];
  support: number;
  riskNote?: string;
}

const FACTOR_RANGES: Record<Factor, { min: number; max: number; optimal: (week: number) => number; unit: string }> = {
  light: { min: 8, max: 24, optimal: () => 18, unit: 'hrs/day' },
  temp: { min: 18, max: 32, optimal: (week) => 26 - week, unit: '°C' },
  vent: { min: 20, max: 100, optimal: (week) => 50 + week * 5, unit: '%' },
  protein: { min: 16, max: 24, optimal: (week) => 22 - week * 0.5, unit: '% CP' },
};

function gaussianSupport(x: number, mean: number, sigma: number): number {
  return Math.exp(-Math.pow(x - mean, 2) / (2 * sigma * sigma));
}

export function generateDoseResponse(factor: Factor, week: number, currentValue: number): DoseResponse {
  const rng = createRNG(`${factor}-w${week}`);
  const config = FACTOR_RANGES[factor];
  const optimal = config.optimal(week);
  
  const numPoints = 20;
  const doses: number[] = [];
  const pefUplift: number[] = [];
  const profitDelta: number[] = [];
  const ciLower: number[] = [];
  const ciUpper: number[] = [];
  const support: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const dose = config.min + (i / (numPoints - 1)) * (config.max - config.min);
    doses.push(dose);

    // Quadratic valley around optimal
    const distance = Math.abs(dose - optimal);
    const baseUplift = Math.max(0, 15 - 0.5 * Math.pow(distance, 2));
    const noise = rng.range(-1, 1);
    const uplift = baseUplift + noise;
    
    pefUplift.push(Number(uplift.toFixed(1)));
    profitDelta.push(Number((uplift * 75).toFixed(0)));

    // Confidence interval widens away from optimal
    const ciWidth = 2 + distance * 0.3;
    ciLower.push(Number((uplift - ciWidth).toFixed(1)));
    ciUpper.push(Number((uplift + ciWidth).toFixed(1)));

    // Support decreases away from optimal (Gaussian)
    const supportVal = gaussianSupport(dose, optimal, (config.max - config.min) / 4);
    support.push(Number(supportVal.toFixed(2)));
  }

  return {
    factor,
    week,
    current: currentValue,
    optimal,
    doses,
    pefUplift,
    profitDelta,
    ciLower,
    ciUpper,
    support,
  };
}

export function generatePairwiseSurface(
  factor1: Factor,
  factor2: Factor,
  week: number
): PairwiseSurface {
  const rng = createRNG(`${factor1}-${factor2}-w${week}`);
  const config1 = FACTOR_RANGES[factor1];
  const config2 = FACTOR_RANGES[factor2];
  const optimal1 = config1.optimal(week);
  const optimal2 = config2.optimal(week);

  const gridSize = 15;
  const doses1: number[] = [];
  const doses2: number[] = [];

  for (let i = 0; i < gridSize; i++) {
    doses1.push(config1.min + (i / (gridSize - 1)) * (config1.max - config1.min));
    doses2.push(config2.min + (i / (gridSize - 1)) * (config2.max - config2.min));
  }

  const pefUplift: number[][] = [];
  const safe: boolean[][] = [];

  for (let i = 0; i < gridSize; i++) {
    pefUplift[i] = [];
    safe[i] = [];
    
    for (let j = 0; j < gridSize; j++) {
      const d1 = doses1[i];
      const d2 = doses2[j];

      // Bivariate quadratic with interaction
      const dist1 = d1 - optimal1;
      const dist2 = d2 - optimal2;
      const baseUplift = 15 - 0.3 * (dist1 * dist1 + dist2 * dist2) - 0.05 * dist1 * dist2;
      const noise = rng.range(-0.5, 0.5);
      
      pefUplift[i][j] = Number(Math.max(0, baseUplift + noise).toFixed(1));

      // SAFE region based on support overlap
      const support1 = gaussianSupport(d1, optimal1, (config1.max - config1.min) / 4);
      const support2 = gaussianSupport(d2, optimal2, (config2.max - config2.min) / 4);
      safe[i][j] = (support1 * support2) > 0.3;
    }
  }

  return {
    factor1,
    factor2,
    week,
    doses1,
    doses2,
    pefUplift,
    safe,
  };
}

export function generateRecommendations(week: number, currentValues: Record<Factor, number>): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const factor of ['light', 'temp', 'vent', 'protein'] as Factor[]) {
    const doseResponse = generateDoseResponse(factor, week, currentValues[factor]);
    const config = FACTOR_RANGES[factor];
    const optimal = config.optimal(week);

    // Find best dose within SAFE region (support > 0.5)
    let bestIdx = 0;
    let bestUplift = -Infinity;
    
    for (let i = 0; i < doseResponse.doses.length; i++) {
      if (doseResponse.support[i] > 0.5 && doseResponse.pefUplift[i] > bestUplift) {
        bestUplift = doseResponse.pefUplift[i];
        bestIdx = i;
      }
    }

    const recommendedValue = doseResponse.doses[bestIdx];
    const pefUplift = doseResponse.pefUplift[bestIdx];
    const profitDelta = doseResponse.profitDelta[bestIdx];
    const supportVal = doseResponse.support[bestIdx];

    recommendations.push({
      factor,
      week,
      currentValue: currentValues[factor],
      recommendedValue: Number(recommendedValue.toFixed(1)),
      pefUplift: Number(pefUplift.toFixed(1)),
      profitDelta,
      confidence: [doseResponse.ciLower[bestIdx], doseResponse.ciUpper[bestIdx]],
      support: supportVal,
      riskNote: supportVal < 0.7 ? 'Limited data support - proceed with caution' : undefined,
    });
  }

  // Sort by potential uplift
  return recommendations.sort((a, b) => b.pefUplift - a.pefUplift);
}

export function getCurrentFactorValues(week: number): Record<Factor, number> {
  const rng = createRNG(`current-w${week}`);
  
  return {
    light: FACTOR_RANGES.light.optimal(week) + rng.range(-2, 2),
    temp: FACTOR_RANGES.temp.optimal(week) + rng.range(-1.5, 1.5),
    vent: FACTOR_RANGES.vent.optimal(week) + rng.range(-8, 8),
    protein: FACTOR_RANGES.protein.optimal(week) + rng.range(-0.8, 0.8),
  };
}
