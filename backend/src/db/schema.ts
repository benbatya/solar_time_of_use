import { Generated } from 'kysely';

export interface MeasurementsTable {
  id: Generated<number>;
  timestamp: number;
  source: 'shelly' | 'solark';
  data: string; // JSON string

  // Core metrics for fast querying
  active_power_total: number | null;
  energy_total: number | null;
  pv_power: number | null;
  battery_soc: number | null;
}

export interface TourRatesTable {
  id: Generated<number>;
  name: string;
  rate_cents_per_kwh: number;
  start_time: string; // HH:MM 24h
  end_time: string;   // HH:MM 24h
  days_of_week: string; // JSON string of numbers [0-6] 0=Sun
}

export interface ConfigurationTable {
  key: string;
  value: string;
}

export interface Database {
  configuration: ConfigurationTable;
  measurements: MeasurementsTable;
  tou_rates: TourRatesTable;
}
