
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

export const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        shelly_ip: '',
        solark_ip: '',
        tou_rate_peak: '0.55',
        tou_rate_mid_peak: '0.39',
        tou_rate_off_peak: '0.33',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axios.get('/api/config');
            setConfig(prev => ({ ...prev, ...res.data }));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setMessage('Failed to load configuration');
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await axios.post('/api/config', config);
            setMessage('Configuration saved successfully! Services reloading...');
        } catch (err) {
            console.error(err);
            setMessage('Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white p-8">Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold text-white mb-6">System Configuration</h1>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Shelly 3EM IP Address
                        </label>
                        <input
                            type="text"
                            value={config.shelly_ip}
                            onChange={e => setConfig({ ...config, shelly_ip: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="192.168.1.100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Sol-Ark 15K IP Address
                        </label>
                        <input
                            type="text"
                            value={config.solark_ip}
                            onChange={e => setConfig({ ...config, solark_ip: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="192.168.1.101"
                        />
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                        <h2 className="text-lg font-semibold text-white mb-4">Time-of-Use Rates ($/kWh)</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-red-400 mb-2">
                                    Peak (4pm – 9pm)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={config.tou_rate_peak}
                                    onChange={e => setConfig({ ...config, tou_rate_peak: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-yellow-400 mb-2">
                                    Mid-Peak (3–4pm, 9pm–midnight)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={config.tou_rate_mid_peak}
                                    onChange={e => setConfig({ ...config, tou_rate_mid_peak: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-green-400 mb-2">
                                    Off-Peak (midnight – 3pm)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={config.tou_rate_off_peak}
                                    onChange={e => setConfig({ ...config, tou_rate_off_peak: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};
