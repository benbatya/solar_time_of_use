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
        // Backend now handles valid 60-datapoint return for 'hour' range via CTE.
        // We just need to calculate deltas.

        // Data is returned reverse chronological (DESC), so [newest, ..., oldest]
        // But for delta calculation we need (current - previous_in_time).
        // If the array is [newest, oldest], 'previous' in loop usually refers to older index? 
        // Array.map index-1 is the *newer* element if sorted DESC? 
        // Wait, standard map iteration: index 0 (newest), index 1 (older).
        // previous = history[index-1] -> if index=0, previous=undefined.

        // Let's create a sorted copy for easier logic? Or just handle it.
        // Charts usually want Oldest -> Newest.
        // The backend returns DESC.
        // The endpoint does `res.json(results.reverse())` at the end!
        // So the frontend receives ASCending order (Oldest -> Newest).

        // So index 0 is Oldest. index 1 is Newest.
        // previous = history[index-1] is the older point. This is correct.

        return history.map((item, index) => {
            const previous = history[index - 1];
            // If item has no energy_total (null/0 from gap), delta is 0?
            // If previous had no energy_total, delta is 0?

            // Note: If energy_total is null from SQL (gap), what do we get? 
            // Better-sqlite3/Kysely might return null.
            // frontend interface says `energy_total: number`.

            const currentTotal = item.energy_total || 0;
            const previousTotal = previous?.energy_total || 0;

            // If we have a gap (currentTotal is 0/null), delta is 0.
            // If previous was a gap (previousTotal 0), but current is valid,
            // delta = current - 0 = huge? No.
            // If previous is missing/0, we probably shouldn't calculate a huge delta.

            let delta = 0;
            if (currentTotal > 0 && previousTotal > 0) {
                delta = Math.max(0, currentTotal - previousTotal);
            }

            return {
                ...item,
                energy_total: currentTotal, // Ensure number for safety
                energy_delta: delta
            };
        });
    }, [history]);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-6">
            <h2 className="text-lg font-bold mb-4">Energy Usage</h2>
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
