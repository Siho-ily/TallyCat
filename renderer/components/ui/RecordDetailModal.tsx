'use client';

import React from 'react';
import { Edit3, Trash2, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';
import BaseModal from './BaseModal';
import { Button } from './InputControls';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: Record | null;
  onEdit: (record: Record) => void;
  onDeleteSuccess: () => Promise<void>;
}

export default function RecordDetailModal({
  isOpen,
  onClose,
  record,
  onEdit,
  onDeleteSuccess
}: RecordDetailModalProps) {
  const { categories, showConfirm } = useData();

  if (!isOpen || !record) return null;

  const categoryName = categories.find(c => c.id === record.category_id)?.name || '기타';

  const handleDelete = async () => {
    showConfirm('정말로 이 내역을 삭제하시겠습니까?', '내역 삭제', async () => {
      await (window as any).ipc.invoke('delete-record', record.id);
      onClose();
      await onDeleteSuccess();
    });
  };

  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={() => onEdit(record)}
        className="flex-1"
        icon={<Edit3 size={18} />}>
        수정하기
      </Button>
      <Button
        variant="danger"
        onClick={handleDelete}
        className="flex-1"
        icon={<Trash2 size={18} />}>
        삭제하기
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="거래 상세 정보"
      footer={footer}
      maxWidth="max-w-lg">
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <DetailItem label="거래 일시" icon={<Calendar size={14} />}>
            {record.date}
          </DetailItem>

          <DetailItem label="거래 유형" icon={<Tag size={14} />}>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black ${
                record.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
              {record.type === 'income' ? '매출 (INCOME)' : '매입 (EXPENSE)'}
            </span>
          </DetailItem>

          <DetailItem label="카테고리" icon={<Tag size={14} />}>
            {categoryName}
          </DetailItem>

          <DetailItem label="금액" icon={<CreditCard size={14} />} align="right">
            <p
              className={`text-2xl font-black ${
                record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
              {record.type === 'income' ? '+' : '-'}
              {record.amount.toLocaleString()}원
            </p>
          </DetailItem>
        </div>

        <div className="space-y-2 pt-6 border-t border-gray-800">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <FileText size={12} className="text-gray-600" /> 비고 / 메모
          </span>
          <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 min-h-[100px] text-gray-300 leading-relaxed font-medium">
            {record.note || <span className="text-gray-700 italic">기록된 메모가 없습니다.</span>}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

function DetailItem({
  label,
  children,
  icon,
  align = 'left'
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <div className={`space-y-1 ${align === 'right' ? 'text-right' : ''}`}>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
        {icon && <span className="text-gray-700">{icon}</span>} {label}
      </span>
      <div className="text-lg font-bold text-white">{children}</div>
    </div>
  );
}
