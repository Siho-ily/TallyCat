'use client';

import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { DateTime } from 'luxon';

import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/InputControls';

// Refactored Components
import StatsSection from '../../components/home/StatsSection';
import RecentRecordsSection from '../../components/home/RecentRecordsSection';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
      <StatsSection monthlyIncome={monthlyIncome} monthlyExpense={monthlyExpense} />

      {/* Recent Records Section */}
      <RecentRecordsSection
        records={recentRecords}
        categories={categories}
        onRecordClick={r => {
          setSelectedRecord(r);
          setIsDetailOpen(true);
        }}
      />

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
