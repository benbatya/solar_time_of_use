import { ShellyService } from './services/shelly';

// Mock Axios if no device
// jest.mock('axios'); // Removed because we are manually mocking

const runTest = async () => {
    // We can't easily test real network without device, so we'll test the service structure
    // or use a mock IP if the user provided one, effectively "dry run"

    const shelly = new ShellyService('mock-ip');

    // Monkey patch axios for valid test without network
    const axios = require('axios');
    axios.get = async (url: string) => {
        console.log(`Mocking GET request to ${url}`);
        return {
            data: {
                emeters: [
                    { power: 100, total: 1000, voltage: 120, current: 0.8, pf: 1 },
                    { power: 200, total: 2000, voltage: 120, current: 1.6, pf: 1 },
                    { power: 300, total: 3000, voltage: 120, current: 2.4, pf: 1 }
                ]
            }
        }
    };

    try {
        const data = await shelly.getStatus();
        console.log('Shelly Data:', data);

        if (data.total_power === 600 && data.total_energy === 6) { // 6000Wh / 1000 = 6kWh
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
};

runTest();
