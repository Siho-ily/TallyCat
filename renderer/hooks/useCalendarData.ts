'use client';

import React from 'react';
import { DateTime } from 'luxon';
import { Record } from '../types';

interface CalendarDay {
  date: DateTime;
  isCurrentMonth: boolean;
  income: number;
  expense: number;
  profit: number;
}

export function useCalendarData(currentDate: DateTime, records: Record[]): CalendarDay[] {
  return React.useMemo(() => {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');
    const days: CalendarDay[] = [];
    let curr = start;

    while (curr <= end) {
      const dayRecords = records.filter(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        return d.hasSame(curr, 'day');
      });

      const income = dayRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = dayRecords
        .filter(r => r.type === 'expense')
        .reduce((s, r) => s + r.amount, 0);

      days.push({
        date: curr,
        isCurrentMonth: curr.month === currentDate.month,
        income,
        expense,
        profit: income - expense
      });
      curr = curr.plus({ days: 1 });
    }
    return days;
  }, [currentDate, records]);
}
