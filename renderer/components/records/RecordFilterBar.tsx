'use client';

import React from 'react';
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { DateTime } from 'luxon';
import { Category, PaymentMethod } from '../../types';
import { Button, Input } from '../ui/InputControls';

interface RecordFilterBarProps {
  period: 'day' | 'week' | 'month' | 'year';
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  currentDate: DateTime;
  setCurrentDate: (date: DateTime) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  setFilterCategory: (id: string) => void;
  filterPaymentMethod: string;
  setFilterPaymentMethod: (id: string) => void;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  globalIncome: number;
  globalExpense: number;
}

export default function RecordFilterBar({
  period,
  setPeriod,
  currentDate,
  setCurrentDate,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterPaymentMethod,
  setFilterPaymentMethod,
  categories,
  paymentMethods,
  globalIncome,
  globalExpense
}: RecordFilterBarProps) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const moveDate = (offset: number) => {
    setCurrentDate(currentDate.plus({ [period + 's']: offset }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (period === 'year') {
      setCurrentDate(currentDate.set({ year: parseInt(val) }));
    } else if (period === 'month') {
      const [y, m] = val.split('-');
      setCurrentDate(currentDate.set({ year: parseInt(y), month: parseInt(m) }));
    } else {
      setCurrentDate(DateTime.fromISO(val));
    }
  };

  const getPeriodLabel = () => {
    if (period === 'day') return currentDate.toFormat('yyyy년 MM월 dd일');
    if (period === 'week') {
      const start = currentDate.startOf('week');
      const end = currentDate.endOf('week');
      return `${start.toFormat('MM.dd')} ~ ${end.toFormat('MM.dd')}`;
    }
    if (period === 'month') return currentDate.toFormat('yyyy년 MM월');
    if (period === 'year') return currentDate.toFormat('yyyy년');
    return '';
  };

  // Generate years for the year picker (current +/- 10 years)
  const years = React.useMemo(() => {
    const currentYear = DateTime.now().year;
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-[32px] shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* 1st Row: Global Statistics (Total Cumulative) */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <PieChart size={20} />
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              전체 누적 통계
            </h3>
            <p className="text-[10px] text-gray-600 font-bold">
              시스템에 등록된 모든 내역의 합계입니다.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-8 lg:gap-12">
          <StatItem label="누적 매출" value={globalIncome} color="emerald" />
          <StatItem label="누적 매입" value={globalExpense} color="rose" />
          <StatItem label="전체 순익" value={globalIncome - globalExpense} color="blue" />
        </div>
      </div>

      <div className="space-y-4">
        {/* 2nd Row: Period Controls (Horizontal) */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <div className="flex p-1 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shrink-0">
            {(['day', 'week', 'month', 'year'] as const).map(p => (
              <Button
                key={p}
                variant={period === p ? 'primary' : 'ghost'}
                size="sm"
                className="!text-[10px] !px-4 !rounded-xl"
                onClick={() => setPeriod(p)}>
                {p === 'day' ? '일일' : p === 'week' ? '주간' : p === 'month' ? '월간' : '연간'}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-950 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 h-[42px] flex-1 md:flex-none md:min-w-[240px] justify-between relative group">
            <Button variant="ghost" size="sm" className="!p-2" onClick={() => moveDate(-1)}>
              <ChevronLeft size={16} />
            </Button>

            <div className="flex-1 px-2 relative group/inner h-full flex items-center justify-center">
              <div
                onClick={() => {
                  if (period === 'year') return;
                  if (dateInputRef.current) {
                    if (typeof (dateInputRef.current as any).showPicker === 'function') {
                      (dateInputRef.current as any).showPicker();
                    } else {
                      dateInputRef.current.click();
                    }
                  }
                }}
                className={`flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-4 py-1.5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${
                  period === 'year' ? 'active:scale-95' : ''
                }`}>
                <CalendarIcon
                  size={14}
                  className="text-blue-500 opacity-70 group-hover/inner:opacity-100 transition-opacity"
                />
                <span className="text-[11px] font-black text-gray-950 dark:text-white whitespace-nowrap">
                  {getPeriodLabel()}
                </span>
                <ChevronDown
                  size={12}
                  className="text-blue-500 dark:text-blue-400 group-hover/inner:translate-y-0.5 transition-transform"
                />
              </div>

              {period === 'year' ? (
                <select
                  value={currentDate.year}
                  onChange={handleDateChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full [color-scheme:light] dark:[color-scheme:dark]">
                  {years.map(y => (
                    <option
                      key={y}
                      value={y}
                      className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      {y}년
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  ref={dateInputRef}
                  type={period === 'month' ? 'month' : 'date'}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                  value={
                    period === 'month'
                      ? currentDate.toFormat('yyyy-MM')
                      : currentDate.toISODate() || ''
                  }
                  onChange={handleDateChange}
                />
              )}
            </div>

            <Button variant="ghost" size="sm" className="!p-2" onClick={() => moveDate(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* 3rd Row: Search & Category Filters (Horizontal) */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch">
          <div className="flex gap-2 shrink-0">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="h-[42px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-[11px] font-bold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer text-gray-900 dark:text-white min-w-[80px] [color-scheme:light] dark:[color-scheme:dark]">
              <option
                value="all"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                전체 유형
              </option>
              <option
                value="income"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                매출
              </option>
              <option
                value="expense"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                매입
              </option>
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="h-[42px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-[11px] font-bold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer min-w-[130px] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]">
              <option
                value="all"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                전체 카테고리
              </option>
              {categories
                .filter(
                  c => (filterType === 'all' || c.type === filterType) && c.is_active !== false
                )
                .map(cat => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    {cat.name}
                  </option>
                ))}
            </select>

            <select
              value={filterPaymentMethod}
              onChange={e => setFilterPaymentMethod(e.target.value)}
              className="h-[42px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-[11px] font-bold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer min-w-[110px] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]">
              <option
                value="all"
                className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                전체 결제방식
              </option>
              {paymentMethods
                .filter(pm => pm.is_active !== false)
                .map(pm => (
                  <option
                    key={pm.id}
                    value={pm.id}
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    {pm.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1">
            <Input
              placeholder="메모 또는 금액으로 빠른 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              prefixIcon={<SearchIcon size={16} />}
              className="!h-[42px] !text-[11px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: 'emerald' | 'rose' | 'blue';
}) {
  const colorMap = {
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400'
  };

  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <div className="hidden sm:block">
        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">
          {label}
        </p>
        <p className={`text-sm font-black ${colorMap[color]}`}>
          {value >= 0 ? '+' : ''}
          {value.toLocaleString()}원
        </p>
      </div>
      <div className="sm:hidden">
        <p className={`text-[11px] font-black ${colorMap[color]}`}>
          {label.split(' ')[1]} {value.toLocaleString()}원
        </p>
      </div>
    </div>
  );
}
