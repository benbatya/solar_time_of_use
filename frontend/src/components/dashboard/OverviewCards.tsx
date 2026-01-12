import React from 'react';
import { Zap, Battery, Sun, Home } from 'lucide-react';
import { Measurement } from '../../hooks/useEnergyData';
import clsx from 'clsx';

interface OverviewCardsProps {
    data: Measurement | null;
}

const Card = ({ title, value, unit, icon: Icon, colorClass }: any) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm font-medium">{title}</span>
            <div className={clsx("p-2 rounded-lg bg-opacity-10", colorClass.replace('text-', 'bg-'))}>
                <Icon className={clsx("w-5 h-5", colorClass)} />
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-slate-500 text-sm">{unit}</span>
        </div>
    </div>
);

export const OverviewCards: React.FC<OverviewCardsProps> = ({ data }) => {
    if (!data) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card
                title="Grid Power"
                value={data.active_power_total?.toFixed(0) ?? 0}
                unit="W"
                icon={Zap}
                colorClass="text-blue-400"
            />
            <Card
                title="Solar Generation"
                value={data.pv_power?.toFixed(0) ?? 0}
                unit="W"
                icon={Sun}
                colorClass="text-yellow-400"
            />
            <Card
                title="Battery SOC"
                value={data.battery_soc?.toFixed(1) ?? 0}
                unit="%"
                icon={Battery}
                colorClass="text-green-400"
            />
            <Card
                title="Total Energy"
                value={(data.energy_total / 1000).toFixed(1)}
                unit="kWh"
                icon={Home}
                colorClass="text-purple-400"
            />
        </div>
    );
};
