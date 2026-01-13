import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import { Database as DatabaseType } from './schema';
import path from 'path';

const dbPath = path.join(__dirname, '../../energy.db');

const dialect = new SqliteDialect({
  database: new Database(dbPath),
});

export const db = new Kysely<DatabaseType>({
  dialect,
});

export const initializeDatabase = async () => {
  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');

  // Simple schema creation for now (migration-like)
  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        source TEXT NOT NULL,
        data TEXT,
        active_power_total REAL,
        energy_total REAL,
        pv_power REAL,
        battery_soc REAL
      );
      
      CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements(timestamp);
      CREATE INDEX IF NOT EXISTS idx_measurements_source ON measurements(source);

      CREATE TABLE IF NOT EXISTS tou_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        rate_cents_per_kwh REAL NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        days_of_week TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS configuration (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO configuration (key, value) VALUES ('shelly_ip', '192.168.1.100');
      INSERT OR IGNORE INTO configuration (key, value) VALUES ('solark_ip', '192.168.1.101');
    `);

  console.log('Database initialized');
};
