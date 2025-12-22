'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { useData } from '../../context/DataContext';
import StatCard from '../../components/ui/StatCard';
import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import PageHeader from '../../components/ui/PageHeader';
import RecordTable from '../../components/records/RecordTable';

export default function HomePage() {
  const { records, categories, settings, storage, refreshData } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const stats = useMemo(() => {
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
      profit: income - expense
    };
  }, [records]);

  const recentRecords = useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [records]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <PageHeader
        title="매장 현황판"
        description="Sales Dashboard Overview"
        actions={
          <button
            onClick={() => {
              setEditingRecord(null);
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-3 transform active:scale-95 group">
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            신규 내역 등록
          </button>
        }
      />

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
        <StatCard
          title="이번 달 총 매출"
          value={stats.income}
          icon={TrendingUp}
          color="text-emerald-400"
          bg="bg-emerald-500/5"
          border="border-emerald-500/10"
        />
        <StatCard
          title="이번 달 총 지출"
          value={stats.expense}
          icon={TrendingDown}
          color="text-rose-400"
          bg="bg-rose-500/5"
          border="border-rose-500/10"
        />
        <StatCard
          title="이번 달 영업 이익"
          value={stats.profit}
          icon={Wallet}
          color="text-blue-400"
          bg="bg-blue-500/5"
          border="border-blue-500/10"
        />
      </div>

      {/* Recent Records Summary */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-xl font-bold">최근 등록 내역</h3>
          <Link href="/records" className="text-xs font-bold text-blue-400 hover:underline">
            전체 보기
          </Link>
        </div>
        <RecordTable
          records={recentRecords}
          categories={categories}
          onRecordClick={record => {
            setSelectedRecord(record);
            setIsDetailModalOpen(true);
          }}
          showFooter={false}
        />
      </div>

      {/* Modals */}
      <RecordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        record={selectedRecord}
        onEdit={record => {
          setIsDetailModalOpen(false);
          setEditingRecord(record);
          setIsModalOpen(true);
        }}
        onDeleteSuccess={refreshData}
      />

      <RecordFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        editingRecord={editingRecord}
        onSuccess={refreshData}
      />
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
