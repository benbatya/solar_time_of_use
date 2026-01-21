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
            // 24h by hour
            const cutoff = now - 24 * 60 * 60 * 1000;
            const query = await sql`
                SELECT 
                    MAX(timestamp) as timestamp, 
                    source, 
                    MAX(energy_total) as energy_total
                FROM measurements 
                WHERE timestamp > ${cutoff} 
                GROUP BY strftime('%Y-%m-%d %H', datetime(timestamp/1000, 'unixepoch')) 
                ORDER BY timestamp DESC
             `.execute(db);
            results = query.rows;
        } else if (range === 'week') {
            // 7 days by day
            const cutoff = now - 7 * 24 * 60 * 60 * 1000;
            const query = await sql`
                SELECT 
                    MAX(timestamp) as timestamp, 
                    source, 
                    MAX(energy_total) as energy_total
                FROM measurements 
                WHERE timestamp > ${cutoff} 
                GROUP BY strftime('%Y-%m-%d', datetime(timestamp/1000, 'unixepoch')) 
                ORDER BY timestamp DESC
             `.execute(db);
            results = query.rows;
        } else if (range === 'month') {
            // 30 days by day
            const cutoff = now - 30 * 24 * 60 * 60 * 1000;
            const query = await sql`
                SELECT 
                    MAX(timestamp) as timestamp, 
                    source, 
                    MAX(energy_total) as energy_total
                FROM measurements 
                WHERE timestamp > ${cutoff} 
                GROUP BY strftime('%Y-%m-%d', datetime(timestamp/1000, 'unixepoch')) 
                ORDER BY timestamp DESC
             `.execute(db);
            results = query.rows;
        } else {
            // 'hour' or default - 60 minutes by minute
            const cutoff = now - 60 * 60 * 1000;
            const query = await sql`
                SELECT 
                    MAX(timestamp) as timestamp, 
                    source, 
                    MAX(energy_total) as energy_total
                FROM measurements 
                WHERE timestamp > ${cutoff} 
                GROUP BY strftime('%Y-%m-%d %H:%M', datetime(timestamp/1000, 'unixepoch')) 
                ORDER BY timestamp DESC
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
