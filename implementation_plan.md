# Implementation Plan - Backend Implementation

This plan details the steps to implement the backend services, including the SQLite database, Shelly 3EM polling, and Sol-Ark Modbus integration.

## User Review Required
> [!NOTE]
> We will use `better-sqlite3` for the database and `kysely` for type-safe query building.
> We will use `modbus-serial` for Sol-Ark communication.

## Proposed Changes

### Backend Dependencies
- Install `better-sqlite3`, `kysely`, `modbus-serial`, `axios` (for Shelly API).
- Install dev dependencies: `@types/better-sqlite3`, `@types/modbus-serial`.

### Database Structure
- Create `src/db/` directory.
- `src/db/schema.ts`: Define database schema (Tables: `measurements`, `tou_rates`, etc.).
- `src/db/index.ts`: Database connection setup.
- `src/db/migrations/`: Initial schema migration.

### Table Schema (Initial)
- **measurements**:
    - `id` (INTEGER PRIMARY KEY)
    - `timestamp` (INTEGER NOT NULL)
    - `source` (TEXT) 'shelly' | 'solark'
    - `data` (JSON) - Store raw/structured reading to avoid rigid schema for now, or distinct columns.
    - *Decision*: We will use distinct columns for core metrics and JSON for distinct specific data to allow querying efficiency for graphs.
    - Columns: `active_power_total`, `energy_total`, `pv_power`, `battery_soc`, `json_dump`.

### Services
- `src/services/shelly.ts`: Polling logic for Shelly 3EM.
- `src/services/solark.ts`: Modbus polling for Sol-Ark.
- `src/services/data-ingestion.ts`: Orchestrates polling and DB storage.

## Verification Plan

### Automated Tests
- Create a test script `src/test-db.ts` to write and read from the DB.
- Create a test script `src/test-shelly.ts` to fetch data from the implementation (mocked or real if IP provided).
- Create a test script `src/test-solark.ts` to fetch data via Modbus and attempt to write to DB.

### specific constraints
- DB file location: `backend/energy.db`
