'use client';

import React from 'react';
import { Package, PlusCircle, Edit3 } from 'lucide-react';
import Card from '../ui/Card';
import { Button, Input } from '../ui/InputControls';
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
          항목 추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {categories.map(c => (
          <div
            key={c.id}
            onClick={() => onEdit(c)}
            className="flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl group hover:border-blue-500/50 transition-all shadow-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-400 transition-colors">
              {c.name}
            </span>
            {c.name !== '기본' && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
                className="p-0.5 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-md">
                <PlusCircle size={12} className="rotate-45" />
              </button>
            )}
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-[10px] text-gray-600 font-bold italic pl-1">등록된 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

interface CategorySectionProps {
  categories: Category[];
  onAction: (action: 'add' | 'delete', type: 'income' | 'expense', id?: string) => void;
  onRename: (id: string, newName: string) => Promise<void>;
}

export default function CategorySection({ categories, onAction, onRename }: CategorySectionProps) {
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [newName, setNewName] = React.useState('');

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setNewName(category.name);
  };

  const handleRenameSubmit = async () => {
    if (editingCategory && newName.trim()) {
      await onRename(editingCategory.id, newName.trim());
      setEditingCategory(null);
    }
  };

  return (
    <Card title="카테고리 관리" icon={<Package size={24} className="text-blue-400" />}>
      <div className="space-y-8">
        <CategoryList
          title="매출 항목"
          categories={categories.filter(c => c.type === 'income' && c.is_active !== false)}
          onAdd={() => onAction('add', 'income')}
          onEdit={handleEditClick}
          onDelete={id => onAction('delete', 'income', id)}
        />
        <div className="h-px bg-gray-800/50 mx-4" />
        <CategoryList
          title="매입 항목"
          categories={categories.filter(c => c.type === 'expense' && c.is_active !== false)}
          onAdd={() => onAction('add', 'expense')}
          onEdit={handleEditClick}
          onDelete={id => onAction('delete', 'expense', id)}
        />
      </div>

      <BaseModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="카테고리 이름 변경"
        icon={<Edit3 size={24} />}
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingCategory(null)} className="flex-1">
              취소
            </Button>
            <Button onClick={handleRenameSubmit} className="flex-[2]">
              변경 완료
            </Button>
          </>
        }>
        <div className="space-y-4">
          <Input
            label="카테고리 이름"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="변경할 이름을 입력하세요"
            autoFocus
          />
          <p className="text-xs text-gray-500 leading-relaxed">
            * 이름을 변경하면 기존에 등록된 모든 내역의 카테고리 이름도 함께 변경됩니다.
          </p>
        </div>
      </BaseModal>
    </Card>
  );
}
