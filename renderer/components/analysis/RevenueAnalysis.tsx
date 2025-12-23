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
  AreaChart,
  Area
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Record, Category } from '../../types';
import Card from '../ui/Card';

interface RevenueAnalysisProps {
  records: Record[];
  categories: Category[];
  targetMonth: DateTime;
}

const COLORS = [
  '#60a5fa',
  '#34d399',
  '#f87171',
  '#fbbf24',
  '#a78bfa',
  '#f472b6',
  '#2dd4bf',
  '#fb923c'
];

export default function RevenueAnalysis({
  records,
  categories,
  targetMonth
}: RevenueAnalysisProps) {
  const currentMonthRecords = useMemo(
    () =>
      records.filter(r => {
        const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
        return d.year === targetMonth.year && d.month === targetMonth.month && r.type === 'income';
      }),
    [records, targetMonth]
  );

  const prevMonthRecords = useMemo(() => {
    const prev = targetMonth.minus({ months: 1 });
    return records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d.year === prev.year && d.month === prev.month && r.type === 'income';
    });
  }, [records, targetMonth]);

  // 1. Chart Data: Categories
  const categoryChartData = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    const catMap = new Map<string, number>();

    currentMonthRecords.forEach(r => {
      const cat = categories.find(c => c.id === r.category_id);
      const name = cat ? cat.name : '미지정';
      catMap.set(name, (catMap.get(name) || 0) + r.amount);
    });

    catMap.forEach((value, name) => data.push({ name, value }));
    return data.sort((a, b) => b.value - a.value);
  }, [currentMonthRecords, categories]);

  // 2. Chart Data: Hourly
  const hourlyChartData = useMemo(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}시`,
      amount: 0
    }));

    currentMonthRecords.forEach(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      data[d.hour].amount += r.amount;
    });

    return data;
  }, [currentMonthRecords]);

  // 3. Table Data
  const tableData = useMemo(() => {
    const currentTotal = currentMonthRecords.reduce((s, r) => s + r.amount, 0);
    const prevTotal = prevMonthRecords.reduce((s, r) => s + r.amount, 0);
    const incomeCategories = categories.filter(c => c.type === 'income');
    const incomeCatIds = new Set(incomeCategories.map(c => c.id));

    const mappedData = incomeCategories
      .map(cat => {
        const catRecords = currentMonthRecords.filter(r => r.category_id === cat.id);
        const prevCatRecords = prevMonthRecords.filter(r => r.category_id === cat.id);

        const count = catRecords.length;
        const amount = catRecords.reduce((s, r) => s + r.amount, 0);
        const prevAmount = prevCatRecords.reduce((s, r) => s + r.amount, 0);

        const diff = amount - prevAmount;
        const diffPercent = prevAmount === 0 ? 0 : (diff / prevAmount) * 100;
        const share = currentTotal === 0 ? 0 : (amount / currentTotal) * 100;

        return {
          id: cat.id,
          name: cat.name,
          count,
          amount,
          diff,
          diffPercent,
          share,
          isTotal: false
        };
      })
      .filter(d => d.count > 0 || d.amount > 0);

    // Unassigned records
    const unassignedRecords = currentMonthRecords.filter(r => !incomeCatIds.has(r.category_id));
    const prevUnassignedRecords = prevMonthRecords.filter(r => !incomeCatIds.has(r.category_id));

    if (unassignedRecords.length > 0) {
      const count = unassignedRecords.length;
      const amount = unassignedRecords.reduce((s, r) => s + r.amount, 0);
      const prevAmount = prevUnassignedRecords.reduce((s, r) => s + r.amount, 0);
      const diff = amount - prevAmount;
      const diffPercent = prevAmount === 0 ? 0 : (diff / prevAmount) * 100;
      const share = currentTotal === 0 ? 0 : (amount / currentTotal) * 100;

      mappedData.push({
        id: 'unassigned',
        name: '미지정',
        count,
        amount,
        diff,
        diffPercent,
        share,
        isTotal: false
      });
    }

    mappedData.sort((a, b) => b.amount - a.amount);

    // Add Total Row at the beginning
    const totalDiff = currentTotal - prevTotal;
    const totalDiffPercent = prevTotal === 0 ? 0 : (totalDiff / prevTotal) * 100;

    return [
      {
        id: 'total',
        name: '총 매출 합계',
        count: currentMonthRecords.length,
        amount: currentTotal,
        diff: totalDiff,
        diffPercent: totalDiffPercent,
        share: 100,
        isTotal: true
      },
      ...mappedData
    ];
  }, [currentMonthRecords, prevMonthRecords, categories]);

  const totalRevenue = currentMonthRecords.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-8">
      {/* Top Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="카테고리별 매출 비중" icon={null}>
          <div className="h-[300px] w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString()}원`}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-bold">
                데이터가 없습니다.
              </div>
            )}
          </div>
          {categoryChartData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-[10px] font-black text-gray-600 dark:text-gray-400">
                    {entry.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="시간대별 매출 현황" icon={null}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 10000).toLocaleString()}만`}
                />
                <Tooltip
                  formatter={(value: number) => `${value.toLocaleString()}원`}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detail Table */}
      <Card title="매출 상세 리포트" icon={null}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-widest bg-slate-50/30 dark:bg-slate-900/30">
                <th className="px-6 py-4">카테고리</th>
                <th className="px-6 py-4 text-right">거래수</th>
                <th className="px-6 py-4 text-right bg-slate-100/50 dark:bg-slate-800/50">
                  매출금액
                </th>
                <th className="px-6 py-4 text-right">전월 대비 증감(%)</th>
                <th className="px-6 py-4 text-right w-[150px]">비중(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {tableData.map(row => (
                <tr
                  key={row.id}
                  className={`group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                    row.isTotal
                      ? 'bg-slate-50 dark:bg-slate-900/80 font-black border-y border-slate-200 dark:border-slate-700'
                      : ''
                  }`}>
                  <td className="px-6 py-4 font-black text-sm text-gray-900 dark:text-gray-100">
                    <span
                      className={
                        row.isTotal
                          ? 'text-lg underline decoration-blue-500/20 underline-offset-4'
                          : 'text-slate-700 dark:text-slate-300'
                      }>
                      {row.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-sm text-slate-500 dark:text-slate-400">
                    {row.count === 0 ? '-' : `${row.count.toLocaleString()}건`}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-black bg-slate-100/30 dark:bg-slate-800/30 ${
                      row.isTotal
                        ? 'text-blue-600 dark:text-blue-400 text-lg underline underline-offset-4 decoration-blue-500/30'
                        : 'text-sm text-blue-500'
                    }`}>
                    {row.amount === 0 ? '-' : `${row.amount.toLocaleString()}원`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className={`flex items-center justify-end gap-1 text-[11px] font-black ${
                        row.diff > 0
                          ? 'text-emerald-500'
                          : row.diff < 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                      }`}>
                      {row.diff !== 0 && (
                        <>
                          {row.diff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                          <span>{Math.abs(row.diffPercent).toFixed(1)}%</span>
                        </>
                      )}
                      {row.diff === 0 && <Minus size={14} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative p-0 overflow-hidden">
                    {/* Bar Fill for Share */}
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out z-0 ${
                        row.isTotal
                          ? 'bg-blue-500/50 dark:bg-blue-300/40'
                          : 'bg-blue-500/70 dark:bg-blue-400/50'
                      }`}
                      style={{ width: `${Math.min(100, row.share)}%` }}
                    />
                    <span
                      className={`relative z-10 px-6 py-4 block text-xs font-black ${
                        row.isTotal ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                      }`}>
                      {row.share.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {tableData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                    이번 달 매출 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
