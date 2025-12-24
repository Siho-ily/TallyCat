'use client';

import React, { useMemo } from 'react';
import { DateTime } from 'luxon';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Record, Category } from '../../types';
import Card from '../ui/Card';

import { getMonthWeekRange } from '../../lib/dateUtils';

interface ProfitAnalysisProps {
  records: Record[];
  categories: Category[];
  targetDate: DateTime;
  period: 'week' | 'month';
}

const PROFIT_COLORS = ['#3b82f6', '#f87171']; // Blue for Revenue, Rose for Cost

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

  const dailyTrendData = useMemo(() => {
    if (period === 'month') {
      const daysInMonth = targetDate.daysInMonth || 30;
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return { day: `${day}일`, 매출: 0, 비용: 0, 순이익: 0 };
      });

      records.forEach(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        if (d.year === targetDate.year && d.month === targetDate.month) {
          data[d.day - 1].매출 += r.amount;
          data[d.day - 1].비용 += r.type === 'income' ? 0 : r.amount;
        }
      });
      data.forEach(d => {
        d.순이익 = d.매출 - d.비용;
      });
      return data;
    } else {
      // Weekly view: Show 7 days of the week
      const data = [];
      let current = range.start.startOf('day');
      while (current <= range.end.endOf('day')) {
        const label = current.weekday === 7 ? '일' : current.toFormat('ccc'); // Short weekday names
        data.push({
          day: `${current.toFormat('MM.dd')} (${label})`,
          date: current,
          매출: 0,
          비용: 0,
          순이익: 0
        });
        current = current.plus({ days: 1 });
      }

      records.forEach(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        const found = data.find(item => item.date.hasSame(d, 'day'));
        if (found) {
          if (r.type === 'income') found.매출 += r.amount;
          else found.비용 += r.amount;
        }
      });
      data.forEach(d => {
        d.순이익 = d.매출 - d.비용;
      });
      return data;
    }
  }, [records, range, period, targetDate]);

  const weeklyTrendData = useMemo(() => {
    if (period === 'week') return []; // Don't show weekly trend if we are viewing a specific week

    const startOfMonth = targetDate.startOf('month');
    const endOfMonth = targetDate.endOf('month');
    const weeksList = [];
    let currentStart = startOfMonth;

    while (currentStart <= endOfMonth) {
      let current = currentStart;
      while (current.weekday !== 6 && current < endOfMonth) {
        current = current.plus({ days: 1 });
      }
      const weekRangeEnd = current;

      const weekRecords = records.filter(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        return d >= currentStart.startOf('day') && d <= weekRangeEnd.endOf('day');
      });

      const income = weekRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = weekRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0);

      weeksList.push({
        name: `${weeksList.length + 1}주차`,
        range: `${currentStart.toFormat('MM.dd')}~${weekRangeEnd.toFormat('MM.dd')}`,
        매출: income,
        비용: expense,
        순이익: income - expense
      });

      currentStart = weekRangeEnd.plus({ days: 1 });
    }

    return weeksList;
  }, [records, targetDate, period]);

  const pieData = [
    { name: '총매출', value: currentPeriodData.income },
    { name: '총비용', value: currentPeriodData.expense }
  ];

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
              ? 'bg-blue-500 text-white border-blue-600'
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

      <div className={`grid grid-cols-1 ${period === 'month' ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* Pie Analysis */}
        <Card title={`${period === 'week' ? '주간' : '월간'} 손익 비중`} icon={null}>
          <div className="h-[350px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={10}
                  dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PROFIT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()}원`}
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text Labels */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                순수익
              </span>
              <span
                className={`text-xl font-black ${
                  currentPeriodData.profit >= 0 ? 'text-blue-500' : 'text-rose-500'
                }`}>
                {currentPeriodData.profit.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-black text-gray-600 dark:text-gray-400">총매출</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-xs font-black text-gray-600 dark:text-gray-400">총비용</span>
            </div>
          </div>
        </Card>

        {/* Weekly Profit Trend (Only for Month view) */}
        {period === 'month' && (
          <Card title="주간별 손익 추이" icon={null}>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={v => `${(v / 10000).toLocaleString()}만`}
                  />
                  <Tooltip
                    labelFormatter={(_label, payload) => payload[0]?.payload?.range || ''}
                    formatter={(value: number) => `${value.toLocaleString()}원`}
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="매출" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="비용" fill="#f87171" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="순이익" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Daily Profit Trend */}
      <Card title={`${period === 'week' ? '요일별' : '일별'} 손익 상세 추이`} icon={null}>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v / 10000).toLocaleString()}만`}
              />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}원`}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar
                dataKey="순이익"
                fill={currentPeriodData.profit >= 0 ? '#3b82f6' : '#f87171'}
                radius={[4, 4, 0, 0]}
              />
              {period === 'week' && (
                <>
                  <Bar dataKey="매출" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="비용" fill="#fb7185" radius={[4, 4, 0, 0]} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
