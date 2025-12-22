'use client';

import React, { useEffect, useState } from 'react';
import { PlusCircle, List, Calendar as CalendarIcon } from 'lucide-react';
import { DateTime } from 'luxon';

import { useData } from '../../context/DataContext';
import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import PageHeader from '../../components/ui/PageHeader';
import RecordFilterBar from '../../components/records/RecordFilterBar';
import RecordTable from '../../components/records/RecordTable';
import CalendarView from '../../components/records/CalendarView';
import Pagination from '../../components/ui/Pagination';

export default function RecordsPage() {
  const { records, categories, loading, refreshData } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(DateTime.now().startOf('month'));
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

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

  const filteredRecords = React.useMemo(() => {
    let result = [...records];

    if (typeFilter !== 'all') result = result.filter(r => r.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter(r => r.category_id === categoryFilter);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        r =>
          (r.note && r.note.toLowerCase().includes(q)) ||
          r.amount.toString().includes(q) ||
          categories
            .find(c => c.id === r.category_id)
            ?.name.toLowerCase()
            .includes(q)
      );
    }

    const now = DateTime.now();

    if (viewMode === 'calendar') {
      result = result.filter(
        r =>
          DateTime.fromISO(r.date.replace(' ', 'T')).month === currentMonth.month &&
          DateTime.fromISO(r.date.replace(' ', 'T')).year === currentMonth.year
      );
    } else {
      if (period === 'day')
        result = result.filter(r => DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'day'));
      else if (period === 'week')
        result = result.filter(r =>
          DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'week')
        );
      else if (period === 'month')
        result = result.filter(r =>
          DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'month')
        );
      else if (period === 'year')
        result = result.filter(r =>
          DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'year')
        );
    }

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [
    records,
    typeFilter,
    categoryFilter,
    searchQuery,
    period,
    viewMode,
    currentMonth,
    categories
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, categoryFilter, searchQuery, period, viewMode, currentMonth]);

  const paginatedRecords = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);

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

  const netProfit = totals.income - totals.expense;

  const calendarDays = React.useMemo(() => {
    const firstDay = currentMonth.startOf('month');
    const start = firstDay.minus({ days: firstDay.weekday % 7 });
    const lastDay = currentMonth.endOf('month');
    const end = lastDay.plus({ days: 6 - (lastDay.weekday % 7) });
    const days = [];
    let curr = start;
    while (curr <= end) {
      const dayStr = curr.toFormat('yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date.startsWith(dayStr));
      const income = dayRecords.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = dayRecords
        .filter(r => r.type === 'expense')
        .reduce((s, r) => s + r.amount, 0);

      days.push({
        date: curr,
        isCurrentMonth: curr.month === currentMonth.month,
        income,
        expense,
        profit: income - expense
      });
      curr = curr.plus({ days: 1 });
    }
    return days;
  }, [currentMonth, records]);

  const handleResetFilters = () => {
    setPeriod('month');
    setTypeFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
    setCurrentMonth(DateTime.now().startOf('month'));
  };

  if (loading) return <div className="text-blue-400 animate-pulse">데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader
        title="매출/매입 내역"
        actions={
          <>
            <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-xl scale-90 shadow-inner">
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
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                <CalendarIcon size={18} />
              </button>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg transform hover:scale-105 active:scale-95">
              <PlusCircle size={18} /> 내역 추가
            </button>
          </>
        }
      />

      <RecordFilterBar
        viewMode={viewMode}
        period={period}
        setPeriod={setPeriod}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        handleResetFilters={handleResetFilters}
      />

      {viewMode === 'list' ? (
        <>
          <RecordTable
            records={paginatedRecords}
            categories={categories}
            onRecordClick={record => {
              setSelectedRecord(record);
              setIsDetailModalOpen(true);
            }}
            netProfit={netProfit}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
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
