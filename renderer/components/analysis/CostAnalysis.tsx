'use client';

import React, { useMemo } from 'react';
import { DateTime } from 'luxon';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Record, Category } from '../../types';
import Card from '../ui/Card';

interface CostAnalysisProps {
  records: Record[];
  categories: Category[];
  targetMonth: DateTime;
}

const COST_COLORS = ['#fbbf24', '#f87171']; // Amber for Purchase, Rose for Spending

export default function CostAnalysis({ records, categories, targetMonth }: CostAnalysisProps) {
  const currentMonthSummary = useMemo(() => {
    const monthRecords = records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d.year === targetMonth.year && d.month === targetMonth.month;
    });

    const purchase = monthRecords
      .filter(r => r.type === 'purchase')
      .reduce((s, r) => s + r.amount, 0);
    const spending = monthRecords
      .filter(r => r.type === 'spending')
      .reduce((s, r) => s + r.amount, 0);
    const total = purchase + spending;

    return { total, purchase, spending };
  }, [records, targetMonth]);

  const prevMonthSummary = useMemo(() => {
    const prev = targetMonth.minus({ months: 1 });
    const monthRecords = records.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d.year === prev.year && d.month === prev.month;
    });

    const purchase = monthRecords
      .filter(r => r.type === 'purchase')
      .reduce((s, r) => s + r.amount, 0);
    const spending = monthRecords
      .filter(r => r.type === 'spending')
      .reduce((s, r) => s + r.amount, 0);
    const total = purchase + spending;

    return { total, purchase, spending };
  }, [records, targetMonth]);

  // Chart Data: Purchase vs Spending
  const costPieData = useMemo(
    () =>
      [
        { name: '매입 (물품 구입)', value: currentMonthSummary.purchase },
        { name: '지출 (운영 비용)', value: currentMonthSummary.spending }
      ].filter(d => d.value > 0),
    [currentMonthSummary]
  );

  // Table Data
  const tableData = [
    {
      id: 'total',
      name: '총 비용 합계',
      current: currentMonthSummary.total,
      prev: prevMonthSummary.total,
      isTotal: true
    },
    {
      id: 'purchase',
      name: '매입 (재료/물품 구입)',
      current: currentMonthSummary.purchase,
      prev: prevMonthSummary.purchase,
      isTotal: false
    },
    {
      id: 'spending',
      name: '지출 (임대료/공과금 등)',
      current: currentMonthSummary.spending,
      prev: prevMonthSummary.spending,
      isTotal: false
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Chart */}
      <Card title="비용 비중 분석 (매입 vs 지출)" icon={null}>
        <div className="h-[350px] w-full max-w-2xl mx-auto">
          {costPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {costPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />
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
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic font-bold">
              이번 달 등록된 비용 내역이 없습니다.
            </div>
          )}
        </div>
      </Card>

      {/* Detail Table */}
      <Card title="비용 리포트 상세" icon={null}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                <th className="px-6 py-4">구분</th>
                <th className="px-6 py-4 text-right">전월 비용</th>
                <th className="px-6 py-4 text-right">당월 비용</th>
                <th className="px-6 py-4 text-right">전월 대비 증감</th>
                <th className="px-6 py-4 text-right">비중</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
              {tableData.map(row => {
                const diff = row.current - row.prev;
                const share =
                  currentMonthSummary.total === 0
                    ? 0
                    : (row.current / currentMonthSummary.total) * 100;

                return (
                  <tr
                    key={row.id}
                    className={`group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all ${
                      row.isTotal
                        ? 'bg-gray-50/50 dark:bg-gray-900/30 ring-1 ring-inset ring-gray-100 dark:ring-gray-800'
                        : ''
                    }`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {!row.isTotal && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.id === 'purchase' ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                          />
                        )}
                        <span
                          className={`text-sm font-black ${
                            row.isTotal
                              ? 'text-gray-900 dark:text-white underline decoration-gray-200 dark:decoration-gray-700 underline-offset-4'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-sm text-gray-500">
                      {row.prev.toLocaleString()}원
                    </td>
                    <td
                      className={`px-6 py-5 text-right font-black text-sm ${
                        row.isTotal
                          ? 'text-gray-950 dark:text-white text-base'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}>
                      {row.current.toLocaleString()}원
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div
                        className={`flex items-center justify-end gap-1 text-[11px] font-black ${
                          diff > 0
                            ? 'text-rose-500'
                            : diff < 0
                            ? 'text-emerald-500'
                            : 'text-gray-400'
                        }`}>
                        {diff > 0 ? (
                          <ArrowUpRight size={14} />
                        ) : diff < 0 ? (
                          <ArrowDownRight size={14} />
                        ) : (
                          <Minus size={14} />
                        )}
                        <span>{Math.abs(diff).toLocaleString()}원</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-xs font-black text-gray-500">
                        {row.isTotal ? '100%' : `${share.toFixed(1)}%`}
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
