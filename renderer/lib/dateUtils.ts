import { DateTime } from 'luxon';

export interface DateRange {
  start: DateTime;
  end: DateTime;
}

/**
 * Calculates the start and end of the "Month Week" for a given date.
 * Rules:
 * - Weeks are contained within a single month.
 * - The first week starts on the 1st of the month.
 * - Weeks end on Saturday, except possibly the last week which ends on the last day of the month.
 * - Subsequent weeks start on Sunday.
 */
export function getMonthWeekRange(date: DateTime): DateRange {
  const startOfMonth = date.startOf('month');
  const endOfMonth = date.endOf('month');

  // Find all week ranges for the month
  const weeks: DateRange[] = [];
  let currentStart = startOfMonth;

  while (currentStart <= endOfMonth) {
    // Find the next Saturday or end of month
    let currentEnd = currentStart.endOf('week'); // This gives Sunday if locale is not set to use Monday as start, or whatever.
    // Luxon endOf('week') depends on locale. By default ISO week ends on Sunday.
    // User wants week to end on Saturday (based on "1st (Sun) - 7th (Sat)").
    // So 1st (Wed) - 4th (Sat).

    // Let's manually find the next Saturday.
    // weekday: 1(Mon) ... 6(Sat), 7(Sun).
    // We want to stop at 6(Sat).

    let daysToSaturday = 6 - currentStart.weekday;
    if (daysToSaturday < 0) daysToSaturday += 7; // If it's Sunday (7), we need 6 days to get to next Saturday? No.
    // If today is Sunday (7). Next Saturday is 6 days away.
    // If today is Saturday (6). Next Saturday is 0 days away (today).

    // Wait, let's trace "1st is Wed". Wed is 3.
    // Sat is 6. 6 - 3 = 3 days to add. 1+3 = 4th. Correct.

    // "1st is Sunday". Sun is 7.
    // Sat is 6.
    // Logic: We want to reach the *upcoming* Saturday.
    // If we are on Sunday(7), Saturday is next week... wait.
    // Standard week: Sun, Mon, Tue, Wed, Thu, Fri, Sat.
    // If 1st is Sunday. It is the start of the week. Saturday is the 7th.
    // Luxon weekday: Mon=1, ..., Sat=6, Sun=7.

    // If 1st is Sun(7). We want to go to Sat(6).
    // The "current week" in standard terms (Sun-Sat) includes this Sunday.
    // But Luxon ISO week is Mon-Sun.

    // Let's treat Sunday as day 0, Saturday as day 6?
    // Or just use Luxon's weekday and math.

    // Target: We want to find the date of the nearest upcoming Saturday (inclusive).
    // If currentStart is Sat(6), it is the end.
    // If currentStart is Sun(7), we want the following Sat(6).

    // Using Luxon:
    // nextSaturday = currentStart.set({ weekday: 6 }) ?
    // If current is Sun(7), set(6) goes to *previous* Sat in ISO week (Mon-Sun).

    // Easier way: loop until we hit Saturday or End of Month.
    let current = currentStart;
    while (current.weekday !== 6 && current < endOfMonth) {
      current = current.plus({ days: 1 });
    }
    // Now 'current' is either Saturday or EndOfMonth (or strictly current < endOfMonth loop ended so it might be endOfMonth).
    // Re-check:
    // If we hit end of month before Saturday, the week ends at endOfmonth.

    let weekEnd = current;
    if (weekEnd > endOfMonth) weekEnd = endOfMonth; // Should be handled by loop condition but strict check.

    weeks.push({ start: currentStart, end: weekEnd });

    // Setup for next week
    currentStart = weekEnd.plus({ days: 1 });
  }

  // Find which week contains the requested date
  const targetDay = date.startOf('day');
  const targetWeek = weeks.find(
    w => targetDay >= w.start.startOf('day') && targetDay <= w.end.startOf('day')
  );

  if (!targetWeek) {
    // Fallback to the last week if it's the very end of the month or something went wrong
    return weeks[weeks.length - 1] || { start: startOfMonth, end: endOfMonth };
  }

  return targetWeek;
}

export function moveMonthWeek(date: DateTime, offset: number): DateTime {
  let currentDate = date;

  // We need to move 'offset' steps in the list of all consecutive month-weeks.
  // Since month-weeks reset every month, this effectively means moving to prev/next week content.
  // The 'date' stays in the middle? No, usually we just pick the start or some valid date in that week.

  // Simple iteration:
  // 1. Get current week range.
  // 2. If offset > 0:
  //    Check if we can move to next week in current month.
  //    If yes, pick start of next week.
  //    If no, pick start of first week of next month.
  // 3. If offset < 0:
  //    Check if we can move to prev week in current month.
  //    If yes, pick start of prev week.
  //    If no, pick start of last week of prev month.

  if (offset === 0) return date;

  const direction = offset > 0 ? 1 : -1;
  const steps = Math.abs(offset);

  for (let i = 0; i < steps; i++) {
    const range = getMonthWeekRange(currentDate);

    if (direction === 1) {
      // Moving forward
      const nextWeekStart = range.end.plus({ days: 1 });
      currentDate = nextWeekStart; // If this goes to next month, getMonthWeekRange will handle it correctly for that month.
    } else {
      // Moving backward
      const prevWeekEnd = range.start.minus({ days: 1 });
      // We need to be in the *previous* week.
      // 'prevWeekEnd' is in the previous week (or previous month's last week).
      currentDate = prevWeekEnd;
    }
  }

  return currentDate;
}
