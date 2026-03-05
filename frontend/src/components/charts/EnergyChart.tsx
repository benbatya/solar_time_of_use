import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Measurement } from '../../hooks/useEnergyData';

interface EnergyChartProps {
    history: Measurement[];
    unit?: string;
    range?: string;
}

function getTouPeriod(timestamp: number): 'peak' | 'mid_peak' | 'off_peak' {
    const hour = new Date(timestamp).getHours();
    if (hour >= 16 && hour < 21) return 'peak';
    if ((hour >= 15 && hour < 16) || hour >= 21) return 'mid_peak';
    return 'off_peak';
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ history, unit = 'kWh', range = 'prev_60_minutes' }) => {
    const chartData = React.useMemo(() => {
        const isWeekOrMonth = range === 'prev_7_days' || range === 'prev_30_days' || range === 'prev_180_days' || range === 'prev_360_days' || range === 'current_month_days';

        if (isWeekOrMonth) {
            // Backend provides pre-computed TOU energy per day
            return history.map(item => ({
                ...item,
                energy_peak: item.energy_peak || 0,
                energy_mid_peak: item.energy_mid_peak || 0,
                energy_off_peak: item.energy_off_peak || 0,
            }));
        }

        // For hour/day: compute inter-bucket deltas, then classify by TOU period
        return history.map((item, index) => {
            const previous = history[index - 1];
            const currentTotal = item.energy_total || 0;
            const previousTotal = previous?.energy_total || 0;

            let delta = 0;
            if (currentTotal > 0 && previousTotal > 0) {
                delta = Math.max(0, currentTotal - previousTotal);
            }

            const period = getTouPeriod(item.timestamp);
            return {
                ...item,
                energy_total: currentTotal,
                energy_peak: period === 'peak' ? delta : 0,
                energy_mid_peak: period === 'mid_peak' ? delta : 0,
                energy_off_peak: period === 'off_peak' ? delta : 0,
            };
        });
    }, [history, range]);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-6">
            <h2 className="text-lg font-bold mb-4">Energy Usage</h2>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => {
                                const date = new Date(ts);
                                if (range === 'prev_7_days' || range === 'prev_30_days' || range === 'prev_180_days' || range === 'prev_360_days' || range === 'current_month_days') {
                                    return date.toLocaleDateString();
                                }
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }}
                            stroke="#94a3b8"
                            fontSize={12}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} unit={` ${unit}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            labelFormatter={(ts) => new Date(ts).toLocaleString()}
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                            formatter={(value: number | undefined) => [value == null ? '' : `${value.toFixed(3)} ${unit}`, undefined]}
                        />
                        <Legend />
                        <Bar dataKey="energy_off_peak" stackId="tou" name={`Off-Peak (${unit})`} fill="#22c55e" />
                        <Bar dataKey="energy_mid_peak" stackId="tou" name={`Mid-Peak (${unit})`} fill="#eab308" />
                        <Bar dataKey="energy_peak" stackId="tou" name={`Peak (${unit})`} fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
