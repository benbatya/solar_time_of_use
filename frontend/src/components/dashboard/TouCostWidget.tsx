import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { Measurement } from '../../hooks/useEnergyData';

interface TouCostWidgetProps {
    history: Measurement[];
    range: string;
}

interface TouRates {
    peak: number;
    mid_peak: number;
    off_peak: number;
}

function getTouPeriod(timestamp: number): 'peak' | 'mid_peak' | 'off_peak' {
    const hour = new Date(timestamp).getHours();
    if (hour >= 16 && hour < 21) return 'peak';
    if ((hour >= 15 && hour < 16) || hour >= 21) return 'mid_peak';
    return 'off_peak';
}

function computeTouTotals(history: Measurement[], range: string) {
    const isWeekOrMonth = range === 'prev_7_days' || range === 'prev_30_days' || range === 'prev_180_days' || range === 'prev_360_days';
    // For hour range, deltas are in Wh; all others are already kWh
    const divisor = range === 'prev_60_minutes' ? 1000 : 1;

    if (isWeekOrMonth) {
        return {
            peak: history.reduce((sum, item) => sum + (item.energy_peak || 0), 0),
            mid_peak: history.reduce((sum, item) => sum + (item.energy_mid_peak || 0), 0),
            off_peak: history.reduce((sum, item) => sum + (item.energy_off_peak || 0), 0),
        };
    }

    const totals = { peak: 0, mid_peak: 0, off_peak: 0 };
    history.forEach((item, index) => {
        const previous = history[index - 1];
        const currentTotal = item.energy_total || 0;
        const previousTotal = previous?.energy_total || 0;

        let delta = 0;
        if (currentTotal > 0 && previousTotal > 0) {
            delta = Math.max(0, currentTotal - previousTotal) / divisor;
        }

        const period = getTouPeriod(item.timestamp);
        totals[period] += delta;
    });

    return totals;
}

const PERIOD_LABELS: Record<string, string> = {
    off_peak: 'Off-Peak',
    mid_peak: 'Mid-Peak',
    peak: 'Peak',
};

const PERIOD_COLORS: Record<string, string> = {
    off_peak: 'text-green-400',
    mid_peak: 'text-yellow-400',
    peak: 'text-red-400',
};

const PERIOD_BG: Record<string, string> = {
    off_peak: 'bg-green-900/20',
    mid_peak: 'bg-yellow-900/20',
    peak: 'bg-red-900/20',
};

export const TouCostWidget: React.FC<TouCostWidgetProps> = ({ history, range }) => {
    const [rates, setRates] = useState<TouRates>({ peak: 0.55, mid_peak: 0.39, off_peak: 0.33 });

    useEffect(() => {
        axios.get('/api/config').then(res => {
            setRates({
                peak: parseFloat(res.data.tou_rate_peak) || 0.55,
                mid_peak: parseFloat(res.data.tou_rate_mid_peak) || 0.39,
                off_peak: parseFloat(res.data.tou_rate_off_peak) || 0.33,
            });
        }).catch(() => {});
    }, []);

    const totals = React.useMemo(() => computeTouTotals(history, range), [history, range]);

    const rows = (['off_peak', 'mid_peak', 'peak'] as const).map(period => ({
        period,
        kwh: totals[period],
        rate: rates[period],
        cost: totals[period] * rates[period],
    }));

    const grandKwh = rows.reduce((sum, r) => sum + r.kwh, 0);
    const grandCost = rows.reduce((sum, r) => sum + r.cost, 0);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mt-6">
            <h2 className="text-lg font-bold mb-4">Energy Cost Breakdown</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-400 border-b border-slate-700">
                            <th className="text-left pb-3 font-medium">Period</th>
                            <th className="text-right pb-3 font-medium">kWh</th>
                            <th className="text-right pb-3 font-medium">Rate</th>
                            <th className="text-right pb-3 font-medium">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(({ period, kwh, rate, cost }) => (
                            <tr key={period} className={`${PERIOD_BG[period]} border-b border-slate-700/50`}>
                                <td className={`py-3 pl-2 font-medium ${PERIOD_COLORS[period]}`}>
                                    {PERIOD_LABELS[period]}
                                </td>
                                <td className="py-3 text-right text-white">{kwh.toFixed(3)}</td>
                                <td className="py-3 text-right text-slate-300">${rate.toFixed(2)}/kWh</td>
                                <td className="py-3 pr-2 text-right font-semibold text-white">${cost.toFixed(2)}</td>
                            </tr>
                        ))}
                        <tr className="border-t-2 border-slate-600">
                            <td className="py-3 pl-2 font-bold text-white">Total</td>
                            <td className="py-3 text-right font-bold text-white">{grandKwh.toFixed(3)}</td>
                            <td className="py-3 text-right text-slate-400">—</td>
                            <td className="py-3 pr-2 text-right font-bold text-white">${grandCost.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
