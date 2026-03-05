import { useState } from 'react';
import { OverviewCards } from '../components/dashboard/OverviewCards';
import { TouCostWidget } from '../components/dashboard/TouCostWidget';
import { EnergyChart } from '../components/charts/EnergyChart';
import { RealtimeChart } from '../components/charts/RealtimeChart';
import { useEnergyData } from '../hooks/useEnergyData';

export const Dashboard = () => {
    const [timeRange, setTimeRange] = useState('prev_60_minutes');
    const { realtime, history, loading } = useEnergyData(timeRange);
    const latest = realtime.length > 0 ? realtime[realtime.length - 1] : null;

    if (loading && !realtime) {
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
                    <option value="prev_60_minutes">Previous 60 Minutes</option>
                    <option value="current_day_hours">Today (by Hour)</option>
                    <option value="prev_24_hours">Previous 24 Hours</option>
                    <option value="current_week_days">Current Week</option>
                    <option value="prev_7_days">Previous 7 Days</option>
                    <option value="current_month_days">Current Month</option>
                    <option value="prev_30_days">Previous 30 Days</option>
                    <option value="prev_180_days">Previous 180 Days</option>
                    <option value="current_year_days">Current Year</option>
                    <option value="prev_360_days">Previous 360 Days</option>
                </select>
            </div>

            <OverviewCards data={latest} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <TouCostWidget history={history} range={timeRange} />
                    <EnergyChart history={history} unit={timeRange === 'prev_60_minutes' ? 'Wh' : 'kWh'} range={timeRange} />
                    <RealtimeChart data={realtime} />
                </div>
            </div>
        </>
    );
};
