'use client';

import React, { useState, useEffect } from 'react';
import { Zap, DollarSign, Calendar, Edit3, PlusCircle } from 'lucide-react';
import BaseModal from '../ui/BaseModal';
import { Button, Input } from '../ui/InputControls';
import { useData } from '../../context/DataContext';
import { AutomationRule } from '../../types';

interface AutomationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRule: AutomationRule | null;
  onSuccess: () => void;
}

export default function AutomationFormModal({
  isOpen,
  onClose,
  editingRule,
  onSuccess
}: AutomationFormModalProps) {
  const { categories, paymentMethods } = useData();
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    type: 'income',
    amount: 0,
    category_id: '',
    payment_method_id: '',
    day_of_month: 1,
    is_active: true
  });

  useEffect(() => {
    if (editingRule) {
      setFormData(editingRule);
    } else {
      const defaultType = 'income';
      const defaultCat = categories.find(c => c.type === defaultType && c.is_active !== false);
      const defaultPM = paymentMethods.find(pm => pm.is_active !== false);

      setFormData({
        name: '',
        type: defaultType,
        amount: 0,
        category_id: defaultCat?.id || '',
        payment_method_id: defaultPM?.id || '',
        day_of_month: 1,
        is_active: true
      });
    }
  }, [editingRule, isOpen, categories, paymentMethods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id || !formData.payment_method_id) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      await (window as any).ipc.invoke('save-automation-rule', formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save automation rule:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const filteredCategories = categories.filter(
    c => c.type === formData.type && c.is_active !== false
  );

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} className="flex-1">
        취소
      </Button>
      <Button form="automation-form" type="submit" className="flex-[2]">
        {editingRule ? '수정 완료' : '규칙 추가'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRule ? '자동화 규칙 수정' : '새 자동화 규칙'}
      icon={editingRule ? <Edit3 size={20} /> : <Zap size={20} />}
      footer={footer}>
      <form id="automation-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-2 bg-white dark:bg-gray-950 p-1.5 rounded-[20px] border border-gray-200 dark:border-gray-800">
          {(['income', 'purchase', 'spending'] as const).map(t => (
            <Button
              key={t}
              type="button"
              variant={formData.type === t ? 'primary' : 'ghost'}
              className={`flex-1 !rounded-xl !text-[11px] ${
                formData.type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : t === 'purchase'
                    ? 'bg-amber-500 hover:bg-amber-400 text-white'
                    : 'bg-rose-500 hover:bg-rose-400'
                  : ''
              }`}
              onClick={() => {
                const defaultCat = categories.find(
                  c => c.type === t && c.is_active !== false && c.is_default
                );
                setFormData({ ...formData, type: t, category_id: defaultCat?.id || '' });
              }}>
              {t === 'income' ? '매출' : t === 'purchase' ? '매입' : '지출'}
            </Button>
          ))}
        </div>

        <div className="space-y-6">
          <Input
            label="규칙 명칭"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="예: 매월 월세, 전용 상품 자동 입력 등"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="입력 금액"
              type="number"
              value={formData.amount || ''}
              onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              prefixIcon={<DollarSign size={16} />}
              suffix="원"
            />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                실행 일자 (매월)
              </label>
              <div className="relative group">
                <select
                  value={formData.day_of_month || 1}
                  onChange={e =>
                    setFormData({ ...formData, day_of_month: parseInt(e.target.value) })
                  }
                  className="w-full h-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-10 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none text-gray-900 dark:text-white">
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}일
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Calendar size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                카테고리
              </label>
              <select
                value={formData.category_id || ''}
                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-gray-900 dark:text-white">
                <option value="">카테고리 선택</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
                결제방식
              </label>
              <select
                value={formData.payment_method_id || ''}
                onChange={e => setFormData({ ...formData, payment_method_id: e.target.value })}
                className="w-full h-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-gray-900 dark:text-white">
                <option value="">결제방식 선택</option>
                {paymentMethods
                  .filter(pm => pm.is_active !== false)
                  .map(pm => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}
