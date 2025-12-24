'use client';

import React from 'react';
import { DateTime } from 'luxon';
import { Record } from '../../types';
import { getMonthWeekRange } from '../../lib/dateUtils';

interface WeeklySummaryViewProps {
  currentDate: DateTime;
  records: Record[];
  onDayClick: (date: DateTime) => void;
}

export default function WeeklySummaryView({
  currentDate,
  records,
  onDayClick
}: WeeklySummaryViewProps) {
  const { start, end } = getMonthWeekRange(currentDate);

  // Create a fixed 7-day grid based on Sunday-Saturday
  const grid = React.useMemo(() => {
    // 0: Sun, 1: Mon, ..., 6: Sat
    const slots = Array(7).fill(null);

    let curr = start;
    while (curr <= end) {
      const idx = curr.weekday % 7; // Sunday is 7, 7%7 = 0. Mon is 1, 1%7=1...

      const dayStr = curr.toFormat('yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date.startsWith(dayStr));
      const income = dayRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = dayRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0);

      slots[idx] = {
        date: curr,
        income,
        expense,
        profit: income - expense
      };

      curr = curr.plus({ days: 1 });
    }
    return slots;
  }, [start, end, records]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-[40px] overflow-hidden shadow-2xl p-6 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-7 gap-3">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`text-center text-[10px] font-black uppercase tracking-widest pb-4 ${
              i === 0
                ? 'text-rose-500'
                : i === 6
                ? 'text-blue-500'
                : 'text-gray-400 dark:text-gray-600'
            }`}>
            {d}
          </div>
        ))}

        {grid.map((day, idx) => {
          if (!day) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[140px] p-4 rounded-[28px] bg-transparent border border-dashed border-gray-200 dark:border-gray-800/30 opacity-30"
              />
            );
          }

          const isToday = day.date.hasSame(DateTime.now(), 'day');
          const isTarget = day.date.hasSame(currentDate, 'day');
          const hasData = day.income > 0 || day.expense > 0;

          return (
            <div
              key={day.date.toISODate()}
              onClick={() => onDayClick(day.date)}
              className={`min-h-[140px] p-4 rounded-[28px] border transition-all cursor-pointer group relative flex flex-col justify-between ${
                isTarget
                  ? 'ring-2 ring-blue-500/50 bg-blue-500/5 border-blue-500/20 shadow-lg'
                  : 'bg-white dark:bg-gray-950/50 border-gray-200 dark:border-gray-800/50 hover:border-blue-500/40 hover:bg-gray-100 dark:hover:bg-gray-900/50'
              } ${isToday ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}`}>
              <div className="flex justify-between items-start">
                <span
                  className={`text-sm font-black ${
                    day.date.weekday === 7
                      ? 'text-rose-500'
                      : day.date.weekday === 6
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}>
                  {day.date.day}
                </span>
                {isToday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-500/50" />
                )}
              </div>

              <div className="space-y-1.5 mt-4">
                {day.income > 0 && (
                  <div className="text-[10px] font-black text-emerald-500 truncate bg-emerald-500/5 px-2 py-1 rounded-xl border border-emerald-500/10">
                    +{day.income.toLocaleString()}
                  </div>
                )}
                {day.expense > 0 && (
                  <div className="text-[10px] font-black text-rose-500 truncate bg-rose-500/5 px-2 py-1 rounded-xl border border-rose-500/10">
                    -{day.expense.toLocaleString()}
                  </div>
                )}
                {hasData ? (
                  <div
                    className={`text-[11px] font-black text-center mt-2 border-t border-gray-100 dark:border-gray-800 pt-2 ${
                      day.profit >= 0 ? 'text-blue-500' : 'text-rose-500'
                    }`}>
                    {day.profit >= 0 ? '+' : ''}
                    {day.profit.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-[9px] font-bold text-gray-300 dark:text-gray-700 text-center mt-2 italic">
                    내역 없음
                  </div>
                )}
              </div>

              {/* Subtle hover effect indicator */}
              <div className="absolute inset-0 rounded-[28px] bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
