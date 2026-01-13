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
    const [realtime, setRealtime] = useState<Measurement[]>([]);
    const [history, setHistory] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRealtime = async () => {
        try {
            const res = await axios.get('/api/measurements/realtime');
            setRealtime(res.data);
        } catch (err) {
            console.error('Failed to fetch realtime data', err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/measurements/history', { params: { range } });
            let historyData = res.data;
            if (range !== 'hour') {
                historyData = historyData.map((item: Measurement) => ({
                    ...item,
                    energy_total: item.energy_total / 1000
                }));
            }
            setHistory(historyData);
        } catch (err) {
            console.error('Failed to fetch history data', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchRealtime(), fetchHistory()]);
            setLoading(false);
        };
        init();

        const rtInterval = setInterval(fetchRealtime, 20000); // 20s for realtime
        const histInterval = setInterval(fetchHistory, 60000); // 60s for history

        return () => {
            clearInterval(rtInterval);
            clearInterval(histInterval);
        };
    }, [range]);

    return { realtime, history, loading };
};
