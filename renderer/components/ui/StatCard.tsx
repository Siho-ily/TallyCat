'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'emerald' | 'rose' | 'blue' | 'amber';
}

export default function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  const colorMap = {
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      trendText: 'text-emerald-500'
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      trendText: 'text-rose-500'
    },
    blue: {
      text: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      trendText: 'text-blue-500'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      trendText: 'text-amber-500'
    }
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`p-8 rounded-[40px] border border-gray-800 bg-gray-900/50 shadow-xl transition-all hover:border-gray-700/50 hover:translate-y-[-4px] group relative overflow-hidden`}>
      {/* Decorative gradient */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-current ${scheme.text}`}
      />

      <div className="flex justify-between items-start mb-6">
        <div
          className={`p-4 rounded-3xl ${scheme.bg} border ${scheme.border} ${scheme.text} shadow-inner`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-950 border border-gray-800 shadow-sm`}>
            <span
              className={`text-[10px] font-black ${
                trend.isUp ? 'text-emerald-500' : 'text-rose-500'
              }`}>
              {trend.isUp ? '↑' : '↓'} {trend.value}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</p>
        <p className={`text-2xl font-black text-white tracking-tight`}>
          {typeof value === 'number' ? `${value.toLocaleString()}원` : value}
        </p>
      </div>
    </div>
  );
}
