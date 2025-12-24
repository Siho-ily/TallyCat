'use client';

import React from 'react';
import { DateTime } from 'luxon';
import { Record, Category } from '../types';
import { getMonthWeekRange } from '../lib/dateUtils';

interface UseRecordFiltersProps {
  records: Record[];
  categories: Category[];
  filterType: 'all' | 'income' | 'purchase' | 'spending';
  filterCategory: string;
  filterPaymentMethod: string;
  searchTerm: string;
  currentDate: DateTime;
  period: 'day' | 'week' | 'month' | 'year';
}

export function useRecordFilters({
  records,
  categories,
  filterType,
  filterCategory,
  filterPaymentMethod,
  searchTerm,
  currentDate,
  period
}: UseRecordFiltersProps): Record[] {
  return React.useMemo(() => {
    let result = [...records];

    // 1. Type, Category & Payment Method Filter
    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterCategory !== 'all') result = result.filter(r => r.category_id === filterCategory);
    if (filterPaymentMethod !== 'all')
      result = result.filter(r => r.payment_method_id === filterPaymentMethod);

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
    let start: DateTime;
    let end: DateTime;

    if (period === 'week') {
      const range = getMonthWeekRange(currentDate);
      start = range.start;
      end = range.end.endOf('day'); // Ensure we cover the full last day
    } else {
      start = currentDate.startOf(period);
      end = currentDate.endOf(period);
    }

    result = result.filter(r => {
      const d = DateTime.fromFormat(r.date, 'yyyy-MM-dd HH:mm:ss');
      return d >= start && d <= end;
    });

    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [
    records,
    filterType,
    filterCategory,
    filterPaymentMethod,
    searchTerm,
    currentDate,
    period,
    categories
  ]);
}
