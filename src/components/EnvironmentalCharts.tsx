import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DailyTelemetry } from '@/lib/mock/telemetry';

interface EnvironmentalChartsProps {
  telemetry: DailyTelemetry[];
}

export function EnvironmentalCharts({ telemetry }: EnvironmentalChartsProps) {
  const chartData = telemetry.map(t => ({
    day: t.day,
    tempSetpoint: t.tempSetpoint,
    tempActual: t.tempActual,
    humidity: t.humidity,
    co2: t.co2,
    nh3: t.nh3,
    dust: t.dust,
    feed: t.feedIntakeKg,
    water: t.waterL,
    powerHeater: t.powerHeater,
    powerFans: t.powerFans,
    powerLights: t.powerLights,
    powerTotal: t.powerKwh,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Temperature */}
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
            <Line type="monotone" dataKey="tempActual" stroke="hsl(var(--primary))" strokeWidth={2} name="Actual" />
          </LineChart>
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
            <Line yAxisId="right" type="monotone" dataKey="nh3" stroke="hsl(var(--destructive))" name="NH₃" />
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
            <Area type="monotone" dataKey="powerHeater" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} name="Heater" />
            <Area type="monotone" dataKey="powerFans" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} name="Fans" />
            <Area type="monotone" dataKey="powerLights" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.6} name="Lights" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
