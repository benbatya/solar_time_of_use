import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Measurement } from '../../hooks/useEnergyData';

interface PowerChartProps {
    history: Measurement[];
}

export const PowerChart: React.FC<PowerChartProps> = ({ history }) => {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Real-time Power Flow</h2>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history}>
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
                        />
                        <Legend />
                        <Line type="monotone" dataKey="active_power_total" name="Grid Import" stroke="#60a5fa" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="pv_power" name="Solar PV" stroke="#facc15" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
