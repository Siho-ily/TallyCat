'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, List, Calendar as CalendarIcon } from 'lucide-react';
import { DateTime } from 'luxon';

import { useData } from '../../context/DataContext';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useRecordFilters } from '../../hooks/useRecordFilters';
import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import PageHeader from '../../components/ui/PageHeader';
import RecordFilterBar from '../../components/records/RecordFilterBar';
import RecordTable from '../../components/records/RecordTable';
import CalendarView from '../../components/records/CalendarView';
import { Button } from '../../components/ui/InputControls';

export default function RecordsPage() {
  const { records, categories, paymentMethods, loading, refreshData } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filtering states
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [filterType, setFilterType] = useState<'all' | 'income' | 'purchase' | 'spending'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const handleOpenAddModal = (date?: DateTime) => {
    setEditingRecord(null);
    setSelectedRecord(null);
    setInitialData({
      type: 'income',
      date: (date || DateTime.now()).toFormat('yyyy-MM-dd HH:mm:ss')
    });
    setIsModalOpen(true);
  };

  const filteredRecords = useRecordFilters({
    records,
    categories,
    filterType,
    filterCategory,
    filterPaymentMethod,
    searchTerm,
    currentDate,
    period
  });

  useEffect(() => {
    // Reset any view state if needed
  }, [filterType, filterCategory, filterPaymentMethod, searchTerm, currentDate, period, viewMode]);

  const totals = React.useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        if (record.type === 'income') acc.income += record.amount;
        else acc.expense += record.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredRecords]);

  const globalTotals = React.useMemo(() => {
    return records.reduce(
      (acc, record) => {
        if (record.type === 'income') acc.income += record.amount;
        else acc.expense += record.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [records]);

  const calendarDays = React.useMemo(() => {
    // For calendar, always show the full month of the current focus date
    const firstDay = currentDate.startOf('month');
    const start = firstDay.minus({ days: firstDay.weekday % 7 });
    const lastDay = currentDate.endOf('month');
    const end = lastDay.plus({ days: 6 - (lastDay.weekday % 7) });
    const days = [];
    let curr = start;
    while (curr <= end) {
      const dayStr = curr.toFormat('yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date.startsWith(dayStr));
      const income = dayRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = dayRecords
        .filter(r => r.type === 'purchase' || r.type === 'spending')
        .reduce((s, r) => s + r.amount, 0);

      days.push({
        date: curr,
        isCurrentMonth: curr.month === currentDate.month,
        income,
        expense,
        profit: income - expense
      });
      curr = curr.plus({ days: 1 });
    }
    return days;
  }, [currentDate, records]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader
        title="매출/매입 내역"
        description={
          period === 'month'
            ? `${currentDate.toFormat('yyyy년 MM월')} 매장 거래 내역입니다.`
            : `${currentDate.toFormat('yyyy년 MM월 dd일')} 상세 내역입니다.`
        }
        actions={
          <>
            <div className="flex bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1 rounded-xl scale-90 shadow-inner">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                <List size={18} />
              </button>
              <button
                onClick={() => {
                  setViewMode('calendar');
                  setPeriod('month'); // Always month for calendar
                }}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                <CalendarIcon size={18} />
              </button>
            </div>
            <Button onClick={() => handleOpenAddModal()} icon={<PlusCircle size={18} />}>
              내역 추가
            </Button>
          </>
        }
      />

      <RecordFilterBar
        period={period}
        setPeriod={setPeriod}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterPaymentMethod={filterPaymentMethod}
        setFilterPaymentMethod={setFilterPaymentMethod}
        categories={categories}
        paymentMethods={paymentMethods}
        globalIncome={globalTotals.income}
        globalExpense={globalTotals.expense}
      />

      {viewMode === 'list' ? (
        <RecordTable
          records={filteredRecords}
          categories={categories}
          paymentMethods={paymentMethods}
          period={period}
          onRecordClick={record => {
            setSelectedRecord(record);
            setIsDetailModalOpen(true);
          }}
          totalIncome={totals.income}
          totalExpense={totals.expense}
        />
      ) : (
        <CalendarView calendarDays={calendarDays} onDayClick={handleOpenAddModal} />
      )}

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
          setInitialData(null);
        }}
        editingRecord={editingRecord}
        initialData={initialData}
        onSuccess={refreshData}
      />
    </div>
  );
}
