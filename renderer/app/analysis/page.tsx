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
import ProfitAnalysis from '../../components/analysis/ProfitAnalysis';

import { getMonthWeekRange, moveMonthWeek } from '../../lib/dateUtils';

export default function AnalysisPage() {
  const { records, categories, loading } = useData();
  const [targetDate, setTargetDate] = useState(DateTime.now());
  const [period, setPeriod] = useState<'week' | 'month'>('month');
  const [mode, setMode] = useState<'summary' | 'revenue' | 'cost'>('summary');

  const handlePrev = () => {
    if (period === 'week') {
      setTargetDate(moveMonthWeek(targetDate, -1));
    } else {
      setTargetDate(targetDate.minus({ months: 1 }).startOf('month'));
    }
  };

  const handleNext = () => {
    if (period === 'week') {
      setTargetDate(moveMonthWeek(targetDate, 1));
    } else {
      setTargetDate(targetDate.plus({ months: 1 }).startOf('month'));
    }
  };

  const getTargetLabel = () => {
    if (period === 'month') return targetDate.toFormat('yyyy년 MM월');

    const { start, end } = getMonthWeekRange(targetDate);
    const firstDayOfMonth = targetDate.startOf('month');
    const firstSatDate = 1 + ((6 - firstDayOfMonth.weekday + 7) % 7);
    let weekNum = 1;
    if (targetDate.day > firstSatDate) {
      weekNum = 1 + Math.ceil((targetDate.day - firstSatDate) / 7);
    }
    return `${start.toFormat('MM.dd')} ~ ${end.toFormat('MM.dd')} (${targetDate.toFormat(
      'MM'
    )}월 ${weekNum}주)`;
  };

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
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            {/* Period Switcher */}
            <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'week'
                    ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                주간
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  period === 'month'
                    ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                월간
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-950 p-1 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Button variant="ghost" size="sm" onClick={handlePrev} className="!p-2">
                <ChevronLeft size={16} />
              </Button>
              <div className="px-3 flex items-center gap-2 min-w-[140px] justify-center">
                <Calendar size={14} className="text-blue-500" />
                <span className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
                  {getTargetLabel()}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleNext} className="!p-2">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        }
      />

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[24px] border border-gray-200 dark:border-gray-800 w-full max-w-xl shadow-inner">
          <button
            onClick={() => setMode('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all ${
              mode === 'summary'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <PieChartIcon size={16} />
            종합 통계
          </button>
          <button
            onClick={() => setMode('revenue')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all ${
              mode === 'revenue'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <BarChart3 size={16} />
            매출 분석
          </button>
          <button
            onClick={() => setMode('cost')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all ${
              mode === 'cost'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <PieChartIcon size={16} />
            비용 분석
          </button>
        </div>
      </div>

      {mode === 'summary' && (
        <ProfitAnalysis
          records={records}
          categories={categories}
          targetDate={targetDate}
          period={period}
        />
      )}
      {mode === 'revenue' && (
        <RevenueAnalysis
          records={records}
          categories={categories}
          targetDate={targetDate}
          period={period}
        />
      )}
      {mode === 'cost' && (
        <CostAnalysis
          records={records}
          categories={categories}
          targetDate={targetDate}
          period={period}
        />
      )}
    </div>
  );
}
