'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Zap,
  Trash2,
  Edit3,
  Power,
  Calendar as CalendarIcon,
  DollarSign
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/InputControls';
import Card from '../../components/ui/Card';
import { AutomationRule } from '../../types';
import { useData } from '../../context/DataContext';
import AutomationFormModal from '../../components/automation/AutomationFormModal';
import Badge from '../../components/ui/Badge';

export default function AutomationPage() {
  const { categories, paymentMethods, refreshData, loading: dataLoading } = useData();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const fetchRules = async () => {
    try {
      const result = await (window as any).ipc.invoke('get-automation-rules');
      setRules(result);
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await (window as any).ipc.invoke('toggle-automation-rule', id);
      await fetchRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 자동화 규칙을 삭제하시겠습니까?')) return;
    try {
      await (window as any).ipc.invoke('delete-automation-rule', id);
      await fetchRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <PageHeader
        title="자동화 관리"
        description="매월 정기적으로 발생하는 매출이나 비용을 자동으로 등록합니다."
        actions={
          <Button onClick={handleAdd} icon={<PlusCircle size={20} />}>
            규칙 추가
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {rules.map(rule => (
          <Card
            key={rule.id}
            className={`transition-all ${!rule.is_active ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={`p-4 rounded-2xl ${
                    rule.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : rule.type === 'purchase'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                  <Zap size={24} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {rule.name}
                    </h3>
                    <Badge type={rule.type} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} /> 매월 {rule.day_of_month}일
                    </span>
                    <span className="flex items-center gap-1 text-blue-500">
                      <DollarSign size={12} /> {rule.amount.toLocaleString()}원
                    </span>
                    <span>{categories.find(c => c.id === rule.category_id)?.name || '미지정'}</span>
                    <span className="opacity-60">(마지막 실행: {rule.last_run || '없음'})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(rule.id)}
                  className={`!rounded-xl ${
                    rule.is_active
                      ? 'text-gray-400 hover:text-rose-500'
                      : 'text-emerald-500 hover:bg-emerald-50'
                  }`}>
                  <Power size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(rule)}
                  className="!rounded-xl">
                  <Edit3 size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(rule.id)}
                  className="!rounded-xl hover:text-rose-500">
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {rules.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-gray-50 dark:bg-gray-900/50 rounded-[32px] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="flex justify-center">
              <Zap size={48} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold italic">등록된 자동화 규칙이 없습니다.</p>
            <Button variant="secondary" onClick={handleAdd} size="sm">
              첫 규칙 만들기
            </Button>
          </div>
        )}
      </div>

      <AutomationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRule={editingRule}
        onSuccess={() => {
          fetchRules();
          refreshData();
        }}
      />
    </div>
  );
}
