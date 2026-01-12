import { db } from '../db';

export class TOUService {

    async addRate(name: string, rate: number, startTime: string, endTime: string, days: number[]) {
        // days is array of 0-6 (Sun-Sat)
        return await db.insertInto('tou_rates').values({
            name,
            rate_cents_per_kwh: rate,
            start_time: startTime, // 'HH:MM'
            end_time: endTime,     // 'HH:MM'
            days_of_week: JSON.stringify(days)
        }).execute();
    }

    async getAllRates() {
        return await db.selectFrom('tou_rates').selectAll().execute();
    }

    async getRateForTime(timestamp: number): Promise<number> {
        const date = new Date(timestamp);
        const day = date.getDay(); // 0-6
        const hour = date.getHours();
        const minute = date.getMinutes();
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const rates = await this.getAllRates();

        // Naively iterate for now. In SQL this could be optimized but string time comparison is tricky.
        // LATER: Optimize with SQL query.
        for (const rate of rates) {
            const days = JSON.parse(rate.days_of_week) as number[];
            if (days.includes(day)) {
                // Check time range. Handle overnight distinct if needed (start > end).
                // For now assuming simple ranges within day.
                if (rate.start_time <= timeStr && timeStr < rate.end_time) {
                    return rate.rate_cents_per_kwh;
                }
            }
        }

        // Default fallback if no rate matches? 
        // Return last match or specific default. Let's return 0 or throw.
        // Ideally user defines a 'Base' rate 00:00-24:00 that others override, 
        // but here we just return matching.
        return 0;
    }
}
