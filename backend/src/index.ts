import express from 'express';
import bodyParser from 'body-parser';
import { initializeDatabase } from './db';
import { DataIngestionService } from './services/data-ingestion';

const app = express();
app.use(bodyParser.json());
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
