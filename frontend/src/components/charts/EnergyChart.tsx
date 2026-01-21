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
        if (range === 'hour') {
            const now = Date.now();
            // align to minute
            const end = Math.floor(now / 60000) * 60000;
            const start = end - 59 * 60000; // 60 minutes total (including end)

            // Create map of existing data normalized to minute
            const dataMap = new Map();
            history.forEach(item => {
                const minuteTs = Math.floor(item.timestamp / 60000) * 60000;
                dataMap.set(minuteTs, item);
            });

            const filledData = [];
            let lastEnergyTotal = history.length > 0 ? history[0].energy_total : 0;
            // Use the first available data point's energy strictly for the first non-gap delta calculation if possible.
            // But we iterate chronologically. 
            // Better strategy: Just iterate the 60 minutes.

            for (let i = 0; i < 60; i++) {
                const ts = start + i * 60000;
                const match = dataMap.get(ts);

                if (match) {
                    // We have data
                    // Try to find previous real data point's energy for accurate delta
                    // If this is the very first point of our window, we might not have 'previous'.
                    // Check if we have a point in history strictly before this match (not in this window)?
                    // The history array passed in is likely just the window.

                    // Simple delta within window:
                    // If we have a 'lastEnergyTotal' from a previous iteration, use it.
                    // If we don't (start of chart), delta is 0.

                    // Problem: if lastEnergyTotal was from 5 minutes ago, delta is huge.
                    // But that represents the usage over the gap.

                    // Special case: First item in loop.
                    let delta = 0;
                    if (i > 0 || lastEnergyTotal > 0) {
                        // How to distinguish "uninitialized" lastEnergyTotal from 0?
                        // Device energy_total is usually large (kWh counter).
                        if (lastEnergyTotal > 0) {
                            delta = Math.max(0, match.energy_total - lastEnergyTotal);
                        }
                    }

                    lastEnergyTotal = match.energy_total;
                    filledData.push({ ...match, timestamp: ts, energy_delta: delta });
                } else {
                    // No data. 
                    // Delta 0.
                    // Do NOT update lastEnergyTotal (so next real point picks up the diff).
                    filledData.push({
                        id: -1,
                        timestamp: ts,
                        source: 'generated',
                        energy_total: lastEnergyTotal, // carry forward for continuity in future deltas if needed?
                        // Actually if we carry forward lastEnergyTotal, the next REAL point will have a delta 
                        // equal to (real - last). If last was carried forward, it means 
                        // the delta across the gap is attributed to the first point AFTER the gap?
                        // Or we want explicitly 0 bars in the gap.
                        // Setting energy_delta to 0 achieves the visual.

                        energy_delta: 0
                    });
                }
            }
            return filledData;
        }

        // Default logic for other ranges
        return history.map((item, index) => {
            const previous = history[index - 1];
            const delta = previous
                ? Math.max(0, item.energy_total - previous.energy_total)
                : 0;
            return { ...item, energy_delta: delta };
        });
    }, [history, range]);

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
