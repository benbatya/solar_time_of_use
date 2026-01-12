import { TOUService } from './services/tou';
import { initializeDatabase } from './db';

const runTest = async () => {
    await initializeDatabase();
    const service = new TOUService();

    console.log('Adding rates...');
    await service.addRate('Peak', 50, '16:00', '21:00', [1, 2, 3, 4, 5]); // Mon-Fri 4pm-9pm
    await service.addRate('Off-Peak', 20, '00:00', '16:00', [1, 2, 3, 4, 5]); // Mon-Fri midnight-4pm
    await service.addRate('Off-Peak Late', 20, '21:00', '24:00', [1, 2, 3, 4, 5]);

    // Weekend
    await service.addRate('Weekend', 15, '00:00', '24:00', [0, 6]);

    const testTime = async (dateStr: string, expectedRate: number) => {
        const ts = new Date(dateStr).getTime();
        const rate = await service.getRateForTime(ts);
        console.log(`Time: ${dateStr}, Rate: ${rate}, Expected: ${expectedRate}`);
        if (rate === expectedRate) console.log('PASS');
        else console.log('FAIL');
    }

    /*
      2026-01-12 is a Monday (based on today being Jan 12, 2026).
    */

    // Mon 10:00 AM -> Off-Peak (20)
    await testTime('2026-01-12T10:00:00', 20);

    // Mon 17:00 (5 PM) -> Peak (50)
    await testTime('2026-01-12T17:00:00', 50);

    // Sat 12:00 -> Weekend (15)
    await testTime('2026-01-17T12:00:00', 15);
};

runTest();
