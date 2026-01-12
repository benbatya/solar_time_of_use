import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewCards } from './components/dashboard/OverviewCards';
import { PowerChart } from './components/charts/PowerChart';
import { EnergyChart } from './components/charts/EnergyChart';
import { useEnergyData } from './hooks/useEnergyData';

function App() {
  const { latest, history, loading } = useEnergyData();

  if (loading && !latest) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse">Connecting to Energy System...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <OverviewCards data={latest} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <PowerChart history={history} />
        </div>
        <div className="lg:col-span-2">
          <EnergyChart history={history} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default App
