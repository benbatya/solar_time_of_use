# Implementation Plan - Custom Calculators & TOU Engine

This plan details the implementation of the calculation engine for derived metrics and Time-Of-Use (TOU) cost estimation.

## User Review Required
> [!NOTE]
> We will implement a configuration-based TOU system.
> Custom calculators will be hardcoded initially for safety and performance, but designed to be extensible.

## Proposed Changes

### Data Model Updates
- **tou_rates**: New table to store rate schedules.
    - `id`, `name`, `rate_cents_per_kwh`, `start_time` (HH:MM), `end_time`, `days_of_week`.
- **calculated_metrics**: Table (or columns in `measurements`) to store results.
    - *Decision*: We will calculate TOU costs *on query* or *periodically* (snapshot), rather than per-second.
    - For real-time derived metrics (e.g., `Home Load = Inverter Active Power - Grid Power`), we will compute them during ingestion.

### Services
- `src/services/tou.ts`:
    - `getRate(timestamp)`: Returns the applicable rate for a given time.
    - `calculateCost(start, end)`: Aggregates energy usage and applies rates.
- `src/services/calculator.ts`:
    - `computeDerivedMetrics(shellyData, solarkData)`:
        - Example: `Home Load = SolArk Load` or `Grid + PV +/- Battery`.

### Calculator Logic
- **Home Consumption**:
    - If SolArk provided: Use SolArk 'Load' or calc `PV - GridSell + GridBuy - BatteryCharge + BatteryDischarge`.
    - Verification: Compare with Shelly Total Active Power.

## Verification Plan

### Automated Tests
- `src/test-tou.ts`: Verify correct rate selection for different times/days.
- `src/test-calculator.ts`: Verify derived metric math.
