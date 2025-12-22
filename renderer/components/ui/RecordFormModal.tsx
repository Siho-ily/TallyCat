'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit3, X, CheckCircle2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: Record | null;
  initialData?: Partial<Omit<Record, 'id'>> | null;
  onSuccess: () => Promise<void>;
}

export default function RecordFormModal({
  isOpen,
  onClose,
  editingRecord,
  initialData,
  onSuccess
}: RecordFormModalProps) {
  const { categories, showAlert, showConfirm } = useData();
  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    type: 'income',
    category_id: '',
    amount: 0,
    date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
    note: ''
  });
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        type: editingRecord.type,
        category_id: editingRecord.category_id,
        amount: editingRecord.amount,
        date: editingRecord.date,
        note: editingRecord.note
      });
    } else {
      setFormData({
        type: initialData?.type || 'income',
        category_id:
          initialData?.category_id ||
          categories.find(c => c.type === (initialData?.type || 'income'))?.id ||
          '',
        amount: initialData?.amount || 0,
        date: initialData?.date || DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        note: initialData?.note || ''
      });
    }
  }, [editingRecord, initialData, categories, isOpen]);

  // Force focus when modal opens
  useEffect(() => {
    if (isOpen) {
      window.focus();
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
        if (document.activeElement !== amountInputRef.current) {
          amountInputRef.current?.click();
          amountInputRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        showConfirm('내역을 수정하시겠습니까?', '수정 확인', async () => {
          await (window as any).ipc.invoke('update-record', { ...formData, id: editingRecord.id });
          onClose();
          await onSuccess();
        });
        return;
      } else {
        await (window as any).ipc.invoke('add-record', formData);
      }
      onClose();
      await onSuccess();
    } catch (error) {
      showAlert('저장 중 오류가 발생했습니다.', '오류');
    }
  };

  if (!isOpen) return null;

  return (
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
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
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
                onChange={e => setFormData({ ...formData, date: e.target.value.replace('T', ' ') })}
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
              onClick={onClose}
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
  );
}
