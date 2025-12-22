'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  PlusCircle,
  Clock,
  ArrowDownRight,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Record, Category, Settings, StorageInfo } from '../../types';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { useData } from '../../context/DataContext';

export default function HomePage() {
  const { records, categories, settings, storage, loading } = useData();

  const stats = React.useMemo(() => {
    const now = DateTime.now();
    const thisMonthRecords = records.filter(
      r =>
        DateTime.fromISO(r.date.replace(' ', 'T')).month === now.month &&
        DateTime.fromISO(r.date.replace(' ', 'T')).year === now.year
    );

    const income = thisMonthRecords
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const expense = thisMonthRecords
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      income,
      expense,
      profit: income - expense,
      percentChange: 0
    };
  }, [records]);

  const chartData = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toFormat('MM/dd');
      const dailyRecords = records.filter(
        r => DateTime.fromISO(r.date.replace(' ', 'T')).toFormat('MM/dd') === date
      );
      const income = dailyRecords
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0);
      const expense = dailyRecords
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0);
      days.push({ name: date, income, expense });
    }
    return days;
  }, [records]);

  // Use Skeleton UI instead of full-screen loader
  const SkeletonCard = () => (
    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl animate-pulse space-y-4">
      <div className="w-12 h-12 bg-gray-800 rounded-2xl" />
      <div className="space-y-2">
        <div className="w-20 h-3 bg-gray-800 rounded" />
        <div className="w-32 h-6 bg-gray-800 rounded" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white">이번 달 현황</h2>
          <p className="text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={14} /> {DateTime.now().toFormat('yyyy년 L월 dd일 HH:mm')} 기준
          </p>
        </div>
        <Link
          href="/records"
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20">
          <PlusCircle size={20} /> 새 내역 등록
        </Link>
      </div>

      {/* Backup Path Warning Banner */}
      {settings && (!settings.main_backup_path || !settings.sub_backup_path) && (
        <Link href="/settings" className="block mb-8 group">
          <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-6 group-hover:bg-rose-500/20 transition-all animate-pulse">
            <div className="p-4 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/40">
              <AlertTriangle className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-white">백업 경로가 지정되지 않았습니다!</h4>
              <p className="text-rose-400 text-sm font-bold">
                데이터 보호를 위해 설정에서 백업 저장 경로를 지정해 주세요. 클릭하여 이동합니다.
              </p>
            </div>
            <div className="text-rose-500 font-black text-sm group-hover:translate-x-1 transition-transform">
              지금 설정하러 가기 →
            </div>
          </div>
        </Link>
      )}

      {storage?.limitReached && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 text-red-400">
          <AlertCircle className="shrink-0" />
          <div>
            <p className="font-bold">백업 용량 경고</p>
            <p className="text-sm opacity-80">
              현재 데이터 용량이 설정된 제한을 초과했거나 근접했습니다. 주기적인 백업이 필요합니다.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="총 매출"
              value={stats.income}
              icon={TrendingUp}
              color="text-emerald-400"
              bg="bg-emerald-500/10"
              border="border-emerald-500/20"
            />
            <StatCard
              title="총 지출"
              value={stats.expense}
              icon={TrendingDown}
              color="text-rose-400"
              bg="bg-rose-500/10"
              border="border-rose-500/20"
            />
            <StatCard
              title="순이익"
              value={stats.profit}
              icon={Wallet}
              color="text-blue-400"
              bg="bg-blue-500/10"
              border="border-blue-500/20"
            />
          </>
        )}
      </div>

      {/* Recent Records Summary */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
          <h3 className="text-xl font-bold">최근 등록 내역</h3>
          <Link href="/records" className="text-xs font-bold text-blue-400 hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/30 text-gray-400 text-[10px] uppercase font-black">
                <th className="px-6 py-4">일시</th>
                <th className="px-6 py-4">유형</th>
                <th className="px-6 py-4">카테고리</th>
                <th className="px-6 py-4 text-right">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {records.slice(0, 5).map(record => (
                <tr key={record.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-400">
                    {DateTime.fromISO(record.date.replace(' ', 'T')).toFormat('MM/dd HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        record.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                      {record.type === 'income' ? '매출' : '매입'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {categories.find(c => c.id === record.category_id)?.name || '기타'}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-black text-sm ${
                      record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                    {record.amount.toLocaleString()}원
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500 text-sm">
                    등록된 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <div
      className={`p-6 rounded-3xl border ${border} ${bg} shadow-sm transition-all hover:translate-y-[-4px]`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} border ${border}`}>
          <Icon className={color} size={24} />
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live</div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400">{title}</p>
        <p className={`text-2xl font-black ${color} mt-1`}>{value.toLocaleString()}원</p>
      </div>
    </div>
  );
}

function StorageItem({ label, value, sub }: any) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-xs font-bold text-gray-300">{label}</p>
        <p className="text-[10px] text-gray-500">{sub}</p>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}
