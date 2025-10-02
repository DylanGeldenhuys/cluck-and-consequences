import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { House } from '@/lib/mock/houses';
import { WeeklyMetrics } from '@/lib/mock/weekly';
import { Anomaly } from '@/lib/mock/anomalies';

interface HouseCardProps {
  house: House;
  weeklyMetrics: WeeklyMetrics[];
  anomalies: Anomaly[];
}

export function HouseCard({ house, weeklyMetrics, anomalies }: HouseCardProps) {
  const navigate = useNavigate();
  const currentWeek = Math.ceil(house.currentDay / 7);
  const currentMetrics = weeklyMetrics.find(m => m.week === currentWeek);
  
  // Calculate profit improvement (mock 3% per week cumulative)
  const profitImprovement = ((1 + currentWeek * 0.03) - 1) * 100;
  
  // Count critical anomalies
  const criticalCount = anomalies.filter(a => a.severity === 'high').length;

  return (
    <Card 
      className="glass-panel p-6 cursor-pointer hover:bg-card/80 transition-all hover:scale-[1.02]"
      onClick={() => navigate(`/house/${house.id}`)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">{house.id}</Badge>
            <h3 className="text-lg font-semibold">{house.name}</h3>
            <p className="text-sm text-muted-foreground">
              Day {house.currentDay} • {house.currentBirds.toLocaleString()} birds
            </p>
          </div>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {criticalCount}
            </Badge>
          )}
        </div>

        {currentMetrics && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Profit Improvement</span>
              <span className="text-lg font-bold text-success">
                +{profitImprovement.toFixed(1)}%
              </span>
            </div>
            <div className="h-1 bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-primary transition-all"
                style={{ width: `${Math.min(profitImprovement, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
