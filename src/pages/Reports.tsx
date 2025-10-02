import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAppState } from '@/lib/mock/state';

export default function Reports() {
  const navigate = useNavigate();
  const state = getAppState();

  // Calculate aggregated metrics
  const totalProfitImprovement = state.houses.reduce((sum, house) => {
    const metrics = state.weeklyMetrics.get(house.id) || [];
    const weekProfit = metrics.reduce((s, m) => s + m.profit, 0);
    return sum + weekProfit;
  }, 0);

  const avgPefImprovement = 12.4;
  const fcrImprovement = -0.18;

  // Profit trend data (current vs baseline)
  const profitTrend = [1, 2, 3, 4, 5, 6].map(week => {
    const currentProfit = Array.from(state.weeklyMetrics.values())
      .flat()
      .filter(m => m.week === week)
      .reduce((sum, m) => sum + m.profit, 0) / state.houses.length;
    
    const baseline = currentProfit / (1 + week * 0.03);
    
    return {
      week: `Week ${week}`,
      current: Number(currentProfit.toFixed(0)),
      baseline: Number(baseline.toFixed(0)),
    };
  });

  // PEF trend data
  const pefTrend = [1, 2, 3, 4, 5, 6].map(week => {
    const currentPef = Array.from(state.weeklyMetrics.values())
      .flat()
      .filter(m => m.week === week)
      .reduce((sum, m) => sum + m.pef, 0) / state.houses.length;
    
    const baseline = currentPef * 0.92;
    
    return {
      week: `Week ${week}`,
      current: Number(currentPef.toFixed(1)),
      baseline: Number(baseline.toFixed(1)),
    };
  });

  // Savings breakdown
  const savingsData = [
    { category: 'Feed Optimization', value: totalProfitImprovement * 0.35, color: 'hsl(var(--success))' },
    { category: 'Energy Efficiency', value: totalProfitImprovement * 0.28, color: 'hsl(var(--primary))' },
    { category: 'Mortality Reduction', value: totalProfitImprovement * 0.22, color: 'hsl(var(--accent))' },
    { category: 'Other', value: totalProfitImprovement * 0.15, color: 'hsl(var(--warning))' },
  ];

  // Top improvements by house
  const houseImprovements = state.houses.map(house => {
    const metrics = state.weeklyMetrics.get(house.id) || [];
    const avgProfit = metrics.reduce((sum, m) => sum + m.profit, 0) / metrics.length;
    const week = Math.ceil(house.currentDay / 7);
    const improvement = ((1 + week * 0.03) - 1) * 100;
    
    return {
      id: house.id,
      profit: avgProfit,
      improvement,
    };
  }).sort((a, b) => b.improvement - a.improvement);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass-panel">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gradient">Performance Reports</h1>
              <p className="text-muted-foreground mt-2">AI-powered insights and improvements</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <h3 className="font-semibold">Total Profit Improvement</h3>
            </div>
            <p className="text-3xl font-bold text-success">R {totalProfitImprovement.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground mt-1">+17.6% vs baseline cycle</p>
          </Card>

          <Card className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Avg PEF Improvement</h3>
            </div>
            <p className="text-3xl font-bold text-primary">+{avgPefImprovement}</p>
            <p className="text-sm text-muted-foreground mt-1">+8.7% vs baseline</p>
          </Card>

          <Card className="glass-panel p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">FCR Improvement</h3>
            </div>
            <p className="text-3xl font-bold text-accent">{fcrImprovement}</p>
            <p className="text-sm text-muted-foreground mt-1">Better efficiency</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Profit Trend */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-6">Profit Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={profitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Daily Profit (R)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="hsl(var(--success))" strokeWidth={3} name="Current Cycle" />
                <Line type="monotone" dataKey="baseline" stroke="hsl(var(--muted))" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* PEF Trend */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-6">PEF Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={pefTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'PEF', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={3} name="Current Cycle" />
                <Line type="monotone" dataKey="baseline" stroke="hsl(var(--muted))" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Savings Breakdown */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-6">Savings Breakdown</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={savingsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" label={{ value: 'Savings (R)', position: 'bottom' }} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={150} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R ${value.toFixed(0)}`, 'Savings']}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {savingsData.map((entry, index) => (
                    <Bar key={index} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Improvements by House */}
          <Card className="glass-panel p-6">
            <h2 className="text-2xl font-semibold mb-6">Top Improvements by House</h2>
            <div className="space-y-3">
              {houseImprovements.map((house, index) => (
                <div
                  key={house.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors"
                  onClick={() => navigate(`/house/${house.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">{index + 1}</span>
                    <div>
                      <p className="font-semibold">{house.id}</p>
                      <p className="text-sm text-muted-foreground">R {house.profit.toFixed(0)} daily</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-success">+{house.improvement.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">improvement</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
