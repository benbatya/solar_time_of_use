import axios from 'axios';

export interface ShellyData {
    total_power: number;
    total_energy: number;
    voltage_a: number;
    voltage_b: number;
    voltage_c: number;
    current_a: number;
    current_b: number;
    current_c: number;
    power_factor_a: number;
    power_factor_b: number;
    power_factor_c: number;
    raw: any;
}

export class ShellyService {
    private ip: string;

    constructor(ip: string) {
        this.ip = ip;
    }

    async getStatus(): Promise<ShellyData> {
        try {
            const response = await axios.get(`http://${this.ip}/status`);
            const data = response.data;

            // Extract relevant data from Shelly 3EM /status response
            // Note: This matches the typical Shelly 3EM JSON structure
            const em = data.emeters;

            const total_power = em[0].power + em[1].power + em[2].power;
            const total_energy = em[0].total + em[1].total + em[2].total; // Total usage in Wh often

            // Assuming emeters array index 0=A, 1=B, 2=C
            return {
                total_power,
                total_energy: total_energy / 1000, // Convert to kWh if needed, but keeping consistent is key. Let's assume Wh from device.
                voltage_a: em[0].voltage,
                voltage_b: em[1].voltage,
                voltage_c: em[2].voltage,
                current_a: em[0].current,
                current_b: em[1].current,
                current_c: em[2].current,
                power_factor_a: em[0].pf,
                power_factor_b: em[1].pf,
                power_factor_c: em[2].pf,
                raw: data
            };
        } catch (error) {
            console.error('Error fetching Shelly status:', error);
            throw error;
        }
    }
}
