'use client';

import React, { useMemo, useState, memo } from 'react';
import { DateTime } from 'luxon';
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Record, Category } from '../../types';
import Card from '../ui/Card';

import { getMonthWeekRange, moveMonthWeek } from '../../lib/dateUtils';

interface ProfitAnalysisProps {
  records: Record[];
  categories: Category[];
  targetDate: DateTime;
  period: 'week' | 'month';
}

// Custom Tooltip for Premium Look and High Visibility
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {entry.name}
                </span>
              </div>
              <span className="text-[12px] font-black text-gray-900 dark:text-white">
                {entry.value.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Sub-component for Trend Chart to isolate state
const TrendAnalysisChart = memo(({ data, period }: { data: any[]; period: 'week' | 'month' }) => {
  const [activeSeries, setActiveSeries] = useState({
    매출: true,
    비용: true,
    순이익: true
  });

  const toggleSeries = (key: keyof typeof activeSeries) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card title={`기간별 통계 추이 (${period === 'week' ? '주간' : '월간'})`} icon={null}>
      <div className="flex flex-col h-full">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-6 px-4">
          {[
            { key: '매출', color: 'bg-blue-500' },
            { key: '비용', color: 'bg-rose-500' },
            { key: '순이익', color: 'bg-emerald-500' }
          ].map(({ key, color }) => (
            <button
              key={key}
              onClick={() => toggleSeries(key as keyof typeof activeSeries)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${
                activeSeries[key as keyof typeof activeSeries]
                  ? `${color} text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 grayscale opacity-50'
              }`}>
              {key}
            </button>
          ))}
        </div>

        <div className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v / 10000).toLocaleString()}만`}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeSeries.매출 && (
                <Area
                  type="monotone"
                  dataKey="매출"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                />
              )}
              {activeSeries.비용 && (
                <Area
                  type="monotone"
                  dataKey="비용"
                  stroke="#f87171"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  dot={{ r: 3, fill: '#f87171', strokeWidth: 2, stroke: '#fff' }}
                />
              )}
              {activeSeries.순이익 && (
                <Area
                  type="monotone"
                  dataKey="순이익"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});

export default function ProfitAnalysis({ records, targetDate, period }: ProfitAnalysisProps) {
  const range = useMemo(() => {
    if (period === 'month') {
      return { start: targetDate.startOf('month'), end: targetDate.endOf('month') };
    }
    return getMonthWeekRange(targetDate);
  }, [targetDate, period]);

  const currentPeriodData = useMemo(() => {
    const periodRecords = records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= range.start.startOf('day') && d <= range.end.endOf('day');
    });

    const income = periodRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const expense = periodRecords
      .filter(r => r.type === 'purchase' || r.type === 'spending')
      .reduce((s, r) => s + r.amount, 0);

    return { income, expense, profit: income - expense };
  }, [records, range]);

  const comparisonChartData = useMemo(
    () => [
      {
        name: period === 'week' ? '선택 주간' : '선택 월간',
        매출: currentPeriodData.income,
        비용: currentPeriodData.expense,
        순이익: currentPeriodData.profit
      }
    ],
    [period, currentPeriodData.income, currentPeriodData.expense, currentPeriodData.profit]
  );

  const trendData = useMemo(() => {
    const data = [];
    const periodsCount = 6;

    for (let i = periodsCount - 1; i >= 0; i--) {
      let pStart: DateTime, pEnd: DateTime, label: string;

      if (period === 'month') {
        const d = targetDate.minus({ months: i });
        pStart = d.startOf('month');
        pEnd = d.endOf('month');
        label = d.toFormat('yy.MM');
      } else {
        const d = moveMonthWeek(targetDate, -i);
        const wr = getMonthWeekRange(d);
        pStart = wr.start;
        pEnd = wr.end;

        const firstDayOfMonth = d.startOf('month');
        const firstSatDate = 1 + ((6 - firstDayOfMonth.weekday + 7) % 7);
        let weekNum = 1;
        if (d.day > firstSatDate) {
          weekNum = 1 + Math.ceil((d.day - firstSatDate) / 7);
        }
        label = `${d.toFormat('M/')} ${weekNum}주`;
      }

      const pRecords = records.filter(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        return d >= pStart.startOf('day') && d <= pEnd.endOf('day');
      });

      const income = pRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = pRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0);

      data.push({
        label,
        매출: income,
        비용: expense,
        순이익: income - expense
      });
    }

    return data;
  }, [records, targetDate, period]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-950 p-6 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <div className="w-24 h-24 bg-blue-500 rounded-full" />
          </div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            총 매출 ({period === 'week' ? '주간' : '월간'})
          </h4>
          <p className="text-3xl font-black text-blue-500">
            +{currentPeriodData.income.toLocaleString()}원
          </p>
        </div>
        <div className="bg-white dark:bg-gray-950 p-6 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative group transition-all hover:shadow-xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-8 opacity-[0.1] group-hover:scale-110 transition-transform">
            <div className="w-24 h-24 bg-rose-500 rounded-full blur-3xl" />
          </div>
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
            총 비용 ({period === 'week' ? '주간' : '월간'})
          </h4>
          <p className="text-3xl font-black text-rose-500">
            -{currentPeriodData.expense.toLocaleString()}원
          </p>
        </div>
        <div
          className={`p-6 rounded-[32px] border shadow-sm overflow-hidden relative group transition-all hover:shadow-xl hover:-translate-y-1 ${
            currentPeriodData.profit >= 0
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-rose-500 text-white border-rose-600'
          }`}>
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
            <div className="w-24 h-24 bg-white rounded-full" />
          </div>
          <h4 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">
            순이익 ({period === 'week' ? '주간' : '월간'})
          </h4>
          <p className="text-3xl font-black">
            {currentPeriodData.profit >= 0 ? '+' : ''}
            {currentPeriodData.profit.toLocaleString()}원
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit/Loss Comparison Bar Chart */}
        <Card title={`${period === 'week' ? '주간' : '월간'} 손익 비교`} icon={null}>
          <div className="h-[350px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="name" hide />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 10000).toLocaleString()}만`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="매출"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  label={{ position: 'top', fontSize: 10, offset: 10, fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="비용"
                  fill="#f87171"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  label={{ position: 'top', fontSize: 10, offset: 10, fontWeight: 'bold' }}
                />
                <Bar
                  dataKey="순이익"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  label={{ position: 'top', fontSize: 10, offset: 10, fontWeight: 'bold' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Statistical Trend Chart Section */}
        <div className="lg:col-span-2">
          <TrendAnalysisChart data={trendData} period={period} />
        </div>
      </div>
    </div>
  );
}
