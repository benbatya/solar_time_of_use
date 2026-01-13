import { useState } from 'react';
import { OverviewCards } from '../components/dashboard/OverviewCards';
import { PowerChart } from '../components/charts/PowerChart';
import { EnergyChart } from '../components/charts/EnergyChart';
import { useEnergyData } from '../hooks/useEnergyData';

export const Dashboard = () => {
    const [timeRange, setTimeRange] = useState('hour');
    const { latest, history, loading } = useEnergyData(timeRange);

    if (loading && !latest) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="animate-pulse">Connecting to Energy System...</div>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Solar Time-of-Use Optimized</h1>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="hour">Last Hour</option>
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                </select>
            </div>

            <OverviewCards data={latest} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <PowerChart history={history} />
                </div>
                <div className="lg:col-span-2">
                    <EnergyChart history={history} unit={timeRange === 'hour' ? 'Wh' : 'kWh'} />
                </div>
            </div>
        </>
    );
};
