import express from 'express';
import { initializeDatabase } from './db';
import { DataIngestionService } from './services/data-ingestion';

const app = express();
const port = 3000;

// Initialize Database
try {
    initializeDatabase();
} catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
}

// Start Data Ingestion
// TODO: Load IPs from config/env
const shellyIp = process.env.SHELLY_IP || '192.168.1.100';
const solarkIp = process.env.SOLARK_IP || '192.168.1.101';

const ingestionService = new DataIngestionService(shellyIp, solarkIp);
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

app.get('/api/measurements/history', async (req, res) => {
    try {
        // Simple history fetch (last 1 hour?)
        const history = await db.selectFrom('measurements')
            .selectAll()
            .orderBy('timestamp', 'desc')
            .limit(60) // approx last 10 mins if 10s polling
            .execute();
        res.json(history.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
