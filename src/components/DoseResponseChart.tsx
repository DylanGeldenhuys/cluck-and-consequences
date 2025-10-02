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
  }));

  const factorLabels = {
    light: 'Light (hrs/day)',
    temp: 'Temperature (°C)',
    vent: 'Ventilation (%)',
    protein: 'Protein (% CP)',
  };

  return (
    <Card className="glass-panel p-4">
      <h4 className="font-semibold mb-3 capitalize">{factorLabels[doseResponse.factor]}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="dose" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'ΔPEF', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))' }} />
          <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
          <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.1} />
          <Area type="monotone" dataKey="pef" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
          <ReferenceLine x={doseResponse.current} stroke="hsl(var(--muted))" strokeDasharray="3 3" label="Current" />
          <ReferenceLine x={doseResponse.optimal} stroke="hsl(var(--success))" strokeDasharray="3 3" label="Optimal" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
