import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { DailyTelemetry } from '@/lib/mock/telemetry';
import { calculateDailyFCR, calculateDailyPEF } from '@/lib/mock/helpers';

interface EnvironmentalChartsProps {
  telemetry: DailyTelemetry[];
  initialBirds: number;
}

export function EnvironmentalCharts({ telemetry, initialBirds }: EnvironmentalChartsProps) {
  let cumulativeFeed = 0;
  let cumulativeMortality = 0;
  
  const chartData = telemetry.map(t => {
    cumulativeFeed += t.feedIntakeKg;
    cumulativeMortality += t.mortality;
    const fcr = calculateDailyFCR(t, cumulativeFeed, t.avgWeightKg, initialBirds);
    const mortalityRate = cumulativeMortality / initialBirds;
    const pef = calculateDailyPEF(t.avgWeightKg, fcr, mortalityRate, t.day);

    return {
      day: t.day,
      tempSetpoint: t.tempSetpoint,
      tempActual: t.tempActual,
      outsideTemp: t.outsideTemp,
      humidity: t.humidity,
      co2: t.co2,
      nh3: t.nh3,
      dust: t.dust,
      feed: t.feedIntakeKg,
      water: t.waterL,
      powerHeater: t.powerHeater,
      powerFans: t.powerFans,
      powerLights: t.powerLights,
      avgWeight: t.avgWeightKg,
      fcr: fcr,
      pef: pef,
      mortality: t.mortality * 100,
      airspeed: t.airspeedMs,
      noise: t.chickenNoiseDb,
      movement: t.movementIndex,
      spread: t.spreadMetric,
      coughingDetected: t.coughingDetected ? t.chickenNoiseDb : null,
      raisedVolume: t.raisedVolumeDetected ? t.chickenNoiseDb : null,
    };
  });

  // Latest clustering data for heatmap
  const latestTelemetry = telemetry[telemetry.length - 1];
  const clusterData = latestTelemetry?.chickenClustering || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Comparison */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Temperature (°C)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="tempSetpoint" stroke="hsl(var(--muted))" strokeDasharray="5 5" name="Setpoint" />
              <Line type="monotone" dataKey="tempActual" stroke="hsl(var(--primary))" strokeWidth={2} name="Inside" />
              <Line type="monotone" dataKey="outsideTemp" stroke="hsl(var(--accent))" name="Outside" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Average Bird Weight */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Average Bird Weight (kg)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="avgWeight" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* FCR */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Feed Conversion Ratio (FCR)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="fcr" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* PEF */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Production Efficiency Factor (PEF)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="pef" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Mortality */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Mortality (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="mortality" fill="hsl(var(--danger))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Humidity */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Humidity (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="humidity" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* CO2 & NH3 */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">CO₂ & NH₃ (ppm)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="co2" stroke="hsl(var(--warning))" name="CO₂" />
              <Line yAxisId="right" type="monotone" dataKey="nh3" stroke="hsl(var(--danger))" name="NH₃" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dust */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Dust (mg/m³)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="dust" stroke="hsl(var(--muted))" fill="hsl(var(--muted))" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Airspeed */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Airspeed (m/s)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="airspeed" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Chicken Noise */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Chicken Noise (dB)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[50, 85]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line type="monotone" dataKey="noise" stroke="hsl(var(--accent))" name="Noise Level" />
              <Line type="monotone" dataKey="coughingDetected" stroke="hsl(var(--danger))" strokeWidth={3} name="Coughing" />
              <Line type="monotone" dataKey="raisedVolume" stroke="hsl(var(--warning))" strokeWidth={3} name="Raised Volume" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Movement Index */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Movement Index</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area type="monotone" dataKey="movement" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Spread Uniformity */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Spread Uniformity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="spread" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Feed & Water */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Feed (kg) & Water (L)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="feed" stroke="hsl(var(--success))" name="Feed (kg)" />
              <Line yAxisId="right" type="monotone" dataKey="water" stroke="hsl(var(--primary))" name="Water (L)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Power */}
        <Card className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4">Power Consumption (kWh)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="powerHeater" stackId="1" stroke="hsl(var(--danger))" fill="hsl(var(--danger))" fillOpacity={0.6} name="Heater" />
              <Area type="monotone" dataKey="powerFans" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Fans" />
              <Area type="monotone" dataKey="powerLights" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.6} name="Lights" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* 2D Clustering Heatmap */}
      <Card className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4">Chicken Clustering (Day {latestTelemetry?.day})</h3>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-10 gap-1 p-4 bg-card/30 rounded-lg">
            {clusterData.map((row, i) => (
              row.map((density, j) => {
                const intensity = Math.floor(density * 255);
                const color = `rgb(${255 - intensity}, ${100 + intensity/2}, ${intensity})`;
                return (
                  <div
                    key={`${i}-${j}`}
                    className="w-8 h-8 rounded-sm border border-border/30"
                    style={{ backgroundColor: color }}
                    title={`Position [${i},${j}]: ${density.toFixed(2)}`}
                  />
                );
              })
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-8 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgb(255, 100, 0)' }}></div>
            <span>Low Density</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgb(0, 227, 255)' }}></div>
            <span>High Density</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
