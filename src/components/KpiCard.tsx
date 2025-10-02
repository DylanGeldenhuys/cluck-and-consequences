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
    <Card className="glass-panel p-6 hover:bg-card/80 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <div className="flex items-center gap-1 text-sm">
              {change.value >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span className={cn(change.value >= 0 ? 'text-success' : 'text-destructive')}>
                {change.value >= 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-muted-foreground">{change.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-card/50', variantClasses[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
