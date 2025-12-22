'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Record, Category } from '../../types';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Database,
  Search,
  RotateCcw
} from 'lucide-react';
import { DateTime } from 'luxon';

import { useData } from '../../context/DataContext';

export default function RecordsPage() {
  const { records, categories, loading, refreshData, showAlert, showConfirm } = useData();
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
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    type: 'income',
    category_id: '',
    amount: 0,
    date: '',
    note: ''
  });
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Force focus when modal opens
  useEffect(() => {
    if (isModalOpen) {
      window.focus();
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
        // Fallback for some browsers/OS
        if (document.activeElement !== amountInputRef.current) {
          amountInputRef.current?.click();
          amountInputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        showConfirm('내역을 수정하시겠습니까?', '수정 확인', async () => {
          await (window as any).ipc.invoke('update-record', { ...formData, id: editingRecord.id });
          setIsModalOpen(false);
          await refreshData();
        });
        return;
      } else {
        await (window as any).ipc.invoke('add-record', formData);
      }
      setIsModalOpen(false);
      await refreshData();
    } catch (error) {
      showAlert('저장 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm('정말로 이 내역을 삭제하시겠습니까?', '내역 삭제', async () => {
      await (window as any).ipc.invoke('delete-record', id);
      await refreshData();
    });
  };

  const filteredRecords = React.useMemo(() => {
    let result = [...records];

    // 1. Basic Filters
    if (typeFilter !== 'all') result = result.filter(r => r.type === typeFilter);
    if (categoryFilter !== 'all') result = result.filter(r => r.category_id === categoryFilter);

    // 2. Search Query (Note or Amount)
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

  // Reset page to 1 when filters change
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

  // Calendar Logic
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-white">매출/매입 내역</h2>
          <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-xl ml-2 scale-90 shadow-inner">
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
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setSelectedRecord(null);
            setFormData({
              type: 'income',
              category_id: categories.find(c => c.type === 'income')?.id || '',
              amount: 0,
              date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
              note: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg transform hover:scale-105 active:scale-95">
          <Plus size={18} /> 내역 추가
        </button>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
              시간
            </span>
            {viewMode === 'list' ? (
              <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
                {(['all', 'day', 'week', 'month', 'year'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      period === p
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {p === 'all'
                      ? '전체'
                      : p === 'day'
                      ? '오늘'
                      : p === 'week'
                      ? '주간'
                      : p === 'month'
                      ? '월간'
                      : '년간'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-gray-950 px-4 py-1.5 rounded-xl border border-gray-800">
                <button
                  onClick={() => setCurrentMonth(currentMonth.minus({ months: 1 }))}
                  className="text-gray-500 hover:text-white p-0.5">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black text-white min-w-[80px] text-center">
                  {currentMonth.toFormat('yyyy년 L월')}
                </span>
                <button
                  onClick={() => setCurrentMonth(currentMonth.plus({ months: 1 }))}
                  className="text-gray-500 hover:text-white p-0.5">
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentMonth(DateTime.now().startOf('month'))}
                  className="ml-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                  Today
                </button>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-gray-800 mx-1 hidden lg:block" />

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              유형
            </span>
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as any);
                setCategoryFilter('all'); // Reset category when type changes
              }}
              className="bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none hover:border-gray-700 transition-all cursor-pointer">
              <option value="all">모든 유형</option>
              <option value="income">매출 (Income)</option>
              <option value="expense">매입 (Expense)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              카테고리
            </span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none hover:border-gray-700 transition-all cursor-pointer min-w-[120px]">
              <option value="all">전체 카테고리</option>
              {categories
                .filter(c => typeFilter === 'all' || c.type === typeFilter)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group min-w-[240px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="내역 검색 (메모, 금액...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-2 text-xs font-medium text-white placeholder-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Calendar View Legend */}
        {viewMode === 'calendar' && (
          <div className="flex items-center gap-6 pr-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Income
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Expense
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black text-gray-500 hover:text-white bg-gray-950 border border-gray-800 hover:border-gray-700 rounded-xl transition-all group"
          title="필터 초기화">
          <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
          <span>초기화</span>
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
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
              {paginatedRecords.map(record => (
                <tr
                  key={record.id}
                  onClick={() => {
                    setSelectedRecord(record);
                    setIsDetailModalOpen(true);
                  }}
                  className="hover:bg-gray-800/20 group transition-all cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-200">
                      {record.date.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {record.date.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        record.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                      {record.type === 'income' ? '매출' : '매입'}
                    </span>
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
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Database size={48} className="text-gray-800" />
                      <p className="text-sm font-bold">등록된 내역이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
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
                          {paginatedRecords
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
                          {paginatedRecords
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

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-6 bg-gray-950/30 border-t border-gray-800">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[32px] h-8 rounded-lg text-xs font-black transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                    }`}>
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-[40px] overflow-hidden shadow-2xl p-8 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-7 gap-4">
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <div
                key={d}
                className={`text-center text-[10px] font-black uppercase tracking-widest pb-4 ${
                  i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                }`}>
                {d}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const isToday = day.date.hasSame(DateTime.now(), 'day');
              const hasData = day.income > 0 || day.expense > 0;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    const selectedDate = day.date.set({ hour: 12, minute: 0, second: 0 });
                    const dayRecords = records.filter(r =>
                      r.date.startsWith(day.date.toFormat('yyyy-MM-dd'))
                    );
                    if (dayRecords.length > 0) {
                      // If there is data, show list for that day (could be improved, but for now simple)
                      // Or just let them add a new one as it was?
                      // The user said "Click element -> Modal detail". On calendar, it adds record now.
                      // Let's keep calendar adding record for now, as it's a day cell, not a single record.
                    }
                    setFormData({
                      type: 'income',
                      category_id: categories.find(c => c.type === 'income')?.id || '',
                      amount: 0,
                      date: selectedDate.toFormat('yyyy-MM-dd HH:mm:ss'),
                      note: ''
                    });
                    setEditingRecord(null);
                    setIsModalOpen(true);
                  }}
                  className={`min-h-[120px] p-4 rounded-3xl border transition-all cursor-pointer group relative flex flex-col justify-between ${
                    day.isCurrentMonth
                      ? 'bg-gray-950/50 border-gray-800/50 hover:border-blue-500/40 hover:bg-gray-900/50'
                      : 'bg-transparent border-transparent opacity-20'
                  } ${isToday ? 'ring-2 ring-blue-500/50 bg-blue-500/5 border-blue-500/20' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm font-black ${
                        day.date.weekday === 7
                          ? 'text-rose-500'
                          : day.date.weekday === 6
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`}>
                      {day.date.day}
                    </span>
                    {isToday && (
                      <span className="text-[8px] px-2 py-0.5 bg-blue-500 text-white rounded-full font-black uppercase">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 backdrop-blur-sm">
                    {day.income > 0 && (
                      <div className="text-[10px] font-black text-emerald-500 truncate bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                        {day.income.toLocaleString()}
                      </div>
                    )}
                    {day.expense > 0 && (
                      <div className="text-[10px] font-black text-rose-500 truncate bg-rose-500/5 px-2 py-1 rounded-lg border border-rose-500/10">
                        {day.expense.toLocaleString()}
                      </div>
                    )}
                    {hasData && (
                      <div
                        className={`text-[9px] font-bold text-center mt-1 border-t border-gray-800/50 pt-1 ${
                          day.profit >= 0 ? 'text-blue-400/50' : 'text-rose-400/50'
                        }`}>
                        {day.profit >= 0 ? '+' : ''}
                        {day.profit.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Subtle hover effect indicator */}
                  <div className="absolute inset-0 rounded-3xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
              <h3 className="text-xl font-black text-white">상세 내역 정보</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <X className="text-gray-500 hover:text-white" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    날짜 / 시간
                  </span>
                  <p className="text-lg font-bold text-white">{selectedRecord.date}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    거래 유형
                  </span>
                  <div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black ${
                        selectedRecord.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                      {selectedRecord.type === 'income' ? '매출 (INCOME)' : '매입 (EXPENSE)'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    카테고리
                  </span>
                  <p className="text-lg font-bold text-white">
                    {categories.find(c => c.id === selectedRecord.category_id)?.name || '기타'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    금액
                  </span>
                  <p
                    className={`text-2xl font-black ${
                      selectedRecord.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                    {selectedRecord.type === 'income' ? '+' : '-'}
                    {selectedRecord.amount.toLocaleString()}원
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  비고 / 메모
                </span>
                <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 min-h-[100px] text-gray-300 leading-relaxed font-medium">
                  {selectedRecord.note || (
                    <span className="text-gray-700 italic">기록된 메모가 없습니다.</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setEditingRecord(selectedRecord);
                    setFormData({ ...selectedRecord });
                    setIsModalOpen(true);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-700">
                  <Edit3 size={18} /> 수정하기
                </button>
                <button
                  onClick={async () => {
                    showConfirm('정말로 이 내역을 삭제하시겠습니까?', '내역 삭제', async () => {
                      await (window as any).ipc.invoke('delete-record', selectedRecord.id);
                      setIsDetailModalOpen(false);
                      setSelectedRecord(null);
                      await refreshData();
                    });
                  }}
                  className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-rose-500/20">
                  <Trash2 size={18} /> 삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl">
                  {editingRecord ? (
                    <Edit3 className="text-blue-400" size={20} />
                  ) : (
                    <Plus className="text-blue-400" size={20} />
                  )}
                </div>
                <h3 className="text-xl font-black text-white">
                  {editingRecord ? '내역 수정' : '새 내역 추가'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <X className="text-gray-500 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1.5 rounded-2xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    const firstCat = categories.find(c => c.type === 'income')?.id || '';
                    setFormData({ ...formData, type: 'income', category_id: firstCat });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  매출 (INCOME)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const firstCat = categories.find(c => c.type === 'expense')?.id || '';
                    setFormData({ ...formData, type: 'expense', category_id: firstCat });
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                    formData.type === 'expense'
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}>
                  매입 (EXPENSE)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    카테고리
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/40 outline-none transition-all appearance-none cursor-pointer">
                    {categories
                      .filter(c => c.type === formData.type)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    금액 (원)
                  </label>
                  <div className="relative">
                    <input
                      ref={amountInputRef}
                      type="number"
                      required
                      autoFocus
                      value={formData.amount || ''}
                      onChange={e =>
                        setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-lg font-black text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder-gray-800"
                      placeholder="0"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 font-bold">
                      KRW
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    날짜/시간
                  </label>
                  <input
                    type="datetime-local"
                    step="1"
                    value={formData.date ? formData.date.replace(' ', 'T') : ''}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value.replace('T', ' ') })
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/40 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                    비고 / 메모
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-sm font-medium h-28 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all resize-none"
                    placeholder="상세 내용을 입력하세요..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-800 text-gray-300 font-black py-4 rounded-2xl hover:bg-gray-700 transition-all">
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all transform active:scale-95">
                  <CheckCircle2 className="inline mr-2" size={20} />{' '}
                  {editingRecord ? '내역 수정 완료' : '내역 등록 완료'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
