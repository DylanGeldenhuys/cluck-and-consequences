import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekSupportBarProps {
  currentWeek: number;
  weekSupport: number[];
}

export function WeekSupportBar({ currentWeek, weekSupport }: WeekSupportBarProps) {
  const getSupportColor = (support: number) => {
    if (support >= 0.7) return 'bg-success';
    if (support >= 0.4) return 'bg-warning';
    return 'bg-danger';
  };

  const getSupportLabel = (support: number) => {
    if (support >= 0.7) return 'High';
    if (support >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Data Support by Week</h3>
      </div>
      <div className="flex gap-2">
        {weekSupport.map((support, idx) => {
          const week = idx + 1;
          const isCurrent = week === currentWeek;
          const isLowSupport = support < 0.4;

          return (
            <TooltipProvider key={week}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'flex-1 rounded-lg h-16 relative transition-all cursor-pointer',
                      getSupportColor(support),
                      isCurrent && 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-105'
                    )}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-medium">W{week}</span>
                      {isLowSupport && (
                        <AlertTriangle className="h-4 w-4 mt-1" />
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="glass-panel">
                  <div className="text-sm">
                    <p className="font-semibold">Week {week}</p>
                    <p className="text-muted-foreground">
                      Support: {getSupportLabel(support)} ({support.toFixed(2)})
                    </p>
                    {isLowSupport && (
                      <p className="text-warning mt-1">
                        ⚠️ Low data support - consider controlled experiments
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}
