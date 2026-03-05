# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A home solar monitoring system that logs and displays Time-Of-Use (TOU) energy statistics from a Shelly Pro 3EM energy meter and Sol-Ark inverter. The backend polls hardware devices, stores data in SQLite, and serves a React dashboard.

## Architecture

```
solar_time_of_use/
├── backend/          # Node.js/Express API + data ingestion
│   └── src/
│       ├── index.ts              # Express server + all API routes
│       ├── db/
│       │   ├── index.ts          # SQLite (better-sqlite3 + Kysely) setup, schema init
│       │   └── schema.ts         # TypeScript types for DB tables
│       └── services/
│           ├── data-ingestion.ts # Polls Shelly & Sol-Ark on interval, writes measurements
│           ├── shelly.ts         # Shelly Pro 3EM HTTP RPC client
│           ├── solark.ts         # Sol-Ark Modbus TCP client (partial/mock implementation)
│           └── tou.ts            # TOU rate lookup service
└── frontend/         # React + Vite + Tailwind + Recharts dashboard
    └── src/
        ├── App.tsx               # Router with Dashboard and Settings pages
        ├── hooks/useEnergyData.ts # Fetches /api/measurements/realtime + /history
        ├── pages/
        │   ├── Dashboard.tsx     # Main view with time range selector
        │   └── Settings.tsx      # Device IP configuration
        └── components/
            ├── charts/           # RealtimeChart (60min), EnergyChart (history)
            └── dashboard/        # OverviewCards (latest measurement)
```

### Data Flow

1. `DataIngestionService` polls Shelly every 20s (configurable via `poll_frequency_seconds` in DB)
2. Each poll inserts a row into `measurements` with power/energy metrics
3. `energy_total` from Shelly is cumulative Wh (monotonically increasing)
4. API aggregates measurements by time bucket using SQLite recursive CTEs
5. Frontend polls `/api/measurements/realtime` every 20s, `/api/measurements/history` every 60s
6. `RealtimeChart` converts `energy_total` to a delta from session start for display
7. History endpoint converts energy_total Wh → kWh for ranges other than `hour`

### Database

SQLite file at `backend/energy.db`. Three tables:
- `measurements` — timestamped readings from Shelly/Sol-Ark
- `tou_rates` — time-of-use rate schedules (HH:MM ranges, days of week, cents/kWh)
- `configuration` — key/value store; default IPs seeded on first init (`shelly_ip`, `solark_ip`, `poll_frequency_seconds`)

Database is accessed via **Kysely** query builder; raw SQL uses the `sql` template tag from kysely for the history aggregation queries.

## Development Commands

**Backend** (run from `backend/`):
```bash
npm install
npm run dev        # nodemon + ts-node hot reload
npm run build      # tsc compile
npm start          # ts-node (no watch)
```

**Frontend** (run from `frontend/`):
```bash
npm install
npm run dev        # Vite dev server on :5173, proxies /api → :3000
npm run build      # tsc + vite build → frontend/dist/
npm run lint       # eslint
```

**Start both together** (from repo root):
```bash
python3 start_app.py    # auto-installs deps, starts both, opens browser
python3 stop_app.py     # stops running processes
```

**Production**: Build the frontend first (`npm run build` in `frontend/`), then start the backend. Express serves `frontend/dist/` as static files and catches all routes for SPA fallback.

## Key Implementation Notes

- **Sol-Ark integration is incomplete**: `solark.ts` has a stubbed `getData()` returning zeros. The Modbus register map needs verification. The ingestion service currently only saves Shelly data.
- **Shelly uses JSON-RPC**: POST to `http://<ip>/rpc` with method `Shelly.GetStatus`; reads `em:0` (power) and `emdata:0` (cumulative energy) from the response.
- **History queries**: Use `WITH RECURSIVE` CTEs to generate time buckets and LEFT JOIN measurements so gaps show as null rather than being skipped.
- **TOU rates**: Stored as start/end HH:MM strings. `TOUService.getRateForTime()` does string comparison — doesn't handle overnight ranges (e.g. 23:00–01:00).
- **No test framework** is configured. Manual test scripts (`test-db.ts`, `test-shelly.ts`, `test-solark.ts`, `test-tou.ts`) can be run with `ts-node src/test-*.ts` from the backend directory.
