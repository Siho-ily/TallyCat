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
  totalIncome: number;
  totalExpense: number;
  onDayClick: (date: DateTime) => void;
}

export default function CalendarView({
  calendarDays,
  totalIncome,
  totalExpense,
  onDayClick
}: CalendarViewProps) {
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

              <div className="space-y-1 mt-auto pt-2">
                {day.income > 0 && (
                  <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 truncate bg-emerald-500/10 dark:bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    +{day.income.toLocaleString()}
                  </div>
                )}
                {day.expense > 0 && (
                  <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 truncate bg-rose-500/10 dark:bg-rose-500/5 px-2 py-0.5 rounded-md border border-rose-500/20">
                    -{day.expense.toLocaleString()}
                  </div>
                )}
                {hasData && (
                  <div
                    className={`text-[10px] font-black text-center mt-1 pt-1 border-t border-gray-100 dark:border-gray-800 ${
                      day.profit >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-rose-600 dark:text-rose-400'
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

      {/* Monthly Total Summary Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-white dark:bg-gray-950 rounded-[32px] border border-gray-200 dark:border-gray-800 p-6 flex flex-wrap items-center justify-center gap-10 md:gap-16 shadow-sm">
          <div className="flex flex-wrap items-center gap-10 lg:gap-16">
            <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                총 매출 (+)
              </p>
              <p className="text-lg font-black text-emerald-500">
                +{totalIncome.toLocaleString()}원
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                총 비용 (-)
              </p>
              <p className="text-lg font-black text-rose-500">-{totalExpense.toLocaleString()}원</p>
            </div>
            <div className="h-10 w-[1px] bg-gray-100 dark:bg-gray-800 hidden sm:block" />
            <div className="text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                월간 총 순익
              </p>
              <p
                className={`text-2xl font-black ${
                  totalIncome - totalExpense >= 0 ? 'text-blue-500' : 'text-rose-500'
                }`}>
                {totalIncome - totalExpense >= 0 ? '+' : ''}
                {(totalIncome - totalExpense).toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
