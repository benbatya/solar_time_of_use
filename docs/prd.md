# Product Requirements Document (PRD): SolarTimeOfUse

## 1. Introduction
The SolarTimeOfUse application is designed to monitor, track, and visualize real-time and historical energy usage data from a Shelly 3EM 3-phase energy meter and Sol-Ark 15K inverter, with Time Of Use (TOU) calculations for expected billing.

## 2. Goals & Objectives
*   **Real-time Monitoring**: Provide a live view of power consumption across all three phases (Shelly) and Solar/Battery status (Sol-Ark).
*   **Historical Analysis**: Allow users to view energy usage and generation over time.
*   **Time Of Use (TOU)**: Calculate expected billing based on defined Time Of Use periods.
*   **Cost Tracking**: Estimate energy costs based on configurable rates and TOU bins.
*   **Privacy & Control**: Operate entirely within the local network without reliance on external clouds.

## 3. Target User
*   Homeowners who have Shelly and SolArk electrical devices.

## 4. Functional Requirements

### 4.1. Data Ingestion
*   **Source**: Shelly 3EM Device (Local Network).
*   **Metrics**:
    *   Active Power (W) - Total and per phase.
    *   Current (A) - Per phase.
    *   Voltage (V) - Per phase.
    *   Power Factor (PF) - Per phase.
    *   Total Energy (kWh).
*   **Method**: Periodic polling of the Shelly HTTP API (e.g., `/status` endpoint) or listening to MQTT topics (optional).
*   **Frequency**: Configurable, default to every 5-10 seconds for real-time.

### 4.2. Sol-Ark 15K Integration
*   **Source**: Sol-Ark 15K Inverter.
*   **Protocol**: Modbus TCP.
*   **Metrics**:
    *   PV Power Production (W).
    *   Battery State of Charge (%).
    *   Battery Charging/Discharging Power (W).
    *   Grid Power (Buy/Sell) (W).
    *   Inverter Status/Faults.
*   **Frequency**: Configurable, synchronized with Shelly polling if possible (e.g., every 5-10s).

### 4.3. Custom Calculations & TOU
*   **Calculators**: Ability to define custom calculators between sensor readings of the same timestamp.
*   **Binning**: Bin energy data based on Time Of Use (TOU) schedules for accurate cost estimation.

### 4.4. Data Storage
*   Store time-series data for historical reporting.
*   Retention policy: High resolution for recent days, downsampled for long-term history.

### 4.5. Dashboard (Frontend)
*   **Overview Widget**: Current Total Power (W), Today's Energy (kWh), Current Voltage/Amps summary.
*   **Real-time Chart**: Line chart showing power usage over the last hour/minutes.
*   **Historical Bar Chart**: Energy consumption per hour/day/month.
*   **Phase Breakdown**: Visual indicator of load balance across phases A, B, and C.

### 4.6. Configuration
*   Shelly Device IP Address / Hostname.
*   Currency symbol and Cost per kWh.

## 5. Non-Functional Requirements
*   **Performance**: Dashboard should load quickly and update essentially in real-time.
*   **Responsiveness**: Mobile-friendly UI for checking on the phone.
*   **Self-Hosted**: Easy to run locally (e.g., using Node.js/Docker).

## 6. Technical Stack Proposal
*   **Frontend**: React (Vite) + TailwindCSS (for styling) + Recharts (for data visualization).
*   **Backend**: Node.js with TypeScript.
*   **Modbus**: `modbus-serial`.
*   **Database**: SQLite (via `better-sqlite3` or similar) for ease of setup and portable file-based storage.
*   **Communication**: HTTP Polling to Shelly Device.

## 7. Future Scope
*   Solar production tracking (if Shelly is bidirectional).
*   Alerts for high usage or low voltage.
*   MQTT support for push-based updates.
