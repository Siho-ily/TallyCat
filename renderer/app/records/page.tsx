'use client';

import React, { useEffect, useState } from 'react';
import { Record, Category } from '../../types';
import { Plus, Trash2, Edit3, X, CheckCircle2 } from 'lucide-react';
import { DateTime } from 'luxon';

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'year'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    type: 'income',
    category_id: '',
    amount: 0,
    date: '',
    note: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fetchedRecords = await (window as any).ipc.invoke('get-records');
      const fetchedCategories = await (window as any).ipc.invoke('get-categories');
      setRecords(fetchedRecords);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await (window as any).ipc.invoke('update-record', { ...formData, id: editingRecord.id });
      } else {
        await (window as any).ipc.invoke('add-record', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 내역을 삭제하시겠습니까?')) {
      await (window as any).ipc.invoke('delete-record', id);
      fetchData();
    }
  };

  const filteredRecords = React.useMemo(() => {
    let result = [...records];
    if (typeFilter !== 'all') result = result.filter(r => r.type === typeFilter);
    const now = DateTime.now();
    if (period === 'day')
      result = result.filter(r => DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'day'));
    else if (period === 'week')
      result = result.filter(r => DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'week'));
    else if (period === 'month')
      result = result.filter(r => DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'month'));
    else if (period === 'year')
      result = result.filter(r => DateTime.fromISO(r.date.replace(' ', 'T')).hasSame(now, 'year'));
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, typeFilter, period]);

  if (loading) return <div className="text-blue-400 animate-pulse">데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-white">매출/매입 내역</h2>
        <button
          onClick={() => {
            setEditingRecord(null);
            setFormData({
              type: 'income',
              category_id: categories.find(c => c.type === 'income')?.id || '',
              amount: 0,
              date: '',
              note: ''
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
          <Plus size={18} /> 내역 추가
        </button>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
          {(['all', 'day', 'week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold ${
                period === p
                  ? 'bg-gray-800 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}>
              {p === 'all'
                ? '전체'
                : p === 'day'
                ? '오늘'
                : p === 'week'
                ? '이번 주'
                : p === 'month'
                ? '이번 달'
                : '올해'}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          className="bg-gray-950 border border-gray-800 text-gray-300 text-xs font-bold rounded-xl px-4 py-2 outline-none">
          <option value="all">모든 유형</option>
          <option value="income">매출만</option>
          <option value="expense">매입만</option>
        </select>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/30 text-gray-400 text-[10px] uppercase font-black">
              <th className="px-6 py-4">날짜 / 시간</th>
              <th className="px-6 py-4">유형</th>
              <th className="px-6 py-4">카테고리</th>
              <th className="px-6 py-4 text-right">금액</th>
              <th className="px-6 py-4">비고</th>
              <th className="px-6 py-4 text-center w-20">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-800/20 group">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-200">{record.date.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-500">{record.date.split(' ')[1]}</div>
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
                <td className="px-6 py-4 text-sm font-semibold">
                  {categories.find(c => c.id === record.category_id)?.name || '기타'}
                </td>
                <td
                  className={`px-6 py-4 text-right font-black text-sm ${
                    record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                  {record.type === 'income' ? '+' : '-'}
                  {record.amount.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                  {record.note || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData({ ...record });
                        setIsModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 hover:bg-rose-500/20 rounded-lg text-gray-400 hover:text-rose-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-3xl shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingRecord ? '내역 수정' : '새 내역 추가'}</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 rounded-lg text-sm font-bold ${
                    formData.type === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-500'
                  }`}>
                  매출
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 rounded-lg text-sm font-bold ${
                    formData.type === 'expense' ? 'bg-rose-500 text-white' : 'text-gray-500'
                  }`}>
                  매입
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">카테고리</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm">
                  {categories
                    .filter(c => c.type === formData.type)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">금액 (원)</label>
                <input
                  type="number"
                  required
                  value={formData.amount || ''}
                  onChange={e =>
                    setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm font-bold"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">날짜/시간</label>
                <input
                  type="datetime-local"
                  step="1"
                  value={formData.date ? formData.date.replace(' ', 'T') : ''}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value.replace('T', ' ') })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">비고</label>
                <textarea
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm h-24"
                  placeholder="내용을 입력하세요..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl mt-4">
                <CheckCircle2 className="inline mr-2" size={18} />{' '}
                {editingRecord ? '보관하기' : '등록하기'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
