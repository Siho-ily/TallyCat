'use client';

import React from 'react';
import { CreditCard, PlusCircle, Edit3 } from 'lucide-react';
import Card from '../ui/Card';
import { Button, Input } from '../ui/InputControls';
import BaseModal from '../ui/BaseModal';
import { PaymentMethod } from '../../types';

interface PaymentMethodListProps {
  title: string;
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (id: string) => void;
}

function PaymentMethodList({
  title,
  paymentMethods,
  onAdd,
  onEdit,
  onDelete
}: PaymentMethodListProps) {
  const defaultMethods = ['카드', '현금'];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
          {title}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="!text-[10px] !py-1 !px-2"
          icon={<PlusCircle size={14} />}>
          결제 방식 추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {paymentMethods.map(pm => (
          <div
            key={pm.id}
            onClick={() => onEdit(pm)}
            className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl group hover:border-blue-500/50 transition-all shadow-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-400 transition-colors">
              {pm.name}
            </span>
            {!defaultMethods.includes(pm.name) && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(pm.id);
                }}
                className="p-0.5 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-md">
                <PlusCircle size={12} className="rotate-45" />
              </button>
            )}
          </div>
        ))}
        {paymentMethods.length === 0 && (
          <p className="text-[10px] text-gray-600 font-bold italic pl-1">
            등록된 결제 방식이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

interface PaymentMethodSectionProps {
  paymentMethods: PaymentMethod[];
  onAction: (action: 'add' | 'delete', id?: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
}

export default function PaymentMethodSection({
  paymentMethods,
  onAction,
  onRename
}: PaymentMethodSectionProps) {
  const [editingPaymentMethod, setEditingPaymentMethod] = React.useState<PaymentMethod | null>(
    null
  );
  const [newName, setNewName] = React.useState('');

  const handleEditClick = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setNewName(paymentMethod.name);
  };

  const handleRenameSubmit = async () => {
    if (editingPaymentMethod && newName.trim()) {
      await onRename(editingPaymentMethod.id, newName.trim());
      setEditingPaymentMethod(null);
    }
  };

  return (
    <Card title="결제 방식 관리" icon={<CreditCard size={24} className="text-green-400" />}>
      <div className="space-y-4">
        <PaymentMethodList
          title="전체 결제 방식"
          paymentMethods={paymentMethods.filter(pm => pm.is_active !== false)}
          onAdd={() => onAction('add')}
          onEdit={handleEditClick}
          onDelete={id => onAction('delete', id)}
        />
      </div>

      <BaseModal
        isOpen={!!editingPaymentMethod}
        onClose={() => setEditingPaymentMethod(null)}
        title="결제 방식 이름 변경"
        icon={<Edit3 size={24} />}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditingPaymentMethod(null)}
              className="flex-1">
              취소
            </Button>
            <Button onClick={handleRenameSubmit} className="flex-[2]">
              변경 완료
            </Button>
          </>
        }>
        <div className="space-y-4">
          <Input
            label="결제 방식 이름"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="변경할 이름을 입력하세요"
            autoFocus
          />
          <p className="text-xs text-gray-500 leading-relaxed">
            * 이름을 변경하면 기존에 등록된 모든 내역의 결제 방식 이름도 함께 변경됩니다.
          </p>
        </div>
      </BaseModal>
    </Card>
  );
}
