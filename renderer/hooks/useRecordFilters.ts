'use client';

import React from 'react';
import { DateTime } from 'luxon';
import { Record, Category } from '../types';

interface UseRecordFiltersProps {
  records: Record[];
  categories: Category[];
  filterType: 'all' | 'income' | 'expense';
  filterCategory: string;
  searchTerm: string;
  currentDate: DateTime;
  period: 'day' | 'week' | 'month' | 'year';
}

export function useRecordFilters({
  records,
  categories,
  filterType,
  filterCategory,
  searchTerm,
  currentDate,
  period
}: UseRecordFiltersProps): Record[] {
  return React.useMemo(() => {
    let result = [...records];

    // 1. Type & Category Filter
    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterCategory !== 'all') result = result.filter(r => r.category_id === filterCategory);

    // 2. Search Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        r =>
          (r.note && r.note.toLowerCase().includes(q)) ||
          r.amount.toString().includes(q) ||
          categories
            .find(c => c.id === r.category_id)
            ?.name.toLowerCase()
            .includes(q)
      );
    }

    // 3. Period Filter
    const start = currentDate.startOf(period);
    const end = currentDate.endOf(period);

    result = result.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= start && d <= end;
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, filterType, filterCategory, searchTerm, currentDate, period, categories]);
}
