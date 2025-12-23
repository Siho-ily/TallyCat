'use client';

import React from 'react';

interface BadgeProps {
  type: 'income' | 'purchase' | 'spending';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({ type, label, size = 'md', className = '' }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'px-3 py-1 text-[10px]',
    lg: 'px-4 py-1.5 text-xs'
  };

  const baseClasses = `rounded-full font-black uppercase tracking-wider border transition-all`;

  const typeConfigs = {
    income: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      label: '매출'
    },
    purchase: {
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      label: '매입'
    },
    spending: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      label: '지출'
    }
  };

  const config = typeConfigs[type] || typeConfigs.income;
  const displayLabel = label || config.label;

  return (
    <span className={`${baseClasses} ${config.color} ${sizeClasses[size]} ${className}`}>
      {displayLabel}
    </span>
  );
}
