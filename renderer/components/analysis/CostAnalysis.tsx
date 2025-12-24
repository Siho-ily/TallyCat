'use client';

import React, { useMemo } from 'react';
import { DateTime } from 'luxon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Record, Category } from '../../types';
import Card from '../ui/Card';

import { getMonthWeekRange, moveMonthWeek } from '../../lib/dateUtils';

interface CostAnalysisProps {
  records: Record[];
  categories: Category[];
  targetDate: DateTime;
  period: 'week' | 'month';
}

const COST_COLORS = ['#fbbf24', '#f87171']; // Amber for Purchase, Rose for Spending

interface HierarchicalRow {
  id: string;
  name: string;
  prev: number;
  current: number;
  type: 'total' | 'group' | 'item';
  costType?: 'purchase' | 'spending';
  isUnassigned?: boolean;
}

// Custom Tooltip for Premium Look and High Visibility
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        {label && (
          <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
            {label}
          </p>
        )}
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color || entry.fill || entry.payload?.fill }}
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

export default function CostAnalysis({
  records,
  categories,
  targetDate,
  period
}: CostAnalysisProps) {
  const currentRange = useMemo(() => {
    if (period === 'month') {
      return { start: targetDate.startOf('month'), end: targetDate.endOf('month') };
    }
    return getMonthWeekRange(targetDate);
  }, [targetDate, period]);

  const prevRange = useMemo(() => {
    if (period === 'month') {
      const prev = targetDate.minus({ months: 1 });
      return { start: prev.startOf('month'), end: prev.endOf('month') };
    }
    return getMonthWeekRange(moveMonthWeek(targetDate, -1));
  }, [targetDate, period]);

  const currentPeriodSummary = useMemo(() => {
    const periodRecords = records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= currentRange.start.startOf('day') && d <= currentRange.end.endOf('day');
    });

    return {
      total: periodRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0),
      purchase: periodRecords.filter(r => r.type === 'purchase').reduce((s, r) => s + r.amount, 0),
      spending: periodRecords.filter(r => r.type === 'spending').reduce((s, r) => s + r.amount, 0),
      records: periodRecords
    };
  }, [records, currentRange]);

  const prevPeriodSummary = useMemo(() => {
    const periodRecords = records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= prevRange.start.startOf('day') && d <= prevRange.end.endOf('day');
    });

    return {
      total: periodRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0),
      purchase: periodRecords.filter(r => r.type === 'purchase').reduce((s, r) => s + r.amount, 0),
      spending: periodRecords.filter(r => r.type === 'spending').reduce((s, r) => s + r.amount, 0),
      records: periodRecords
    };
  }, [records, prevRange]);

  // Hierarchical Table Data Construction
  const tableData = useMemo(() => {
    const rows: HierarchicalRow[] = [];

    // 1. Total Row
    rows.push({
      id: 'total',
      name: `${period === 'week' ? '주간' : '월간'} 합계`,
      prev: prevPeriodSummary.total,
      current: currentPeriodSummary.total,
      type: 'total'
    });

    const buildGroupRows = (type: 'purchase' | 'spending', name: string) => {
      const typeCategories = categories.filter(c => c.type === type);
      const catIdsInType = new Set(typeCategories.map(c => c.id));

      const currentTypeRecords = currentPeriodSummary.records.filter(r => r.type === type);
      const prevTypeRecords = prevPeriodSummary.records.filter(r => r.type === type);

      const groupCurrent = currentTypeRecords.reduce((s, r) => s + r.amount, 0);
      const groupPrev = prevTypeRecords.reduce((s, r) => s + r.amount, 0);

      // Group Header
      rows.push({
        id: `group-${type}`,
        name: name,
        prev: groupPrev,
        current: groupCurrent,
        type: 'group',
        costType: type
      });

      // Category Items
      typeCategories
        .filter(cat => cat.is_active !== false)
        .forEach(cat => {
          const currentAmount = currentTypeRecords
            .filter(r => r.category_id === cat.id)
            .reduce((s, r) => s + r.amount, 0);
          const prevAmount = prevTypeRecords
            .filter(r => r.category_id === cat.id)
            .reduce((s, r) => s + r.amount, 0);

          if (currentAmount > 0 || prevAmount > 0) {
            rows.push({
              id: cat.id,
              name: cat.name,
              prev: prevAmount,
              current: currentAmount,
              type: 'item',
              costType: type
            });
          }
        });

      // Unassigned in Group
      const currentUnassigned = currentTypeRecords
        .filter(r => !catIdsInType.has(r.category_id))
        .reduce((s, r) => s + r.amount, 0);
      const prevUnassigned = prevTypeRecords
        .filter(r => !catIdsInType.has(r.category_id))
        .reduce((s, r) => s + r.amount, 0);

      if (currentUnassigned > 0 || prevUnassigned > 0) {
        rows.push({
          id: `unassigned-${type}`,
          name: '미지정',
          prev: prevUnassigned,
          current: currentUnassigned,
          type: 'item',
          costType: type,
          isUnassigned: true
        });
      }
    };

    buildGroupRows('purchase', '매입');
    buildGroupRows('spending', '지출');

    return rows;
  }, [currentPeriodSummary, prevPeriodSummary, categories, period]);

  // Chart Data: Purchase vs Spending
  const costPieData = useMemo(
    () =>
      [
        { name: '매입', value: currentPeriodSummary.purchase },
        { name: '지출', value: currentPeriodSummary.spending }
      ].filter(d => d.value > 0),
    [currentPeriodSummary]
  );

  return (
    <div className="space-y-8">
      {/* Top Chart */}
      <Card title={`${period === 'week' ? '주간' : '월간'} 비용 비중 분석`} icon={null}>
        <div className="h-[350px] w-full max-w-2xl mx-auto relative">
          {costPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={8}
                    dataKey="value">
                    {costPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Labels */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-10px]">
                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">
                  총비용
                </span>
                <span className="text-2xl font-black text-rose-500">
                  {currentPeriodSummary.total.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-bold">
              {period === 'week' ? '이번 주' : '이번 달'} 등록된 비용 내역이 없습니다.
            </div>
          )}
        </div>
      </Card>

      {/* Detail Table */}
      <Card title={`${period === 'week' ? '주간' : '월간'} 비용 리포트 상세`} icon={null}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 tracking-widest bg-slate-50/30 dark:bg-slate-900/30">
                <th className="px-6 py-4 min-w-[150px]">구분</th>
                <th className="px-6 py-4 text-right">이전{period === 'week' ? '주' : '월'}비용</th>
                <th className="px-6 py-4 text-right bg-slate-100/50 dark:bg-slate-800/50">
                  현재{period === 'week' ? '주' : '월'}비용
                </th>
                <th className="px-6 py-4 text-right">이전대비증감(%)</th>
                <th className="px-6 py-4 text-right w-[150px]">비중(%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {tableData.map(row => {
                const diff = row.current - row.prev;
                const diffPercent = row.prev === 0 ? 0 : (diff / row.prev) * 100;

                // Share calculation
                let share = 0;
                if (row.type === 'total') {
                  share = 100;
                } else if (row.type === 'group') {
                  share =
                    currentPeriodSummary.total === 0
                      ? 0
                      : (row.current / currentPeriodSummary.total) * 100;
                } else if (row.type === 'item') {
                  const parentTotal =
                    row.costType === 'purchase'
                      ? currentPeriodSummary.purchase
                      : currentPeriodSummary.spending;
                  share = parentTotal === 0 ? 0 : (row.current / parentTotal) * 100;
                }

                const isTotal = row.type === 'total';
                const isGroup = row.type === 'group';
                const isItem = row.type === 'item';

                return (
                  <tr
                    key={row.id}
                    className={`transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${
                      isTotal
                        ? 'bg-slate-50 dark:bg-slate-900/80 font-black border-y border-slate-200 dark:border-slate-700'
                        : ''
                    } ${isGroup ? 'bg-white dark:bg-gray-950 font-bold' : ''}`}>
                    <td className={`px-6 py-4`}>
                      <div
                        className={`flex items-center gap-2 ${
                          isItem ? 'pl-8 text-slate-500 dark:text-slate-400' : ''
                        }`}>
                        {isGroup && (
                          <div
                            className={`w-1.5 h-3 rounded-sm ${
                              row.costType === 'purchase'
                                ? 'bg-amber-500 dark:bg-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : 'bg-rose-500 dark:bg-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                            }`}
                          />
                        )}
                        <span
                          className={`text-sm ${
                            isTotal ? 'text-lg text-slate-900 dark:text-slate-100' : ''
                          } ${isItem ? 'text-xs' : ''}`}>
                          {row.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm ${
                          row.prev === 0
                            ? 'text-slate-300 dark:text-slate-700'
                            : 'text-slate-600 dark:text-slate-400 font-bold'
                        }`}>
                        {row.prev === 0 ? '-' : row.prev.toLocaleString()}
                      </span>
                    </td>

                    <td
                      className={`px-6 py-4 text-right bg-slate-100/30 dark:bg-slate-800/30 font-black ${
                        isTotal
                          ? 'text-blue-600 dark:text-blue-400 text-lg underline underline-offset-4 decoration-blue-500/30'
                          : 'text-slate-900 dark:text-slate-100 text-sm'
                      }`}>
                      {row.current === 0 ? '-' : row.current.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 text-[11px] font-black ${
                          diff > 0
                            ? 'text-rose-500'
                            : diff < 0
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        }`}>
                        {diff !== 0 && (
                          <>
                            {diff > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{Math.abs(diffPercent).toFixed(1)}%</span>
                          </>
                        )}
                        {diff === 0 && <Minus size={14} />}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right relative p-0 overflow-hidden">
                      {/* Bar Fill for Share */}
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out z-0 ${
                          isTotal
                            ? 'bg-blue-500/50 dark:bg-blue-300'
                            : row.costType === 'purchase' || row.id.includes('purchase')
                            ? 'bg-amber-500/70 dark:bg-amber-400'
                            : 'bg-rose-500/70 dark:bg-rose-400'
                        }`}
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                      <span
                        className={`relative z-10 px-6 py-4 block text-xs font-black text-dark dark:text-white`}>
                        {share.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
