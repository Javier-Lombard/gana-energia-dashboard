import { useState } from 'react';
import { BillingChart } from './components/BillingChart/BillingChart';
import { useConsumption } from './hooks/useConsumption';
import type { ViewMode } from './types';

function App() {
  const { consumption, loading, error, refetch } = useConsumption(1);
  const [viewMode, setViewMode] = useState<ViewMode>('eur');

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <BillingChart
        consumption={consumption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}

export default App;
