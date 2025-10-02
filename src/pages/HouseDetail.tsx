import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, Activity, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/KpiCard';
import { AnomalyTimeline } from '@/components/AnomalyTimeline';
import { EnvironmentalCharts } from '@/components/EnvironmentalChartsNew';
import { AdvisoryPanel } from '@/components/AdvisoryPanelNew';
import { getHouse, getHouseTelemetry, getHouseWeeklyMetrics, getHouseAnomalies, getModelRunDate } from '@/lib/mock/state';

export default function HouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const house = getHouse(id!);
  const telemetry = getHouseTelemetry(id!);
  const weeklyMetrics = getHouseWeeklyMetrics(id!);
  const anomalies = getHouseAnomalies(id!);

  if (!house) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">House not found</h1>
          <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentWeek = Math.ceil(house.currentDay / 7);
  const currentMetrics = weeklyMetrics.find(m => m.week === currentWeek);
  const profitImprovement = ((1 + currentWeek * 0.03) - 1) * 100;
  const modelRunDate = getModelRunDate(house);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-panel sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{house.id}</Badge>
                  <h1 className="text-2xl font-bold">{house.name}</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  {house.currentBirds.toLocaleString()} birds • {house.floorArea} m² • Day {house.currentDay} • Week {currentWeek} • Model last run: {modelRunDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* KPIs */}
        {currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard
              title="Daily Profit"
              value={`R ${currentMetrics.profit.toFixed(2)}`}
              change={{ value: profitImprovement, label: 'improvement' }}
              icon={DollarSign}
              variant="success"
            />
            <KpiCard
              title="PEF"
              value={currentMetrics.pef.toFixed(1)}
              icon={TrendingUp}
              variant="success"
            />
            <KpiCard
              title="FCR"
              value={currentMetrics.fcr.toFixed(2)}
              icon={Activity}
              variant="success"
            />
            <KpiCard
              title="Mortality"
              value={`${currentMetrics.mortality.toFixed(2)}%`}
              icon={Skull}
              variant={currentMetrics.mortality > 0.15 ? 'danger' : 'default'}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="glass-panel">
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="advisory">Advisory</TabsTrigger>
          </TabsList>

          <TabsContent value="operations" className="space-y-6">
            <AnomalyTimeline anomalies={anomalies} />
            <EnvironmentalCharts telemetry={telemetry} initialBirds={house.capacity} />
          </TabsContent>

          <TabsContent value="advisory">
            <AdvisoryPanel house={house} telemetry={telemetry} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
