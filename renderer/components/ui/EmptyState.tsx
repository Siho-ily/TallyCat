'use client';

import React from 'react';
import { Database, LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  message?: string;
}

export default function EmptyState({
  icon: Icon = Database,
  message = '등록된 내역이 없습니다.'
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-500">
      <Icon size={48} className="text-gray-800" />
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
}
