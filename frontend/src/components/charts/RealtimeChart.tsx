import React, { useMemo } from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Measurement } from '../../hooks/useEnergyData';

interface RealtimeChartProps {
    data: Measurement[];
}

export const RealtimeChart: React.FC<RealtimeChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        if (data.length === 0) return [];

        // Find the minimum energy_total in the dataset to use as baseline
        // Usually the first item if sorted chronologically. 
        // We assume data is sorted by timestamp (oldest first) coming from useEnergyData -> history?
        // Actually this is 'realtime' data. 
        // useEnergyData fetches realtime from /api/measurements/realtime

        // Let's assume strict chronological order for the graph.
        // If data is [item1, item2], item1 is older.
        const initialEnergy = data.length > 0 ? data[0].energy_total : 0;

        return data.map((item) => {
            const energyDelta = Math.max(0, item.energy_total - initialEnergy);
            return {
                ...item,
                energy_accumulated: energyDelta, // Renamed for clarity
            };
        });
    }, [data]);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-6">
            <h2 className="text-lg font-bold mb-4 text-white">Realtime Monitor (Last 60 Minutes)</h2>
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            stroke="#94a3b8"
                            fontSize={12}
                        />
                        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} label={{ value: 'Power (W)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} label={{ value: 'Energy (Wh)', angle: 90, position: 'insideRight', fill: '#94a3b8' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                            labelFormatter={(ts) => new Date(ts).toLocaleString()}
                        />
                        <Legend />
                        <Area yAxisId="right" type="monotone" dataKey="energy_accumulated" name="Cumulative Energy (Wh)" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
                        <Line yAxisId="left" type="monotone" dataKey="active_power_total" name="Grid Power (W)" stroke="#60a5fa" strokeWidth={2} dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="pv_power" name="Solar Power (W)" stroke="#facc15" strokeWidth={2} dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
