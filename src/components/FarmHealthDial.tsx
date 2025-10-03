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
      <ResponsiveContainer width="100%" height={240}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="90%" 
          barSize={25} 
          data={data}
          startAngle={90}
          endAngle={-270}
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
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-5xl font-bold"
          >
            {healthScore}
          </text>
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-sm font-medium"
          >
            {status}
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </Card>
  );
}
