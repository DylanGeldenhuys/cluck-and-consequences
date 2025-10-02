import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DoseResponseChart } from '@/components/DoseResponseChart';
import { WeekSupportBar } from '@/components/WeekSupportBar';
import { PairwiseHeatmap } from '@/components/PairwiseHeatmap';
import { House } from '@/lib/mock/houses';
import { DailyTelemetry } from '@/lib/mock/telemetry';
import { generateRecommendations, getCurrentFactorValues, generateDoseResponse, generatePairwiseSurface, Factor } from '@/lib/mock/causal';
import { TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

interface AdvisoryPanelProps {
  house: House;
  telemetry: DailyTelemetry[];
}

export function AdvisoryPanel({ house }: AdvisoryPanelProps) {
  const currentWeek = Math.ceil(house.currentDay / 7);
  const currentValues = getCurrentFactorValues(currentWeek);
  const recommendations = generateRecommendations(currentWeek, currentValues);
  const topRec = recommendations[0];

  const [factor1, setFactor1] = useState<Factor>('light');
  const [factor2, setFactor2] = useState<Factor>('temp');

  // Generate dose responses for all factors
  const doseResponses = {
    light: generateDoseResponse('light', currentWeek, currentValues.light),
    temp: generateDoseResponse('temp', currentWeek, currentValues.temp),
    vent: generateDoseResponse('vent', currentWeek, currentValues.vent),
    protein: generateDoseResponse('protein', currentWeek, currentValues.protein),
  };

  // Calculate week support scores (average of all factors)
  const weekSupport: number[] = [];
  for (let week = 1; week <= 6; week++) {
    const factors: Factor[] = ['light', 'temp', 'vent', 'protein'];
    const supports = factors.map(f => {
      const dr = generateDoseResponse(f, week, getCurrentFactorValues(week)[f]);
      return dr.support.reduce((a, b) => a + b, 0) / dr.support.length;
    });
    weekSupport.push(supports.reduce((a, b) => a + b, 0) / supports.length);
  }

  // Generate pairwise surface
  const pairwiseSurface = generatePairwiseSurface(factor1, factor2, currentWeek);
  const currentPos: [number, number] = [currentValues[factor1], currentValues[factor2]];
  const rec1 = recommendations.find(r => r.factor === factor1);
  const rec2 = recommendations.find(r => r.factor === factor2);
  const recommendedPos: [number, number] = [
    rec1?.recommendedValue || currentPos[0],
    rec2?.recommendedValue || currentPos[1]
  ];

  const getSupportColor = (support: number) => {
    if (support >= 0.7) return 'bg-success text-white';
    if (support >= 0.5) return 'bg-warning text-white';
    return 'bg-danger text-white';
  };

  const getSupportLabel = (support: number) => {
    if (support >= 0.7) return 'High Confidence';
    if (support >= 0.5) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Week Support Bar */}
      <WeekSupportBar currentWeek={currentWeek} weekSupport={weekSupport} />

      {/* Top Recommendation Card */}
      <Card className="glass-panel p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold capitalize">Top Recommendation: {topRec.factor}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust from <span className="font-semibold text-foreground">{topRec.currentValue.toFixed(1)}</span> to{' '}
              <span className="font-semibold text-primary">{topRec.recommendedValue.toFixed(1)}</span>
            </p>
          </div>
          <Badge className={getSupportColor(topRec.support)}>
            {getSupportLabel(topRec.support)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card/50 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <p className="text-sm text-muted-foreground">PEF Uplift</p>
            </div>
            <p className="text-3xl font-bold text-success">+{topRec.pefUplift}</p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Profit Delta</p>
            </div>
            <p className="text-3xl font-bold text-primary">R {topRec.profitDelta}</p>
          </div>

          <div className="p-4 rounded-lg bg-card/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uncertainty</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold">{topRec.support.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground font-mono">
                CI [{topRec.confidence[0].toFixed(1)}, {topRec.confidence[1].toFixed(1)}]
              </p>
            </div>
          </div>
        </div>

        {topRec.riskNote && (
          <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-sm text-warning">{topRec.riskNote}</p>
          </div>
        )}
      </Card>

      {/* Single Treatment Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Dose-Response Curves (Week {currentWeek})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DoseResponseChart doseResponse={doseResponses.light} />
          <DoseResponseChart doseResponse={doseResponses.temp} />
          <DoseResponseChart doseResponse={doseResponses.vent} />
          <DoseResponseChart doseResponse={doseResponses.protein} />
        </div>
      </div>

      {/* Pairwise Treatment Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Pairwise Treatment Interaction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Select Factor 1</label>
            <Select value={factor1} onValueChange={(v) => setFactor1(v as Factor)}>
              <SelectTrigger className="glass-panel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="temp">Temperature</SelectItem>
                <SelectItem value="vent">Ventilation</SelectItem>
                <SelectItem value="protein">Protein</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Select Factor 2</label>
            <Select value={factor2} onValueChange={(v) => setFactor2(v as Factor)}>
              <SelectTrigger className="glass-panel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="temp">Temperature</SelectItem>
                <SelectItem value="vent">Ventilation</SelectItem>
                <SelectItem value="protein">Protein</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <PairwiseHeatmap
          surface={pairwiseSurface}
          currentPos={currentPos}
          recommendedPos={recommendedPos}
        />
      </div>
    </div>
  );
}
