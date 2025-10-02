export const COSTS = {
  salePrice: 32, // R per kg
  avgHarvestWeight: 2.5, // kg
  feedCost: 8.5, // R per kg
  chicCost: 15, // R per day-old chick
  electricityCost: 2.5, // R per kWh
  waterCost: 0.02, // R per liter
  vaccinesCost: 1.5, // R per bird
  litterCost: 0.5, // R per bird
  labourCost: 7.5, // R per bird
  maintenanceCost: 3.5, // R per bird
};

export interface ProfitCalculation {
  revenue: number;
  totalCosts: number;
  profit: number;
  profitPerBird: number;
  margin: number;
}

export function calculateProfit(params: {
  birdsAlive: number;
  avgWeightKg: number;
  feedIntakeKg: number;
  waterL: number;
  powerKwh: number;
  capacity: number;
}): ProfitCalculation {
  const { birdsAlive, avgWeightKg, feedIntakeKg, waterL, powerKwh, capacity } = params;

  const revenue = birdsAlive * avgWeightKg * COSTS.salePrice;
  
  const feedCost = feedIntakeKg * COSTS.feedCost;
  const chicCost = capacity * COSTS.chicCost;
  const powerCost = powerKwh * COSTS.electricityCost;
  const waterCostTotal = waterL * COSTS.waterCost;
  const vaccineCost = capacity * COSTS.vaccinesCost;
  const litterCostTotal = capacity * COSTS.litterCost;
  const labourCostTotal = capacity * COSTS.labourCost;
  const maintenanceCostTotal = capacity * COSTS.maintenanceCost;

  const totalCosts = feedCost + chicCost + powerCost + waterCostTotal + 
                     vaccineCost + litterCostTotal + labourCostTotal + maintenanceCostTotal;

  const profit = revenue - totalCosts;
  const profitPerBird = birdsAlive > 0 ? profit / birdsAlive : 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    totalCosts,
    profit,
    profitPerBird,
    margin,
  };
}
