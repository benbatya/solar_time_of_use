import { db } from '../db';
import { ShellyService } from './shelly';
import { SolArkService } from './solark';

export class DataIngestionService {
    private shelly: ShellyService;
    private solark: SolArkService;
    private interval: NodeJS.Timeout | null = null;
    private intervalMs: number = 10000; // 10s default

    private shellyIp: string = "mock";
    private solarkIp: string = "mock";

    constructor() {
        // Initialize with mocks/defaults, will reload on start
        this.shelly = new ShellyService(this.shellyIp);
        this.solark = new SolArkService(this.solarkIp);
    }


    async loadConfig() {
        try {
            const configs = await db.selectFrom('configuration').selectAll().execute();
            for (const config of configs) {
                if (config.key === 'shelly_ip') this.shellyIp = config.value;
                if (config.key === 'solark_ip') this.solarkIp = config.value;
            }
            console.log(`Loaded config: Shelly=${this.shellyIp}, SolArk=${this.solarkIp}`);
            // Re-instantiate services with new IPs
            this.shelly = new ShellyService(this.shellyIp);
            this.solark = new SolArkService(this.solarkIp);
        } catch (err) {
            console.error('Failed to load config:', err);
        }
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

    async start(intervalMs?: number) {
        await this.loadConfig();
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
