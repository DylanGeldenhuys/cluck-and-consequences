import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoseResponseChart } from '@/components/DoseResponseChart';
import { House } from '@/lib/mock/houses';
import { DailyTelemetry } from '@/lib/mock/telemetry';
import { generateRecommendations, getCurrentFactorValues, generateDoseResponse } from '@/lib/mock/causal';

interface AdvisoryPanelProps {
  house: House;
  telemetry: DailyTelemetry[];
}

export function AdvisoryPanel({ house }: AdvisoryPanelProps) {
  const currentWeek = Math.ceil(house.currentDay / 7);
  const currentValues = getCurrentFactorValues(currentWeek);
  const recommendations = generateRecommendations(currentWeek, currentValues);
  const topRec = recommendations[0];

  const doseResponses = {
    light: generateDoseResponse('light', currentWeek, currentValues.light),
    temp: generateDoseResponse('temp', currentWeek, currentValues.temp),
    vent: generateDoseResponse('vent', currentWeek, currentValues.vent),
    protein: generateDoseResponse('protein', currentWeek, currentValues.protein),
  };

  return (
    <div className="space-y-6">
      {/* Top Recommendation */}
      <Card className="glass-panel p-6 border-2 border-primary/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold mb-1 capitalize">Top Recommendation: {topRec.factor}</h3>
            <p className="text-sm text-muted-foreground">
              Adjust from {topRec.currentValue.toFixed(1)} to {topRec.recommendedValue.toFixed(1)}
            </p>
          </div>
          <Badge className={topRec.support > 0.7 ? 'bg-success' : topRec.support > 0.5 ? 'bg-warning' : 'bg-destructive'}>
            {topRec.support > 0.7 ? 'High' : topRec.support > 0.5 ? 'Medium' : 'Low'} Support
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">PEF Uplift</p>
            <p className="text-2xl font-bold text-success">+{topRec.pefUplift}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Profit Delta</p>
            <p className="text-2xl font-bold text-primary">R {topRec.profitDelta.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-sm font-mono">[{topRec.confidence[0].toFixed(1)}, {topRec.confidence[1].toFixed(1)}]</p>
          </div>
        </div>
        {topRec.riskNote && (
          <p className="mt-4 text-sm text-warning">{topRec.riskNote}</p>
        )}
      </Card>

      {/* Dose Response Charts */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Dose-Response Curves</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DoseResponseChart doseResponse={doseResponses.light} />
          <DoseResponseChart doseResponse={doseResponses.temp} />
          <DoseResponseChart doseResponse={doseResponses.vent} />
          <DoseResponseChart doseResponse={doseResponses.protein} />
        </div>
      </div>
    </div>
  );
}
