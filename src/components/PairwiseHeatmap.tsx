import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PairwiseSurface } from '@/lib/mock/causal';
import { useEffect, useRef } from 'react';

interface PairwiseHeatmapProps {
  surface: PairwiseSurface;
  currentPos: [number, number];
  recommendedPos: [number, number];
}

export function PairwiseHeatmap({ surface, currentPos, recommendedPos }: PairwiseHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const gridSize = surface.pefUplift.length;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max for color scaling
    const allValues = surface.pefUplift.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    // Draw heatmap
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const value = surface.pefUplift[i][j];
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

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(j * cellWidth, (gridSize - 1 - i) * cellHeight, cellWidth, cellHeight);

        // Draw unsafe regions with hatching
        if (!surface.safe[i][j]) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(j * cellWidth, (gridSize - 1 - i) * cellHeight);
          ctx.lineTo((j + 1) * cellWidth, (gridSize - i) * cellHeight);
          ctx.moveTo((j + 1) * cellWidth, (gridSize - 1 - i) * cellHeight);
          ctx.lineTo(j * cellWidth, (gridSize - i) * cellHeight);
          ctx.stroke();
        }
      }
    }

    // Draw current position (blue circle)
    const currentX = ((currentPos[0] - surface.doses1[0]) / (surface.doses1[gridSize - 1] - surface.doses1[0])) * width;
    const currentY = height - ((currentPos[1] - surface.doses2[0]) / (surface.doses2[gridSize - 1] - surface.doses2[0])) * height;
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw recommended position (yellow-orange star)
    const recX = ((recommendedPos[0] - surface.doses1[0]) / (surface.doses1[gridSize - 1] - surface.doses1[0])) * width;
    const recY = height - ((recommendedPos[1] - surface.doses2[0]) / (surface.doses2[gridSize - 1] - surface.doses2[0])) * height;
    
    ctx.fillStyle = 'hsl(17, 88%, 60%)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    const starRadius = 12;
    const starPoints = 5;
    
    ctx.beginPath();
    for (let i = 0; i < starPoints * 2; i++) {
      const radius = i % 2 === 0 ? starRadius : starRadius / 2;
      const angle = (i * Math.PI) / starPoints - Math.PI / 2;
      const x = recX + radius * Math.cos(angle);
      const y = recY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [surface, currentPos, recommendedPos]);

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-lg capitalize">
          {surface.factor1} × {surface.factor2} Interaction (Week {surface.week + 1})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={400}
              className="w-full rounded-lg border border-border"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{surface.doses1[0].toFixed(1)}</span>
            <span className="capitalize">{surface.factor1}</span>
            <span>{surface.doses1[surface.doses1.length - 1].toFixed(1)}</span>
          </div>
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
