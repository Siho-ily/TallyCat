'use client';

import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  List,
  Calendar as CalendarIcon,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ArrowUp
} from 'lucide-react';
import { DateTime } from 'luxon';

import { useData } from '../../context/DataContext';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useRecordFilters } from '../../hooks/useRecordFilters';
import { getMonthWeekRange } from '../../lib/dateUtils';
import RecordFormModal from '../../components/ui/RecordFormModal';
import RecordDetailModal from '../../components/ui/RecordDetailModal';
import PageHeader from '../../components/ui/PageHeader';
import RecordFilterBar from '../../components/records/RecordFilterBar';
import RecordTable from '../../components/records/RecordTable';
import CalendarView from '../../components/records/CalendarView';
import WeeklySummaryView from '../../components/records/WeeklySummaryView';
import { Button } from '../../components/ui/InputControls';

export default function RecordsPage() {
  const { records, categories, paymentMethods, loading, refreshData } = useData();

  // Filtering states
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('day');
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [startDate, setStartDate] = useState(DateTime.now().startOf('month'));
  const [endDate, setEndDate] = useState(DateTime.now().endOf('month'));

  const [filterType, setFilterType] = useState<'all' | 'income' | 'purchase' | 'spending'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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
    period,
    customStart: period === 'all' ? startDate : null,
    customEnd: period === 'all' ? endDate : null
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    filterType,
    filterCategory,
    filterPaymentMethod,
    searchTerm,
    currentDate,
    period,
    startDate,
    endDate
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        title="매출/비용 내역"
        description={
          period === 'all'
            ? `${startDate.toFormat('yyyy.MM.dd')} ~ ${endDate.toFormat(
                'yyyy.MM.dd'
              )} 기간의 검색 결과입니다.`
            : period === 'month'
            ? `${currentDate.toFormat('yyyy년 MM월')} 매장 거래 내역입니다.`
            : period === 'week'
            ? `${getMonthWeekRange(currentDate).start.toFormat('MM월 dd일')} ~ ${getMonthWeekRange(
                currentDate
              ).end.toFormat('MM월 dd일')} 주간 내역입니다.`
            : `${currentDate.toFormat('yyyy년 MM월 dd일')} 상세 내역입니다.`
        }
        actions={
          <Button onClick={() => handleOpenAddModal()} icon={<PlusCircle size={18} />}>
            내역 추가
          </Button>
        }
      />

      <RecordFilterBar
        period={period}
        setPeriod={setPeriod}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
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

      {/* Pagination Controls (Top) */}
      {totalPages > 1 && (period === 'all' || period === 'day') && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="!px-2 !rounded-lg"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}>
            <ChevronsLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!px-2 !rounded-lg"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
            <ChevronLeft size={16} />
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {(() => {
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, startPage + 4);
              if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-black ${
                      currentPage === i
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    {i}
                  </button>
                );
              }
              return pages;
            })()}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="!px-2 !rounded-lg"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="!px-2 !rounded-lg"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}>
            <ChevronsRight size={16} />
          </Button>
        </div>
      )}

      <div key={`page-${currentPage}`} className="min-h-[400px] animate-in fade-in duration-300">
        {(period === 'day' || period === 'all') && (
          <RecordTable
            records={paginatedRecords}
            categories={categories}
            paymentMethods={paymentMethods}
            period={period}
            showDetail={true}
            onRecordClick={record => {
              setSelectedRecord(record);
              setIsDetailModalOpen(true);
            }}
            totalIncome={totals.income}
            totalExpense={totals.expense}
          />
        )}

        {period === 'week' && (
          <WeeklySummaryView
            currentDate={currentDate}
            records={records}
            totalIncome={totals.income}
            totalExpense={totals.expense}
            onDayClick={date => {
              setCurrentDate(date);
              setPeriod('day');
            }}
          />
        )}

        {(period === 'month' || period === 'year') && (
          <CalendarView
            calendarDays={calendarDays}
            totalIncome={totals.income}
            totalExpense={totals.expense}
            onDayClick={date => {
              setCurrentDate(date);
              setPeriod('day');
            }}
          />
        )}
      </div>

      {/* Back to Top Button */}
      {(period === 'all' || period === 'day') && filteredRecords.length > 10 && (
        <div className="flex justify-center pt-8 pb-12">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            icon={<ArrowUp size={16} />}>
            맨 위로 이동
          </Button>
        </div>
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
