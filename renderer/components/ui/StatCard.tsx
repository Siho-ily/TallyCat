'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

export default function StatCard({ title, value, icon: Icon, color, bg, border }: StatCardProps) {
  return (
    <div
      className={`p-6 rounded-3xl border ${border} ${bg} shadow-sm transition-all hover:translate-y-[-4px]`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} border ${border}`}>
          <Icon className={color} size={24} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400">{title}</p>
        <p className={`text-2xl font-black ${color} mt-1`}>{value.toLocaleString()}원</p>
      </div>
    </div>
  );
}
