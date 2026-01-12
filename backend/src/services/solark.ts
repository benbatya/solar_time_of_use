import ModbusRTU from 'modbus-serial';

export interface SolArkData {
    pv_power: number;
    battery_soc: number;
    battery_power: number; // + charging, - discharging
    grid_power: number;    // + buying, - selling
    raw: any;
}

export class SolArkService {
    private client: ModbusRTU;
    private ip: string;
    private port: number;
    private slaveId: number;

    constructor(ip: string, port: number = 502, slaveId: number = 1) {
        this.client = new ModbusRTU();
        this.ip = ip;
        this.port = port;
        this.slaveId = slaveId;
    }

    async connect() {
        if (!this.client.isOpen) {
            await this.client.connectTCP(this.ip, { port: this.port });
            this.client.setID(this.slaveId);
        }
    }

    async getData(): Promise<SolArkData> {
        try {
            await this.connect();

            // Sol-Ark Modbus Map (Example offsets - would need actual manual verification)
            // Reading Holding Registers (Function 03)
            // Example:
            // Battery SOC: Address 184 (184 - 184 = 0 offset?) - Need accurate register map.
            // For now, I will use placeholder registers commonly found in SunSpec/SolArk docs.

            // THIS IS A MOCK IMPLEMENTATION UNTIL REGISTERS ARE VERIFIED
            // Assuming we read a block of registers

            // Reading PV Power (Example: Reg 186)
            // Reading Battery SOC (Example: Reg 184)

            // const data = await this.client.readHoldingRegisters(100, 10);

            return {
                pv_power: 0,
                battery_soc: 0,
                battery_power: 0,
                grid_power: 0,
                raw: {}
            };
        } catch (error) {
            console.error('Error fetching Sol-Ark data:', error);
            throw error;
        }
    }

    async getDataMock(): Promise<SolArkData> {
        // Return dummy data for testing without device
        return {
            pv_power: 5000 + Math.random() * 500,
            battery_soc: 85,
            battery_power: 1200,
            grid_power: 50,
            raw: { mock: true }
        };
    }
}
