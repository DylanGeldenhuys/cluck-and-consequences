import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: { value: number; label: string };
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function KpiCard({ title, value, change, icon: Icon, variant = 'default' }: KpiCardProps) {
  const variantClasses = {
    default: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-destructive',
  };

  return (
    <Card className="glass-panel p-4 hover:bg-card/80 transition-all overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground truncate">{value}</p>
          {change && (
            <div className="flex items-center gap-1 text-sm flex-wrap">
              {change.value >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-success flex-shrink-0" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
              )}
              <span className={cn(change.value >= 0 ? 'text-success' : 'text-destructive', 'whitespace-nowrap')}>
                {change.value >= 0 ? '+' : ''}{change.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground text-xs truncate">{change.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-2.5 rounded-lg bg-card/50 flex-shrink-0', variantClasses[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
