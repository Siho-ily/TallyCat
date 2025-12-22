'use client';

import React from 'react';

interface RetentionInputGroupProps {
  years: string;
  months: string;
  days: string;
  count: string;
  onYearsChange: (value: string) => void;
  onMonthsChange: (value: string) => void;
  onDaysChange: (value: string) => void;
  onCountChange: (value: string) => void;
  onYearsBlur: (value: string) => void;
  onMonthsBlur: (value: string) => void;
  onDaysBlur: (value: string) => void;
  onCountBlur: (value: string) => void;
  disabled: boolean;
}

export default function RetentionInputGroup({
  years,
  months,
  days,
  count,
  onYearsChange,
  onMonthsChange,
  onDaysChange,
  onCountChange,
  onYearsBlur,
  onMonthsBlur,
  onDaysBlur,
  onCountBlur,
  disabled
}: RetentionInputGroupProps) {
  return (
    <div
      className={`space-y-3 transition-all ${
        disabled ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'
      }`}>
      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <span className="text-[8px] font-black text-gray-500 dark:text-gray-700 uppercase pl-1">
            년
          </span>
          <input
            type="number"
            value={years}
            onChange={e => onYearsChange(e.target.value)}
            onBlur={e => onYearsBlur(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[8px] font-black text-gray-500 dark:text-gray-700 uppercase pl-1">
            월
          </span>
          <input
            type="number"
            value={months}
            onChange={e => onMonthsChange(e.target.value)}
            onBlur={e => onMonthsBlur(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[8px] font-black text-gray-500 dark:text-gray-700 uppercase pl-1">
            일
          </span>
          <input
            type="number"
            value={days}
            onChange={e => onDaysChange(e.target.value)}
            onBlur={e => onDaysBlur(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-[8px] font-black text-gray-500 dark:text-gray-700 uppercase pl-1">
          최대 보관 개수
        </span>
        <input
          type="number"
          value={count}
          onChange={e => onCountChange(e.target.value)}
          onBlur={e => onCountBlur(e.target.value)}
          placeholder="무제한: 0"
          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}
