'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import StatCard from '../ui/StatCard';

interface StatsSectionProps {
  monthlyIncome: number;
  monthlyExpense: number;
}

export default function StatsSection({ monthlyIncome, monthlyExpense }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StatCard
        title="이번 달 총 매출"
        value={`${monthlyIncome.toLocaleString()}원`}
        icon={<ArrowUpRight size={24} />}
        color="emerald"
      />
      <StatCard
        title="이번 달 총 매입"
        value={`${monthlyExpense.toLocaleString()}원`}
        icon={<ArrowDownRight size={24} />}
        color="rose"
      />
      <StatCard
        title="현재 순수익"
        value={`${(monthlyIncome - monthlyExpense).toLocaleString()}원`}
        icon={<Layers size={24} />}
        color="blue"
      />
    </div>
  );
}
