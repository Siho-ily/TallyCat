'use client';

import React from 'react';
import { DateTime } from 'luxon';

interface CalendarDay {
  date: DateTime;
  isCurrentMonth: boolean;
  income: number;
  expense: number;
  profit: number;
}

interface CalendarViewProps {
  calendarDays: CalendarDay[];
  onDayClick: (date: DateTime) => void;
}

export default function CalendarView({ calendarDays, onDayClick }: CalendarViewProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-[40px] overflow-hidden shadow-2xl p-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-7 gap-1">
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
        {calendarDays.map((day, idx) => {
          const isToday = day.date.hasSame(DateTime.now(), 'day');
          const hasData = day.income > 0 || day.expense > 0;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day.date.set({ hour: 12, minute: 0, second: 0 }))}
              className={`min-h-[120px] p-2 rounded-2xl border transition-all cursor-pointer group relative flex flex-col justify-between ${
                day.isCurrentMonth
                  ? 'bg-white dark:bg-gray-950/50 border-gray-200 dark:border-gray-800/50 hover:border-blue-500/40 hover:bg-gray-100 dark:hover:bg-gray-900/50'
                  : 'bg-transparent border-transparent opacity-20'
              } ${isToday ? 'ring-2 ring-blue-500/50 bg-blue-500/5 border-blue-500/20' : ''}`}>
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
                  <span className="text-[8px] px-2 py-0.5 bg-blue-500 text-white rounded-full font-black uppercase">
                    Today
                  </span>
                )}
              </div>

              <div className="space-y-1.5 backdrop-blur-sm">
                {day.income > 0 && (
                  <div className="text-[10px] font-black text-emerald-500 truncate bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    {day.income.toLocaleString()}
                  </div>
                )}
                {day.expense > 0 && (
                  <div className="text-[10px] font-black text-rose-500 truncate bg-rose-500/5 px-2 py-1 rounded-lg border border-rose-500/10">
                    {day.expense.toLocaleString()}
                  </div>
                )}
                {hasData && (
                  <div
                    className={`text-[9px] font-bold text-center mt-1 border-t border-gray-800/50 pt-1 ${
                      day.profit >= 0 ? 'text-blue-400/50' : 'text-rose-400/50'
                    }`}>
                    {day.profit >= 0 ? '+' : ''}
                    {day.profit.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Subtle hover effect indicator */}
              <div className="absolute inset-0 rounded-3xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
