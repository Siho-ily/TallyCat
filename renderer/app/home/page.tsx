'use client';

import React, { useState } from 'react';
import {
  PlusCircle,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Search
} from 'lucide-react';
import { DateTime } from 'luxon';

import StatCard from '../../components/ui/StatCard';
import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import RecordTable from '../../components/records/RecordTable';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui/InputControls';

export default function HomePage() {
  const { records, categories, loading, refreshData } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);

  const now = DateTime.now();
  const currentMonthRecords = records.filter(r => {
    const recordDate = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
    return recordDate.month === now.month && recordDate.year === now.year;
  });

  const monthlyIncome = currentMonthRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyExpense = currentMonthRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const recentRecords = [...records]
    .sort(
      (a, b) =>
        DateTime.fromFormat(b.date, 'yyyy-MM-dd HH:mm:ss').toMillis() -
        DateTime.fromFormat(a.date, 'yyyy-MM-dd HH:mm:ss').toMillis()
    )
    .slice(0, 5);

  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader
        title="매장 현황판"
        description="현재 매장의 수입 및 지출 현황을 실시간으로 확인하세요."
        actions={
          <Button onClick={openAddForm} icon={<PlusCircle size={20} />}>
            내역 등록
          </Button>
        }
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="이번 달 총 매출"
          value={`${monthlyIncome.toLocaleString()}원`}
          icon={<ArrowUpRight size={24} />}
          trend={{ value: 12, isUp: true }}
          color="emerald"
        />
        <StatCard
          title="이번 달 총 매입"
          value={`${monthlyExpense.toLocaleString()}원`}
          icon={<ArrowDownRight size={24} />}
          trend={{ value: 5, isUp: false }}
          color="rose"
        />
        <StatCard
          title="현재 예상 수익"
          value={`${(monthlyIncome - monthlyExpense).toLocaleString()}원`}
          icon={<Layers size={24} />}
          color="blue"
        />
      </div>

      {/* Recent Records Section */}
      <Card
        title="최근 거래 요약"
        icon={<CalendarIcon size={20} className="text-gray-400" />}
        noPadding>
        <RecordTable
          records={recentRecords}
          categories={categories}
          onRecordClick={r => {
            setSelectedRecord(r);
            setIsDetailOpen(true);
          }}
          showFooter={false}
        />
      </Card>

      {/* Modals */}
      <RecordFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingRecord={editingRecord}
        onSuccess={refreshData}
      />

      <RecordDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        record={selectedRecord}
        onEdit={handleEdit}
        onDeleteSuccess={refreshData}
      />
    </div>
  );
}
