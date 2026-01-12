import { db } from '../db';
import { ShellyService } from './shelly';
import { SolArkService } from './solark';

export class DataIngestionService {
    private shelly: ShellyService;
    private solark: SolArkService;
    private interval: NodeJS.Timeout | null = null;
    private intervalMs: number = 10000; // 10s default

    constructor(shellyIp: string, solarkIp: string) {
        this.shelly = new ShellyService(shellyIp);
        this.solark = new SolArkService(solarkIp);
    }

    async poll() {
        const timestamp = Date.now();
        console.log(`Polling at ${new Date(timestamp).toISOString()}`);

        try {
            // Poll Shelly
            // In production, use real IP. For now if IP is 'mock', return mock?
            // Or just try/catch and log error if device not found.

            // const shellyData = await this.shelly.getStatus();
            // await db.insertInto('measurements').values({
            //   timestamp,
            //   source: 'shelly',
            //   data: JSON.stringify(shellyData.raw),
            //   active_power_total: shellyData.total_power,
            //   energy_total: shellyData.total_energy,
            //   pv_power: null,
            //   battery_soc: null
            // }).execute();

            // console.log('Shelly data saved');
        } catch (err) {
            console.error('Failed to poll Shelly:', err);
        }

        try {
            // Poll Sol-Ark
            // const solarkData = await this.solark.getDataMock(); // Using Mock for now
            // await db.insertInto('measurements').values({
            //   timestamp,
            //   source: 'solark',
            //   data: JSON.stringify(solarkData.raw),
            //   active_power_total: null,
            //   energy_total: null,
            //   pv_power: solarkData.pv_power,
            //   battery_soc: solarkData.battery_soc
            // }).execute();

            // console.log('Sol-Ark data saved');
        } catch (err) {
            console.error('Failed to poll Sol-Ark:', err);
        }
    }

    start(intervalMs?: number) {
        if (intervalMs) this.intervalMs = intervalMs;
        this.poll(); // Initial poll
        this.interval = setInterval(() => this.poll(), this.intervalMs);
        console.log(`Data ingestion started (Interval: ${this.intervalMs}ms)`);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('Data ingestion stopped');
        }
    }
}
