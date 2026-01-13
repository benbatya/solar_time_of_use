import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Measurement {
    id: number;
    timestamp: number;
    source: string;
    active_power_total: number;
    energy_total: number;
    pv_power: number;
    battery_soc: number;
}

export const useEnergyData = (range: string = 'hour') => {
    const [latest, setLatest] = useState<Measurement | null>(null);
    const [history, setHistory] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            // In dev, we might need to proxy or use full URL. assuming proxy in vite.config or CORS
            // For now, let's assume valid setup.
            const [latestRes, historyRes] = await Promise.all([
                axios.get('/api/measurements/latest'),
                axios.get('/api/measurements/history', { params: { range } })
            ]);

            let historyData = historyRes.data;
            if (range !== 'hour') {
                historyData = historyData.map((item: Measurement) => ({
                    ...item,
                    energy_total: item.energy_total / 1000
                }));
            }

            setLatest(latestRes.data);
            setHistory(historyData);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch energy data', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60s poll
        return () => clearInterval(interval);
    }, [range]); // Re-fetch when range changes

    return { latest, history, loading };
};
