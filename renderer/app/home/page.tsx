'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  AlertTriangle,
  X,
  CheckCircle2,
  Edit3,
  Trash2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Record, Category, Settings, StorageInfo } from '../../types';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { useData } from '../../context/DataContext';

export default function HomePage() {
  const { records, categories, settings, storage, loading, refreshData, showAlert, showConfirm } =
    useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    type: 'income',
    category_id: '',
    amount: 0,
    date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
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
          setEditingRecord(null);
          // Reset form data
          setFormData({
            type: 'income',
            category_id: categories.find(c => c.type === 'income')?.id || '',
            amount: 0,
            date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
            note: ''
          });
          await refreshData();
        });
        return;
      } else {
        await (window as any).ipc.invoke('add-record', formData);
      }
      setIsModalOpen(false);
      setEditingRecord(null);
      // Reset form data
      setFormData({
        type: 'income',
        category_id: categories.find(c => c.type === 'income')?.id || '',
        amount: 0,
        date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        note: ''
      });
      await refreshData();
    } catch (error) {
      showAlert('저장 중 오류가 발생했습니다.', '오류');
    }
  };

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
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20">
          <PlusCircle size={20} /> 새 내역 등록
        </button>
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
              {[...records]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map(record => (
                  <tr
                    key={record.id}
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDetailModalOpen(true);
                    }}
                    className="hover:bg-gray-800/20 transition-colors cursor-pointer">
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
                    <PlusCircle className="text-blue-400" size={20} />
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

function StatCard({ title, value, icon: Icon, color, bg, border }: any) {
  return (
    <div
      className={`p-6 rounded-3xl border ${border} ${bg} shadow-sm transition-all hover:translate-y-[-4px]`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} border ${border}`}>
          <Icon className={color} size={24} />
        </div>
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
