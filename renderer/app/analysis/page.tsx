'use client';

import React, { useState } from 'react';
import { DateTime } from 'luxon';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/InputControls';
import { useData } from '../../context/DataContext';
import RevenueAnalysis from '../../components/analysis/RevenueAnalysis';
import CostAnalysis from '../../components/analysis/CostAnalysis';

export default function AnalysisPage() {
  const { records, categories, loading } = useData();
  const [currentMonth, setCurrentMonth] = useState(DateTime.now().startOf('month'));
  const [mode, setMode] = useState<'revenue' | 'cost'>('revenue');

  const handlePrevMonth = () => setCurrentMonth(currentMonth.minus({ months: 1 }));
  const handleNextMonth = () => setCurrentMonth(currentMonth.plus({ months: 1 }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader
        title="통계 분석"
        description="매장의 흐름을 데이터로 분석하고 전략을 세우세요."
        actions={
          <div className="flex items-center gap-3 bg-white dark:bg-gray-950 p-1 rounded-2xl border border-gray-200 dark:border-gray-800">
            <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="!p-2">
              <ChevronLeft size={16} />
            </Button>
            <div className="px-3 flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              <span className="text-sm font-black text-gray-900 dark:text-white">
                {currentMonth.toFormat('yyyy년 MM월')}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleNextMonth} className="!p-2">
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[20px] border border-gray-200 dark:border-gray-800 w-full max-w-md">
          <button
            onClick={() => setMode('revenue')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${
              mode === 'revenue'
                ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm border border-gray-200 dark:border-gray-700'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <BarChart3 size={16} />
            매출 분석
          </button>
          <button
            onClick={() => setMode('cost')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all ${
              mode === 'cost'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <PieChartIcon size={16} />
            비용 분석
          </button>
        </div>
      </div>

      {mode === 'revenue' ? (
        <RevenueAnalysis records={records} categories={categories} targetMonth={currentMonth} />
      ) : (
        <CostAnalysis records={records} categories={categories} targetMonth={currentMonth} />
      )}
    </div>
  );
}
