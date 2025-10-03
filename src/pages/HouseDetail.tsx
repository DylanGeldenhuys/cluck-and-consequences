import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, Activity, Skull, Sparkles } from 'lucide-react';
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
  const prevWeekMetrics = weeklyMetrics.find(m => m.week === currentWeek - 1);
  
  // Calculate week-over-week changes
  const profitChange = prevWeekMetrics && currentMetrics
    ? ((currentMetrics.profit - prevWeekMetrics.profit) / prevWeekMetrics.profit * 100)
    : 0;
  const pefChange = prevWeekMetrics && currentMetrics
    ? ((currentMetrics.pef - prevWeekMetrics.pef) / prevWeekMetrics.pef * 100)
    : 0;
  const fcrChange = prevWeekMetrics && currentMetrics
    ? ((currentMetrics.fcr - prevWeekMetrics.fcr) / prevWeekMetrics.fcr * 100)
    : 0;
  const mortalityChange = prevWeekMetrics && currentMetrics
    ? ((currentMetrics.mortality - prevWeekMetrics.mortality) / prevWeekMetrics.mortality * 100)
    : 0;
  
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
              change={{ value: profitChange, label: 'vs last week' }}
              icon={DollarSign}
              variant="success"
            />
            <KpiCard
              title="PEF"
              value={currentMetrics.pef.toFixed(1)}
              change={{ value: pefChange, label: 'vs last week' }}
              icon={TrendingUp}
              variant="success"
            />
            <KpiCard
              title="FCR"
              value={currentMetrics.fcr.toFixed(2)}
              change={{ value: fcrChange, label: 'vs last week' }}
              icon={Activity}
              variant="success"
            />
            <KpiCard
              title="Mortality"
              value={`${currentMetrics.mortality.toFixed(1)}%`}
              change={{ value: mortalityChange, label: 'vs last week' }}
              icon={Skull}
              variant={currentMetrics.mortality > 0.15 ? 'danger' : 'default'}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="glass-panel p-2 h-16 gap-2">
            <TabsTrigger 
              value="operations"
              className="h-full px-6 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50 hover:bg-muted/50 transition-all duration-300"
            >
              <Activity className="mr-2 h-5 w-5" />
              Operations
            </TabsTrigger>
            <TabsTrigger 
              value="advisory"
              className="relative h-full px-6 text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/50 hover:bg-muted/50 transition-all duration-300 before:absolute before:inset-0 before:rounded-md before:p-[2px] before:bg-gradient-to-r before:from-orange-400 before:to-yellow-400 before:-z-10 before:opacity-50 data-[state=active]:before:opacity-100 data-[state=active]:before:animate-pulse"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Advisory
              <Badge className="ml-2 bg-orange-600/80 text-white text-xs border-0">AI</Badge>
            </TabsTrigger>
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
