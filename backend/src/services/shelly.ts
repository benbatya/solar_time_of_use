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
            const response = await axios.post(`http://${this.ip}/rpc`, {
                id: 1,
                method: "Shelly.GetStatus",
                params: ""
            });
            const data = response.data;

            // Extract relevant data from Shelly Pro 3EM RPC response
            const em = data.result['em:0'];
            const emData = data.result['emdata:0'];

            const total_power = em.a_act_power + em.b_act_power + em.c_act_power;
            const total_energy = emData.a_total_act_energy + emData.b_total_act_energy + emData.c_total_act_energy;

            return {
                total_power,
                total_energy, // This is in Wh based on typical Shelly output, or match previous unit
                voltage_a: em.a_voltage,
                voltage_b: em.b_voltage,
                voltage_c: em.c_voltage,
                current_a: em.a_current,
                current_b: em.b_current,
                current_c: em.c_current,
                power_factor_a: em.a_pf,
                power_factor_b: em.b_pf,
                power_factor_c: em.c_pf,
                raw: data
            };
        } catch (error) {
            console.error('Error fetching Shelly status:', error);
            throw error;
        }
    }
}
