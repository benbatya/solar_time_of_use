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

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
