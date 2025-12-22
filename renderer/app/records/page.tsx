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
import { Button } from '../../components/ui/InputControls';

export default function RecordsPage() {
  const { records, categories, loading, refreshData } = useData();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [startDate, setStartDate] = useState(DateTime.now().startOf('month').toISODate() || '');
  const [endDate, setEndDate] = useState(DateTime.now().endOf('month').toISODate() || '');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);

  const currentMonth = DateTime.fromISO(startDate).startOf('month');

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

    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterCategory !== 'all') result = result.filter(r => r.category_id === filterCategory);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
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

    const start = DateTime.fromISO(startDate).startOf('day');
    const end = DateTime.fromISO(endDate).endOf('day');

    result = result.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= start && d <= end;
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, filterType, filterCategory, searchTerm, startDate, endDate, categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory, searchTerm, startDate, endDate, viewMode]);

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
    setStartDate(DateTime.now().startOf('month').toISODate() || '');
    setEndDate(DateTime.now().endOf('month').toISODate() || '');
    setFilterType('all');
    setFilterCategory('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      await (window as any).ipc.invoke('export-data', 'xlsx');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

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
        description="기간별 거래 내역을 상세히 조회하고 관리할 수 있습니다."
        actions={
          <Button onClick={() => handleOpenAddModal()} icon={<PlusCircle size={18} />}>
            내역 추가
          </Button>
        }
      />

      <RecordFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        totalIncome={totals.income}
        totalExpense={totals.expense}
        onExport={handleExport}
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
