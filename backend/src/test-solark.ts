import { SolArkService } from './services/solark';

const runTest = async () => {
    const solark = new SolArkService('mock-ip');

    try {
        console.log('Fetching mock Sol-Ark data...');
        const data = await solark.getDataMock();
        console.log('Sol-Ark Data:', data);

        if (data.battery_soc > 0 && data.pv_power >= 0) {
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
};

runTest();
