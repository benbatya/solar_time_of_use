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
    const rangeIsDays = range === 'prev_7_days' || range === 'prev_30_days' || range === 'prev_180_days' || range === 'prev_360_days' || range === 'current_week_days' || range === 'current_month_days' || range === 'current_year_days' || range === 'current_day_hours';

    const chartData = React.useMemo(() => {
        if (rangeIsDays) {
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
                                if (range === 'current_day_hours') {
                                    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                                }
                                if (rangeIsDays) {
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
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null;
                                const total = payload.reduce((sum, entry) => sum + ((entry.value as number) || 0), 0);
                                return (
                                    <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '8px 12px', borderRadius: 6 }}>
                                        <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label != null ? (rangeIsDays && range !== 'current_day_hours' ? new Date(label).toLocaleDateString() : new Date(label).toLocaleString()) : ''}</p>
                                        {payload.map(entry => (
                                            <p key={entry.dataKey as string} style={{ color: entry.color, margin: '2px 0' }}>
                                                {entry.name}: {((entry.value as number) || 0).toFixed(3)} {unit}
                                            </p>
                                        ))}
                                        <p style={{ color: 'white', marginTop: 6, borderTop: '1px solid #334155', paddingTop: 4 }}>
                                            Total: {total.toFixed(3)} {unit}
                                        </p>
                                    </div>
                                );
                            }}
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
