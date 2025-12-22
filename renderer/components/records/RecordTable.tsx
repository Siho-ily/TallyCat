'use client';

import React from 'react';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { Record, Category } from '../../types';

interface RecordTableProps {
  records: Record[];
  categories: Category[];
  onRecordClick: (record: Record) => void;
  netProfit?: number;
  showFooter?: boolean;
}

export default function RecordTable({
  records,
  categories,
  onRecordClick,
  netProfit = 0,
  showFooter = true
}: RecordTableProps) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-xl animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/30 text-gray-400 text-[10px] uppercase font-black tracking-[0.1em]">
              <th className="px-6 py-5">날짜 / 시간</th>
              <th className="px-6 py-5">유형</th>
              <th className="px-6 py-5">카테고리</th>
              <th className="px-6 py-5 text-right">금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {records.map(record => (
              <tr
                key={record.id}
                onClick={() => onRecordClick(record)}
                className="hover:bg-gray-800/20 group transition-all cursor-pointer">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-200">{record.date.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {record.date.split(' ')[1]}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge type={record.type} />
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-300">
                  {categories.find(c => c.id === record.category_id)?.name || '기타'}
                </td>
                <td
                  className={`px-6 py-4 text-right font-black text-sm ${
                    record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                  {record.type === 'income' ? '+' : '-'}
                  {record.amount.toLocaleString()}원
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
          {showFooter && records.length > 0 && (
            <tfoot className="bg-gray-800/50 border-t border-gray-700">
              <tr>
                <td colSpan={2} className="px-6 py-4">
                  <div className="flex gap-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        페이지 내 매출
                      </span>
                      <span className="text-xs font-black text-emerald-400">
                        +
                        {records
                          .filter(r => r.type === 'income')
                          .reduce((s, r) => s + r.amount, 0)
                          .toLocaleString()}
                        원
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        페이지 내 매입
                      </span>
                      <span className="text-xs font-black text-rose-400">
                        -
                        {records
                          .filter(r => r.type === 'expense')
                          .reduce((s, r) => s + r.amount, 0)
                          .toLocaleString()}
                        원
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right" colSpan={2}>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      필터링 전체 합계 (순이익)
                    </span>
                    <span
                      className={`text-lg font-black ${
                        netProfit >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                      {netProfit >= 0 ? '+' : ''}
                      {netProfit.toLocaleString()}원
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
