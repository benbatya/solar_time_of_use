import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Measurement } from '../../hooks/useEnergyData';

interface EnergyChartProps {
    history: Measurement[];
}

export const EnergyChart: React.FC<EnergyChartProps> = ({ history }) => {
    // Aggregate data if needed, or simple bar for recent history
    // For now just show recent data points as bars
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-6">
            <h2 className="text-lg font-bold mb-4">Energy Usage (Recent)</h2>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
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
                        <Bar dataKey="energy_total" name="Total Energy (kWh)" fill="#8b5cf6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
