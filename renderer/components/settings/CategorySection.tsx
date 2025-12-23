'use client';

import React from 'react';
import { Package, PlusCircle, Edit3, DollarSign, Star } from 'lucide-react';
import Card from '../ui/Card';
import { Button, Input, Toggle } from '../ui/InputControls';
import BaseModal from '../ui/BaseModal';
import { Category } from '../../types';

interface CategoryListProps {
  title: string;
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ title, categories, onAdd, onEdit, onDelete }: CategoryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-950/50 py-2 px-3 rounded-xl border border-gray-100 dark:border-gray-800/50">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
          {title}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="!text-[10px] !py-1 !px-2 !h-7 hover:bg-white dark:hover:bg-gray-900"
          icon={<PlusCircle size={14} />}>
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div
            key={c.id}
            onClick={() => onEdit(c)}
            className={`flex items-center gap-2.5 bg-white dark:bg-gray-950 border px-4 py-2 rounded-2xl group transition-all shadow-sm cursor-pointer hover:shadow-md ${
              c.is_default
                ? 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-900/10'
                : 'border-gray-200 dark:border-gray-800 hover:border-blue-500/50'
            }`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-black ${
                    c.is_default
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-500'
                  } transition-colors`}>
                  {c.name}
                </span>
                {c.is_default && <Star size={10} className="fill-amber-500 text-amber-500" />}
              </div>
              {c.default_amount ? (
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-600">
                  기본: {c.default_amount.toLocaleString()}원
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="p-1 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                <PlusCircle size={14} className="rotate-45" />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-[10px] text-gray-400 font-bold italic pl-4 py-2">
            등록된 항목이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  categories: Category[];
  onAction: (action: 'add' | 'delete', id?: string) => void;
  onSave: (category: Partial<Category>) => Promise<void>;
}

export default function CategorySection({ categories, onAction, onSave }: CategorySectionProps) {
  const [editingCategory, setEditingCategory] = React.useState<Partial<Category> | null>(null);

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
  };

  const handleAddClick = (type: 'income' | 'expense') => {
    setEditingCategory({
      name: '',
      type,
      default_amount: 0
    });
  };

  const handleSaveSubmit = async () => {
    if (editingCategory && editingCategory.name?.trim()) {
      await onSave({
        ...editingCategory,
        name: editingCategory.name.trim(),
        default_amount: editingCategory.default_amount || 0
      });
      setEditingCategory(null);
    }
  };

  return (
    <Card title="카테고리 관리" icon={<Package size={24} className="text-blue-400" />}>
      <div className="space-y-8">
        <CategoryList
          title="매출 카테고리 (Income)"
          categories={categories.filter(c => c.is_active !== false && c.type === 'income')}
          onAdd={() => handleAddClick('income')}
          onEdit={handleEditClick}
          onDelete={id => onAction('delete', id)}
        />

        <div className="border-t border-gray-100 dark:border-gray-800/50 pt-4" />

        <CategoryList
          title="매입 카테고리 (Expense)"
          categories={categories.filter(c => c.is_active !== false && c.type === 'expense')}
          onAdd={() => handleAddClick('expense')}
          onEdit={handleEditClick}
          onDelete={id => onAction('delete', id)}
        />
      </div>

      <BaseModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title={editingCategory?.id ? '카테고리 수정' : '새 카테고리 추가'}
        icon={<Edit3 size={24} />}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingCategory(null)} className="flex-1">
              취소
            </Button>
            <Button onClick={handleSaveSubmit} className="flex-[2]">
              {editingCategory?.id ? '수정 완료' : '추가 완료'}
            </Button>
          </>
        }>
        <div className="space-y-6">
          <Input
            label="카테고리 이름"
            value={editingCategory?.name || ''}
            onChange={e => setEditingCategory({ ...editingCategory!, name: e.target.value })}
            placeholder="예: 커트, 약품 구입 등"
            autoFocus
          />

          <Input
            label="기본 금액 (선택사항)"
            type="number"
            value={editingCategory?.default_amount || ''}
            onChange={e =>
              setEditingCategory({
                ...editingCategory!,
                default_amount: parseInt(e.target.value) || 0
              })
            }
            placeholder="0"
            prefixIcon={<DollarSign size={16} />}
            suffix="원"
          />

          <div className="flex items-center justify-between pt-2 px-1">
            <span className="text-xs font-black text-gray-700 dark:text-gray-300">
              기본 카테고리 설정
            </span>
            <Button
              type="button"
              variant={editingCategory?.is_default ? 'primary' : 'secondary'}
              size="sm"
              onClick={() =>
                setEditingCategory({
                  ...editingCategory!,
                  is_default: !editingCategory?.is_default
                })
              }
              className={`!py-1.5 !px-3 !rounded-xl ${
                editingCategory?.is_default ? 'bg-amber-500 hover:bg-amber-400 border-none' : ''
              }`}
              icon={
                <Star
                  size={14}
                  className={
                    editingCategory?.is_default ? 'fill-white text-white' : 'text-gray-400'
                  }
                />
              }>
              {editingCategory?.is_default ? '기본값 해제' : '기본값으로 지정'}
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
              * 기본 카테고리로 지정하면 새 내역 추가 시 자동으로 선택됩니다.
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold">
              * 금액을 입력해두면 내역 등록 시 금액 필드가 자동으로 채워집니다.
            </p>
          </div>
        </div>
      </BaseModal>
    </Card>
  );
}
