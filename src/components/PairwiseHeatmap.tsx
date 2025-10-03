import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PairwiseSurface } from '@/lib/mock/causal';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PairwiseHeatmapProps {
  surface: PairwiseSurface;
  currentPos: [number, number];
  recommendedPos: [number, number];
}

export function PairwiseHeatmap({ surface, currentPos, recommendedPos }: PairwiseHeatmapProps) {
  // Transform 2D array into flat data for ScatterChart
  const heatmapData = surface.pefUplift.flatMap((row, i) =>
    row.map((value, j) => ({
      x: surface.doses1[j],
      y: surface.doses2[i],
      pefUplift: value,
      safe: surface.safe[i][j],
      factor1Value: surface.doses1[j],
      factor2Value: surface.doses2[i],
    }))
  );

  // Find min/max for color scaling
  const allValues = surface.pefUplift.flat();
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  // Calculate cell dimensions for proper sizing
  const gridSize = surface.pefUplift.length;
  const cellSize = 400 / gridSize;

  const getColor = (value: number, safe: boolean) => {
    const normalized = (value - minVal) / (maxVal - minVal);
    
    // Red -> Yellow -> Green gradient
    let r, g, b;
    if (normalized < 0.5) {
      // Red to Yellow
      r = 239;
      g = Math.floor(68 + (190 * (normalized * 2)));
      b = 68;
    } else {
      // Yellow to Green
      r = Math.floor(245 - (229 * ((normalized - 0.5) * 2)));
      g = Math.floor(158 + (27 * ((normalized - 0.5) * 2)));
      b = 11 + Math.floor(118 * ((normalized - 0.5) * 2));
    }

    // If unsafe, add transparency
    const alpha = safe ? 1 : 0.5;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">
            {surface.factor1}: {data.factor1Value.toFixed(1)} × {surface.factor2}: {data.factor2Value.toFixed(1)}
          </p>
          <p className="text-sm text-foreground">
            PEF Uplift: <span className="font-bold">{data.pefUplift > 0 ? '+' : ''}{data.pefUplift.toFixed(2)}%</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {data.safe ? 'Safe zone' : 'Insufficient data'}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomCell = (props: any) => {
    const { cx, cy, payload } = props;
    const halfCell = cellSize / 2;
    
    return (
      <g>
        <rect
          x={cx - halfCell}
          y={cy - halfCell}
          width={cellSize}
          height={cellSize}
          fill={getColor(payload.pefUplift, payload.safe)}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
        />
        {/* Draw hatching for unsafe regions */}
        {!payload.safe && (
          <>
            <line
              x1={cx - halfCell}
              y1={cy - halfCell}
              x2={cx + halfCell}
              y2={cy + halfCell}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth={1}
            />
            <line
              x1={cx + halfCell}
              y1={cy - halfCell}
              x2={cx - halfCell}
              y2={cy + halfCell}
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth={1}
            />
          </>
        )}
      </g>
    );
  };

  // Prepare marker data for current and recommended positions
  const markers = [
    { x: currentPos[0], y: currentPos[1], type: 'current' },
    { x: recommendedPos[0], y: recommendedPos[1], type: 'recommended' },
  ];

  const CustomMarker = (props: any) => {
    const { cx, cy, payload } = props;
    
    if (payload.type === 'current') {
      // Blue circle for current position
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="rgba(59, 130, 246, 0.8)" stroke="white" strokeWidth={2} />
        </g>
      );
    } else {
      // Star for recommended position
      const starRadius = 12;
      const starPoints = 5;
      const points = [];
      
      for (let i = 0; i < starPoints * 2; i++) {
        const radius = i % 2 === 0 ? starRadius : starRadius / 2;
        const angle = (i * Math.PI) / starPoints - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${x},${y}`);
      }
      
      return (
        <g>
          <polygon
            points={points.join(' ')}
            fill="hsl(17, 88%, 60%)"
            stroke="white"
            strokeWidth={2}
          />
        </g>
      );
    }
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {surface.factor1} × {surface.factor2} Interaction (Week {surface.week + 1})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis
                type="number"
                dataKey="x"
                name={surface.factor1}
                domain={[surface.doses1[0], surface.doses1[surface.doses1.length - 1]]}
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={surface.factor2}
                domain={[surface.doses2[0], surface.doses2[surface.doses2.length - 1]]}
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              
              {/* Heatmap cells */}
              <Scatter
                data={heatmapData}
                shape={<CustomCell />}
              />
              
              {/* Position markers */}
              <Scatter
                data={markers}
                shape={<CustomMarker />}
              />
            </ScatterChart>
          </ResponsiveContainer>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary"></div>
              <span>Recommended</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-danger via-warning to-success"></div>
              <span>ΔPEF</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
