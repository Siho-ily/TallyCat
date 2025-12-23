'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit3, CheckCircle2, Calendar, FileText } from 'lucide-react';
import { DateTime } from 'luxon';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';
import BaseModal from './BaseModal';
import { Button, Input } from './InputControls';

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
  const { categories, paymentMethods, showAlert, showConfirm } = useData();
  const [formData, setFormData] = useState<Omit<Record, 'id'>>({
    type: 'income',
    category_id: '',
    payment_method_id: '',
    amount: 0,
    date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
    note: ''
  });
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const defaultPM = paymentMethods.find(pm => pm.name === '카드') || paymentMethods[0];

    if (editingRecord) {
      setFormData({
        type: editingRecord.type,
        category_id: editingRecord.category_id,
        payment_method_id: editingRecord.payment_method_id,
        amount: editingRecord.amount,
        date: editingRecord.date,
        note: editingRecord.note
      });
    } else {
      setFormData({
        type: initialData?.type || 'income',
        category_id: initialData?.category_id || categories[0]?.id || '',
        payment_method_id: initialData?.payment_method_id || defaultPM?.id || '',
        amount: initialData?.amount || 0,
        date: initialData?.date || DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
        note: initialData?.note || ''
      });
    }
  }, [editingRecord, initialData, categories, paymentMethods, isOpen]);

  // Force focus when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
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

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} className="flex-1">
        취소
      </Button>
      <Button
        type="submit"
        form="record-form"
        className="flex-[2]"
        icon={<CheckCircle2 size={20} />}>
        {editingRecord ? '내역 수정 완료' : '내역 등록 완료'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecord ? '내역 수정' : '새 내역 추가'}
      icon={editingRecord ? <Edit3 size={20} /> : <PlusCircle size={20} />}
      footer={footer}>
      <form id="record-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-2 bg-white dark:bg-gray-950 p-1.5 rounded-[20px] border border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant={formData.type === 'income' ? 'primary' : 'ghost'}
            className={`flex-1 !rounded-xl ${
              formData.type === 'income' ? 'bg-emerald-500 hover:bg-emerald-400' : ''
            }`}
            onClick={() => {
              setFormData({ ...formData, type: 'income' });
            }}>
            매출
          </Button>
          <Button
            type="button"
            variant={formData.type === 'expense' ? 'primary' : 'ghost'}
            className={`flex-1 !rounded-xl ${
              formData.type === 'expense' ? 'bg-rose-500 hover:bg-rose-400' : ''
            }`}
            onClick={() => {
              setFormData({ ...formData, type: 'expense' });
            }}>
            매입
          </Button>
        </div>
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest pl-1">
              카테고리 (선택사항)
            </label>
            <select
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all appearance-none cursor-pointer">
              <option value="">미지정</option>
              {categories
                .filter(c => (c as any).is_active !== false)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest pl-1">
              결제 방식
            </label>
            <select
              required
              value={formData.payment_method_id}
              onChange={e => setFormData({ ...formData, payment_method_id: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all appearance-none cursor-pointer">
              {paymentMethods
                .filter(pm => pm.is_active !== false)
                .map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
            </select>
          </div>

          <Input
            ref={amountInputRef}
            label="금액 (원)"
            type="number"
            required
            value={formData.amount || ''}
            suffix="KRW"
            onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />

          <Input
            label="날짜/시간"
            type="datetime-local"
            step="1"
            prefixIcon={<Calendar size={18} />}
            value={formData.date ? formData.date.replace(' ', 'T') : ''}
            onChange={e => setFormData({ ...formData, date: e.target.value.replace('T', ' ') })}
          />

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-600 dark:text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-2">
              <FileText size={12} className="text-gray-500 dark:text-gray-600" /> 비고 / 메모
            </label>
            <textarea
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 text-sm font-medium text-gray-900 dark:text-white h-28 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all resize-none"
              placeholder="상세 내용을 입력하세요..."
            />
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
