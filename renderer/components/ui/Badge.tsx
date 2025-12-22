'use client';

import React from 'react';

interface BadgeProps {
  type: 'income' | 'expense';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({ type, label, size = 'md', className = '' }: BadgeProps) {
  const isIncome = type === 'income';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'px-3 py-1 text-[10px]',
    lg: 'px-4 py-1.5 text-xs'
  };

  const baseClasses = `rounded-full font-black uppercase tracking-wider border transition-all`;
  const colorClasses = isIncome
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-rose-500/10 text-rose-400 border-rose-500/20';

  const defaultLabel = isIncome ? '매출' : '매입';
  const displayLabel = label || defaultLabel;

  return (
    <span className={`${baseClasses} ${colorClasses} ${sizeClasses[size]} ${className}`}>
      {displayLabel}
    </span>
  );
}
