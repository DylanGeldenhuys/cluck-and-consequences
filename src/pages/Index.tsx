import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { DollarSign, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/KpiCard';
import { HouseCard } from '@/components/HouseCard';
import { getAppState } from '@/lib/mock/state';

export default function Index() {
  const navigate = useNavigate();
  const [state] = useState(() => getAppState());

  // Calculate fleet-wide KPIs
  const totalDailyProfit = Array.from(state.weeklyMetrics.values())
    .flat()
    .reduce((sum, m) => sum + m.profit, 0) / state.houses.length;

  const avgPef = Array.from(state.weeklyMetrics.values())
    .flat()
    .reduce((sum, m) => sum + m.pef, 0) / Array.from(state.weeklyMetrics.values()).flat().length;

  const avgFcr = Array.from(state.weeklyMetrics.values())
    .flat()
    .reduce((sum, m) => sum + m.fcr, 0) / Array.from(state.weeklyMetrics.values()).flat().length;

  const criticalAlerts = Array.from(state.anomalies.values())
    .flat()
    .filter(a => a.severity === 'high').length;

  const topAnomalies = Array.from(state.anomalies.values())
    .flat()
    .filter(a => a.severity === 'high')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gradient">OptiBroiler Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time monitoring across {state.houses.length} broiler houses</p>
          </div>
          <Button onClick={() => navigate('/reports')} size="lg" className="bg-primary hover:bg-primary/90">
            View Reports
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* KPI Headband */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Daily Profit"
            value={`R ${totalDailyProfit.toFixed(2)}`}
            change={{ value: 17.6, label: 'vs last cycle' }}
            icon={DollarSign}
            variant="success"
          />
          <KpiCard
            title="Fleet PEF"
            value={avgPef.toFixed(1)}
            change={{ value: 8.7, label: 'vs baseline' }}
            icon={TrendingUp}
            variant="success"
          />
          <KpiCard
            title="Avg FCR"
            value={avgFcr.toFixed(2)}
            change={{ value: 6.3, label: 'improvement' }}
            icon={Activity}
            variant="success"
          />
          <KpiCard
            title="Critical Alerts"
            value={criticalAlerts}
            icon={AlertTriangle}
            variant={criticalAlerts > 10 ? 'danger' : 'warning'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* House Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">House Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.houses.map(house => (
                <HouseCard
                  key={house.id}
                  house={house}
                  weeklyMetrics={state.weeklyMetrics.get(house.id) || []}
                  anomalies={state.anomalies.get(house.id) || []}
                />
              ))}
            </div>
          </div>

          {/* Fleet Alerts Panel */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Critical Alerts</h2>
            <Card className="glass-panel p-6">
              <div className="space-y-4">
                {topAnomalies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No critical alerts</p>
                ) : (
                  topAnomalies.map(anomaly => (
                    <div
                      key={anomaly.id}
                      className="p-4 rounded-lg bg-card/50 border border-destructive/20 cursor-pointer hover:bg-card transition-colors"
                      onClick={() => navigate(`/house/${anomaly.houseId}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="destructive">{anomaly.houseId}</Badge>
                        <span className="text-xs text-muted-foreground">Day {anomaly.day}</span>
                      </div>
                      <p className="text-sm font-semibold mb-1">{anomaly.metric}</p>
                      <p className="text-xs text-muted-foreground">{anomaly.message}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
