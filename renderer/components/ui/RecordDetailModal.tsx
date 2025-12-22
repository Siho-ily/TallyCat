'use client';

import React from 'react';
import { X, Edit3, Trash2 } from 'lucide-react';
import { Record } from '../../types';
import { useData } from '../../context/DataContext';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <h3 className="text-xl font-black text-white">거래 상세 정보</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
            <X className="text-gray-500 hover:text-white" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                거래 일시
              </span>
              <p className="text-lg font-bold text-white">{record.date}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                거래 유형
              </span>
              <div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-black ${
                    record.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                  {record.type === 'income' ? '매출 (INCOME)' : '매입 (EXPENSE)'}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                카테고리
              </span>
              <p className="text-lg font-bold text-white">{categoryName}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                금액
              </span>
              <p
                className={`text-2xl font-black ${
                  record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                {record.type === 'income' ? '+' : '-'}
                {record.amount.toLocaleString()}원
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-800">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              비고 / 메모
            </span>
            <div className="bg-gray-950 p-6 rounded-3xl border border-gray-800 min-h-[100px] text-gray-300 leading-relaxed font-medium">
              {record.note || <span className="text-gray-700 italic">기록된 메모가 없습니다.</span>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => onEdit(record)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-gray-700">
              <Edit3 size={18} /> 수정하기
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-rose-500/20">
              <Trash2 size={18} /> 삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
