# Implementation Plan - Frontend Dashboard

This plan details the implementation of the React frontend for SolarTimeOfUse.

## User Review Required
> [!NOTE]
> We will use `recharts` for data visualization.
> The dashboard will poll the backend API for updates (simple polling for now, SSE/WebSockets later if needed).

## Proposed Changes

### Dependencies
- Install `recharts`, `lucide-react` (icons), `axios`, `clsx`, `tailwind-merge`.

### Component Structure
- `src/components/layout/DashboardLayout.tsx`: Main shell with sidebar/header.
- `src/components/dashboard/OverviewCards.tsx`: Summary widgets (Current Power, Today's Energy, Battery SOC).
- `src/components/charts/PowerChart.tsx`: Real-time line chart.
- `src/components/charts/EnergyChart.tsx`: Historical bar chart.
- `src/hooks/useEnergyData.ts`: React hook to fetch data from backend.

### Dashboard Layout
- **Header**: Title and Connection Status.
- **Grid Layout**:
    - Top Row: 4 Configurable Cards (Grid, Solar, Battery, Home Load).
    - Middle Row: Main Power Flow Chart (Power vs Time).
    - Bottom Row: Energy Usage/Cost bar charts.
    - Rate Indicator: Show current TOU rate color-coded.

### Visual Style
- Dark/Light mode support (defaulting to system or Dark for "Command center" feel).
- Tailwind colors: Slate/Zinc background, Vivid colors for phases/sources (Yellow=Solar, Green=Grid, Blue=Load).

## Verification Plan

### Automated Tests
- Basic rendering tests for components.
- We will rely heavily on manual verification `npm run dev` and viewing the dashboard.

### Manual Verification
- Verify data updates every 5-10s.
- Verify chart responsiveness.
