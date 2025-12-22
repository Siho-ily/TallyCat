'use client';

import React from 'react';
import { Search as SearchIcon, ArrowLeft, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { DateTime } from 'luxon';
import { Category } from '../../types';
import { Button, Input } from '../ui/InputControls';

interface RecordFilterBarProps {
  viewMode: 'list' | 'calendar';
  setViewMode: (mode: 'list' | 'calendar') => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: 'all' | 'income' | 'expense';
  setFilterType: (type: 'all' | 'income' | 'expense') => void;
  filterCategory: string;
  setFilterCategory: (id: string) => void;
  categories: Category[];
  totalIncome: number;
  totalExpense: number;
  onExport: () => void;
}

export default function RecordFilterBar({
  viewMode,
  setViewMode,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  categories,
  totalIncome,
  totalExpense,
  onExport
}: RecordFilterBarProps) {
  const moveMonth = (offset: number) => {
    const start = DateTime.fromISO(startDate).plus({ months: offset }).startOf('month').toISODate();
    const end = DateTime.fromISO(startDate).plus({ months: offset }).endOf('month').toISODate();
    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-[40px] shadow-xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col xl:flex-row gap-8 items-stretch xl:items-end justify-between">
        {/* Left: View & Date Selector */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-end">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
              보기 모드
            </span>
            <div className="flex p-1.5 bg-gray-950 rounded-2xl border border-gray-800">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                className="!rounded-xl"
                onClick={() => setViewMode('list')}>
                목록
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                size="sm"
                className="!rounded-xl"
                onClick={() => setViewMode('calendar')}>
                달력
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
              조회 기간
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-2xl border border-gray-800">
                <Button variant="ghost" size="sm" className="!p-2" onClick={() => moveMonth(-1)}>
                  <ArrowLeft size={16} />
                </Button>
                <div className="flex items-center gap-2 px-3">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="!bg-transparent !border-none !p-0 !min-w-[120px] !text-xs !ring-0"
                  />
                  <span className="text-gray-700 font-bold">~</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="!bg-transparent !border-none !p-0 !min-w-[120px] !text-xs !ring-0"
                  />
                </div>
                <Button variant="ghost" size="sm" className="!p-2" onClick={() => moveMonth(1)}>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-end flex-1 xl:max-w-3xl">
          <div className="flex-1 space-y-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
              검색 정렬
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="메모 내용으로 검색..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  prefixIcon={<SearchIcon size={18} />}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="bg-gray-950 border border-gray-800 text-xs font-bold rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer">
                  <option value="all">모든 유형</option>
                  <option value="income">매출만</option>
                  <option value="expense">매입만</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-xs font-bold rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none cursor-pointer min-w-[120px]">
                  <option value="all">모든 카테고리</option>
                  {categories
                    .filter(c => filterType === 'all' || c.type === filterType)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <Button variant="secondary" onClick={onExport} icon={<FileSpreadsheet size={18} />}>
            내보내기
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-wrap items-center gap-10 pt-8 border-t border-gray-800/50">
        <StatItem label="선택 기간 매출" value={totalIncome} color="emerald" />
        <StatItem label="선택 기간 매입" value={totalExpense} color="rose" />
        <StatItem label="선택 기간 순익" value={totalIncome - totalExpense} color="blue" />
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
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-2xl font-black ${colorMap[color]}`}>
        {value >= 0 ? '+' : ''}
        {value.toLocaleString()}원
      </p>
    </div>
  );
}
