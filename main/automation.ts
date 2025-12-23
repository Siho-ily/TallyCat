import { getDb, Record } from './db';
import { DateTime } from 'luxon';
import crypto from 'crypto';

/**
 * Checks all active automation rules and creates records if they haven't been run this month.
 * This should be called on app startup and periodically.
 */
export async function runAutomations() {
  try {
    const db = await getDb();
    await db.read();
    if (!db.data || !db.data.automation_rules) return;

    const now = DateTime.now();
    const currentMonthStr = now.toFormat('yyyy-MM');
    const today = now.day;

    let recordsAdded = 0;

    for (const rule of db.data.automation_rules) {
      if (!rule.is_active) continue;

      const daysToCheck = rule.day_of_month || [];

      for (const day of daysToCheck) {
        // Target date for this month
        // Handle end of month edge cases (e.g. 31st in Feb -> 28th/29th)
        const targetDay = Math.min(day, now.daysInMonth || 31);

        // If today is or is past the target day
        if (today >= targetDay) {
          // Construct the date string for this specific run
          const runDateStr = `${currentMonthStr}-${targetDay.toString().padStart(2, '0')}`;

          // Check if already executed for this specific date
          const executedDates = rule.executed_dates || [];
          if (!executedDates.includes(runDateStr)) {
            // Create the record
            const scheduledDate = now
              .set({ day: targetDay })
              .set({ hour: 9, minute: 0, second: 0 });

            const newRecord: Record = {
              id: crypto.randomUUID(),
              type: rule.type,
              category_id: rule.category_id,
              payment_method_id: rule.payment_method_id,
              amount: rule.amount,
              date: scheduledDate.toFormat('yyyy-MM-dd HH:mm:ss'),
              note: `[자동화] ${rule.name}`
            };

            db.data.records.unshift(newRecord);

            // Mark as executed
            if (!rule.executed_dates) rule.executed_dates = [];
            rule.executed_dates.push(runDateStr);

            // Clean up old executed dates (keep only last 6 months to save space)
            // Optional optimization, can be added later if needed.

            recordsAdded++;
            console.log(`[Automation] Executed rule: ${rule.name} for ${runDateStr}`);
          }
        }
      }
    }

    if (recordsAdded > 0) {
      await db.write();

      // Notify all renderers that data has updated
      const { BrowserWindow } = require('electron');
      BrowserWindow.getAllWindows().forEach((win: any) => {
        win.webContents.send('refresh-data');
      });
    }
  } catch (error) {
    console.error('[Automation] Error running automations:', error);
  }
}

/**
 * Starts a timer to run automations every hour.
 */
export function startAutomationScheduler() {
  // Run once on startup after a short delay
  setTimeout(() => runAutomations(), 5000);

  // Run every hour
  setInterval(() => runAutomations(), 3600000);
}
