import { Card } from '@/components/ui/card';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, PolarAngleAxis } from 'recharts';

interface FarmHealthDialProps {
  pef: number;
  fcr: number;
  mortality: number;
  alertCount: number;
}

export function FarmHealthDial({ pef, fcr, mortality, alertCount }: FarmHealthDialProps) {
  // Calculate overall health score (0-100)
  // PEF: higher is better (target ~350+)
  const pefScore = Math.min((pef / 400) * 100, 100) * 0.3;
  // FCR: lower is better (target ~1.5)
  const fcrScore = Math.max((2 - fcr) / 0.5 * 100, 0) * 0.25;
  // Mortality: lower is better (target <5%)
  const mortalityScore = Math.max((5 - mortality) / 5 * 100, 0) * 0.25;
  // Alerts: fewer is better
  const alertScore = Math.max((20 - alertCount) / 20 * 100, 0) * 0.2;
  
  const healthScore = Math.round(pefScore + fcrScore + mortalityScore + alertScore);
  
  // Determine color and status
  let color = 'hsl(0, 84%, 60%)'; // red
  let status = 'Critical';
  
  if (healthScore > 75) {
    color = 'hsl(142, 71%, 45%)'; // green
    status = 'Excellent';
  } else if (healthScore > 50) {
    color = 'hsl(38, 92%, 50%)'; // orange
    status = 'Good';
  }
  
  const data = [
    {
      name: 'Health',
      value: healthScore,
      fill: color,
    },
  ];
  
  return (
    <Card className="glass-panel p-6">
      <h2 className="text-2xl font-semibold mb-4">Overall Farm Health</h2>
      <ResponsiveContainer width="100%" height={280}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="60%" 
          outerRadius="90%" 
          barSize={20} 
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
            fill={color}
          />
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-5xl font-bold"
          >
            {healthScore}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-sm"
          >
            {status}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div className="p-2 rounded-lg bg-card/50">
          <p className="text-muted-foreground text-xs">PEF Contribution</p>
          <p className="font-semibold text-primary">{(pefScore / 0.3).toFixed(0)}%</p>
        </div>
        <div className="p-2 rounded-lg bg-card/50">
          <p className="text-muted-foreground text-xs">FCR Contribution</p>
          <p className="font-semibold text-success">{(fcrScore / 0.25).toFixed(0)}%</p>
        </div>
        <div className="p-2 rounded-lg bg-card/50">
          <p className="text-muted-foreground text-xs">Mortality Impact</p>
          <p className="font-semibold text-accent">{(mortalityScore / 0.25).toFixed(0)}%</p>
        </div>
        <div className="p-2 rounded-lg bg-card/50">
          <p className="text-muted-foreground text-xs">Alert Impact</p>
          <p className="font-semibold text-warning">{(alertScore / 0.2).toFixed(0)}%</p>
        </div>
      </div>
    </Card>
  );
}
