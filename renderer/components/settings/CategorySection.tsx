'use client';

import React from 'react';
import { Package, PlusCircle } from 'lucide-react';
import Card from '../ui/Card';
import { Button } from '../ui/InputControls';
import { Category } from '../../types';

interface CategoryListProps {
  title: string;
  categories: Category[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function CategoryList({ title, categories, onAdd, onDelete }: CategoryListProps) {
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
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div
            key={c.id}
            className="flex items-center gap-2 bg-gray-900 border border-gray-800 pl-4 pr-2 py-2 rounded-2xl group hover:border-blue-500/50 transition-all shadow-sm">
            <span className="text-xs font-bold text-white">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="p-1 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg">
              <PlusCircle size={14} className="rotate-45" />
            </button>
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
}

export default function CategorySection({ categories, onAction }: CategorySectionProps) {
  return (
    <Card title="카테고리 관리" icon={<Package size={24} className="text-blue-400" />}>
      <div className="space-y-8">
        <CategoryList
          type="income"
          title="매출 항목"
          categories={categories.filter(c => c.type === 'income' && (c as any).is_active !== false)}
          onAdd={() => onAction('add', 'income')}
          onDelete={id => onAction('delete', 'income', id)}
        />
        <div className="h-px bg-gray-800/50 mx-4" />
        <CategoryList
          type="expense"
          title="매입 항목"
          categories={categories.filter(
            c => c.type === 'expense' && (c as any).is_active !== false
          )}
          onAdd={() => onAction('add', 'expense')}
          onDelete={id => onAction('delete', 'expense', id)}
        />
      </div>
    </Card>
  );
}
