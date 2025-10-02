import { useState } from 'react';
import { HouseCard } from '@/components/HouseCard';
import { getAppState } from '@/lib/mock/state';

export default function Houses() {
  const [state] = useState(() => getAppState());

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">All Broiler Houses</h1>
          <p className="text-muted-foreground">
            Monitoring {state.houses.length} houses across the facility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
