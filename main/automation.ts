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

      // Check if it's the right day (or later if missed) and not run this month
      if (today >= rule.day_of_month && rule.last_run !== currentMonthStr) {
        // Create the record
        // The date should be the scheduled day of the current month
        const scheduledDate = now
          .set({ day: Math.min(rule.day_of_month, now.daysInMonth || 31) })
          .set({ hour: 9, minute: 0, second: 0 }); // Default to 9 AM

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
        rule.last_run = currentMonthStr;
        recordsAdded++;

        console.log(`[Automation] Executed rule: ${rule.name} for ${currentMonthStr}`);
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
