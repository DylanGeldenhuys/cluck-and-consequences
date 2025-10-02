import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DoseResponse } from '@/lib/mock/causal';

interface DoseResponseChartProps {
  doseResponse: DoseResponse;
}

export function DoseResponseChart({ doseResponse }: DoseResponseChartProps) {
  const chartData = doseResponse.doses.map((dose, i) => ({
    dose,
    pef: doseResponse.pefUplift[i],
    lower: doseResponse.ciLower[i],
    upper: doseResponse.ciUpper[i],
    support: doseResponse.support[i],
    ciWidth: doseResponse.ciUpper[i] - doseResponse.ciLower[i],
    meanPef: doseResponse.pefUplift[i],
  }));

  const factorLabels = {
    light: 'Light (hrs/day)',
    temp: 'Temperature (°C)',
    vent: 'Ventilation (%)',
    protein: 'Protein (% CP)',
  };

  // Identify red zones where CI width > 10% of mean uplift
  const redZones = chartData.map(d => d.ciWidth > 0.1 * Math.abs(d.meanPef));

  return (
    <Card className="glass-panel p-4">
      <h4 className="font-semibold mb-3 capitalize">{factorLabels[doseResponse.factor]}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`supportGradient-${doseResponse.factor}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.2} />
              <stop offset="50%" stopColor="hsl(var(--warning))" stopOpacity={0.1} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="dose" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'ΔPEF', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
          <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
          <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
          <Area type="monotone" dataKey="pef" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
          <ReferenceLine x={doseResponse.current} stroke="hsl(var(--accent))" strokeWidth={2} label="Current" />
          <ReferenceLine x={doseResponse.optimal} stroke="hsl(var(--primary))" strokeWidth={2} label="Optimal" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
