import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { initializeDatabase } from './db';
import { DataIngestionService } from './services/data-ingestion';

const app = express();
app.use(bodyParser.json());
const port = 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Initialize Database
try {
    initializeDatabase();
} catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
}

// Start Data Ingestion
// TODO: Load IPs from config/env



const ingestionService = new DataIngestionService();
ingestionService.start();
// ingestionService.start(); // Uncomment to start polling automatically, or control via API

app.get('/', (req, res) => {
    res.send('SolarTimeOfUse Backend Running');
});

// API Endpoint to manually trigger a poll (for testing)
app.post('/api/poll', async (req, res) => {
    try {
        await ingestionService.poll();
        res.json({ success: true, message: 'Poll triggered' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Poll failed' });
    }
});

import { db } from './db';


app.get('/api/config', async (req, res) => {
    try {
        const configs = await db.selectFrom('configuration').selectAll().execute();
        const configMap: Record<string, string> = {};
        for (const c of configs) {
            configMap[c.key] = c.value;
        }
        res.json(configMap);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.post('/api/config', async (req, res) => {
    try {
        const { shelly_ip, solark_ip } = req.body;
        if (shelly_ip) {
            await db.insertInto('configuration')
                .values({ key: 'shelly_ip', value: shelly_ip })
                .onConflict((oc) => oc.column('key').doUpdateSet({ value: shelly_ip }))
                .execute();
        }
        if (solark_ip) {
            await db.insertInto('configuration')
                .values({ key: 'solark_ip', value: solark_ip })
                .onConflict((oc) => oc.column('key').doUpdateSet({ value: solark_ip }))
                .execute();
        }

        await ingestionService.loadConfig(); // Reload service
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});


app.get('/api/measurements/latest', async (req, res) => {
    try {
        const latestInfo = await db.selectFrom('measurements')
            .selectAll()
            .orderBy('timestamp', 'desc')
            .limit(1)
            .executeTakeFirst();

        res.json(latestInfo || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch measurements' });
    }
});

app.get('/api/measurements/realtime', async (req, res) => {
    try {
        const now = Date.now();
        const cutoff = now - 60 * 60 * 1000; // Last 60 minutes

        const results = await db.selectFrom('measurements')
            .selectAll()
            .where('timestamp', '>', cutoff)
            .orderBy('timestamp', 'desc')
            .execute();

        // Return oldest to newest for charts
        res.json(results.reverse());
    } catch (error) {
        console.error('Failed to fetch realtime measurements:', error);
        res.status(500).json({ error: 'Failed to fetch realtime measurements' });
    }
});

app.get('/api/measurements/history', async (req, res) => {
    try {
        // Simple history fetch (last 1 hour?)
        const range = (req.query.range as string) || 'hour';
        const now = Date.now();

        let results: any[] = [];
        const { sql } = require('kysely');

        if (range === 'day') {
            // 24h by hour - 24 data points
            const currentHour = Math.floor(now / 3600000) * 3600000;
            const startHour = currentHour - 23 * 3600000;

            const query = await sql`
                WITH RECURSIVE generated_hours(hour_ts) AS (
                    SELECT ${startHour}
                    UNION ALL
                    SELECT hour_ts + 3600000 FROM generated_hours WHERE hour_ts < ${currentHour}
                )
                SELECT 
                    gh.hour_ts as timestamp, 
                    COALESCE(MAX(m.source), 'generated') as source, 
                    MAX(m.energy_total) as energy_total
                FROM generated_hours gh
                LEFT JOIN measurements m ON m.timestamp >= gh.hour_ts AND m.timestamp < gh.hour_ts + 3600000
                GROUP BY gh.hour_ts
                ORDER BY gh.hour_ts DESC
             `.execute(db);
            results = query.rows;
        } else if (range === 'week') {
            // 7 days by day - 7 data points
            const currentDay = Math.floor(now / 86400000) * 86400000;
            const startDay = currentDay - 6 * 86400000;

            const query = await sql`
                WITH RECURSIVE generated_days(day_ts) AS (
                    SELECT ${startDay}
                    UNION ALL
                    SELECT day_ts + 86400000 FROM generated_days WHERE day_ts < ${currentDay}
                )
                SELECT 
                    gd.day_ts as timestamp, 
                    COALESCE(MAX(m.source), 'generated') as source, 
                    MAX(m.energy_total) as energy_total
                FROM generated_days gd
                LEFT JOIN measurements m ON m.timestamp >= gd.day_ts AND m.timestamp < gd.day_ts + 86400000
                GROUP BY gd.day_ts
                ORDER BY gd.day_ts DESC
             `.execute(db);
            results = query.rows;
        } else if (range === 'month') {
            // 30 days by day - 30 data points
            const currentDay = Math.floor(now / 86400000) * 86400000;
            const startDay = currentDay - 29 * 86400000;

            const query = await sql`
                WITH RECURSIVE generated_days(day_ts) AS (
                    SELECT ${startDay}
                    UNION ALL
                    SELECT day_ts + 86400000 FROM generated_days WHERE day_ts < ${currentDay}
                )
                SELECT 
                    gd.day_ts as timestamp, 
                    COALESCE(MAX(m.source), 'generated') as source, 
                    MAX(m.energy_total) as energy_total
                FROM generated_days gd
                LEFT JOIN measurements m ON m.timestamp >= gd.day_ts AND m.timestamp < gd.day_ts + 86400000
                GROUP BY gd.day_ts
                ORDER BY gd.day_ts DESC
             `.execute(db);
            results = query.rows;
        } else {
            // 'hour' or default - 60 minutes by minute
            // Align to current minute floor
            const currentMinute = Math.floor(now / 60000) * 60000;
            const startMinute = currentMinute - 59 * 60000;

            const query = await sql`
                WITH RECURSIVE generated_minutes(minute_ts) AS (
                    SELECT ${startMinute}
                    UNION ALL
                    SELECT minute_ts + 60000 FROM generated_minutes WHERE minute_ts < ${currentMinute}
                )
                SELECT 
                    gm.minute_ts as timestamp, 
                    COALESCE(MAX(m.source), 'generated') as source, 
                    MAX(m.energy_total) as energy_total
                FROM generated_minutes gm
                LEFT JOIN measurements m ON m.timestamp >= gm.minute_ts AND m.timestamp < gm.minute_ts + 60000
                GROUP BY gm.minute_ts
                ORDER BY gm.minute_ts DESC
             `.execute(db);
            results = query.rows;
        }

        res.json(results.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
