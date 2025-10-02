import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Anomaly } from '@/lib/mock/anomalies';
import { cn } from '@/lib/utils';

interface AnomalyTimelineProps {
  anomalies: Anomaly[];
  onAnomalyClick?: (anomaly: Anomaly) => void;
}

export function AnomalyTimeline({ anomalies, onAnomalyClick }: AnomalyTimelineProps) {
  const sortedAnomalies = [...anomalies].sort((a, b) => a.day - b.day);

  const severityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-warning text-black',
    low: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4">Anomaly Timeline</h3>
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 gap-4">
          {sortedAnomalies.length === 0 ? (
            <p className="text-muted-foreground text-center w-full py-8">No anomalies detected</p>
          ) : (
            sortedAnomalies.map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onAnomalyClick?.(anomaly)}
              >
                <div className="w-48 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={cn('text-xs', severityColors[anomaly.severity])}>
                      Day {anomaly.day}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{anomaly.severity}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-card/50 border border-border">
                    <p className="text-sm font-semibold mb-1">{anomaly.metric}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{anomaly.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
