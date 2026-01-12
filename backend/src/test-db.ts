import { db, initializeDatabase } from './db';

const runTest = async () => {
    await initializeDatabase();
    console.log('Database initialized for test');

    // Insert mock data
    try {
        const result = await db.insertInto('measurements').values({
            timestamp: Date.now(),
            source: 'shelly',
            data: JSON.stringify({ test: true }),
            active_power_total: 1500,
            energy_total: 100,
            pv_power: null,
            battery_soc: null
        }).executeTakeFirst();

        console.log('Insert successful, ID:', result.insertId);

        const rows = await db.selectFrom('measurements').selectAll().execute();
        console.log(`Retrieved ${rows.length} rows`);
        console.log(rows[0]);

        if (rows.length > 0 && rows[0].active_power_total === 1500) {
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
};

runTest();
