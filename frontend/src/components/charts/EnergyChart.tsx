import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Measurement } from '../../hooks/useEnergyData';

interface EnergyChartProps {
    history: Measurement[];
    unit?: string;
    range?: string;
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ history, unit = 'kWh', range = 'hour' }) => {
    const dataWithDelta = React.useMemo(() => {
        return history.map((item, index) => {
            const previous = history[index - 1];
            // If previous is missing (start of range), or if simple update, delta might need care.
            // For aggregated queries (day/week/month), simple diff might be okay if rows are ordered.
            // Backend returns reverse chronological, here we might need chronological.
            // Actually API returns reverse(), so [oldest, ..., newest].

            const delta = previous
                ? Math.max(0, item.energy_total - previous.energy_total)
                : 0;
            return { ...item, energy_delta: delta };
        });
    }, [history]);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-6">
            <h2 className="text-lg font-bold mb-4">Energy Usage (Delta)</h2>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataWithDelta}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => {
                                const date = new Date(ts);
                                if (range === 'week' || range === 'month') {
                                    return date.toLocaleDateString();
                                }
                                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            }}
                            stroke="#94a3b8"
                            fontSize={12}
                        />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                            labelFormatter={(ts) => new Date(ts).toLocaleString()}
                            cursor={{ fill: '#334155', opacity: 0.4 }}
                        />
                        <Legend />
                        <Bar dataKey="energy_delta" name={`Energy Delta (${unit})`} fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
