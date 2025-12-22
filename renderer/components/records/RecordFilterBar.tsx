'use client';

import React from 'react';
import { Search, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { DateTime } from 'luxon';
import { Category } from '../../types';

interface RecordFilterBarProps {
  viewMode: 'list' | 'calendar';
  period: 'all' | 'day' | 'week' | 'month' | 'year';
  setPeriod: (period: 'all' | 'day' | 'week' | 'month' | 'year') => void;
  currentMonth: DateTime;
  setCurrentMonth: (month: DateTime) => void;
  typeFilter: 'all' | 'income' | 'expense';
  setTypeFilter: (type: 'all' | 'income' | 'expense') => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  handleResetFilters: () => void;
}

export default function RecordFilterBar({
  viewMode,
  period,
  setPeriod,
  currentMonth,
  setCurrentMonth,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  categories,
  handleResetFilters
}: RecordFilterBarProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xl">
      <div className="flex flex-wrap items-center gap-4">
        {/* Time Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
            시간
          </span>
          {viewMode === 'list' ? (
            <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
              {(['all', 'day', 'week', 'month', 'year'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    period === p
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  {p === 'all'
                    ? '전체'
                    : p === 'day'
                    ? '오늘'
                    : p === 'week'
                    ? '주간'
                    : p === 'month'
                    ? '월간'
                    : '년간'}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-950 px-4 py-1.5 rounded-xl border border-gray-800">
              <button
                onClick={() => setCurrentMonth(currentMonth.minus({ months: 1 }))}
                className="text-gray-500 hover:text-white p-0.5">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black text-white min-w-[80px] text-center">
                {currentMonth.toFormat('yyyy년 L월')}
              </span>
              <button
                onClick={() => setCurrentMonth(currentMonth.plus({ months: 1 }))}
                className="text-gray-500 hover:text-white p-0.5">
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentMonth(DateTime.now().startOf('month'))}
                className="ml-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                Today
              </button>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-800 mx-1 hidden lg:block" />

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            유형
          </span>
          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value as any);
              setCategoryFilter('all');
            }}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none hover:border-gray-700 transition-all cursor-pointer">
            <option value="all">모든 유형</option>
            <option value="income">매출 (Income)</option>
            <option value="expense">매입 (Expense)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            카테고리
          </span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none hover:border-gray-700 transition-all cursor-pointer min-w-[120px]">
            <option value="all">전체 카테고리</option>
            {categories
              .filter(c => typeFilter === 'all' || c.type === typeFilter)
              .map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group min-w-[240px]">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors"
          size={16}
        />
        <input
          type="text"
          placeholder="내역 검색 (메모, 금액...)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-2 text-xs font-medium text-white placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Calendar View Legend */}
      {viewMode === 'calendar' && (
        <div className="flex items-center gap-6 pr-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Income
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Expense
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleResetFilters}
        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-500 hover:text-white bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
        title="필터 초기화">
        <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
        <span>초기화</span>
      </button>
    </div>
  );
}
