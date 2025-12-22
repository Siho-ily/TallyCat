'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  iconBorder?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-400',
  iconBg = 'bg-blue-600/10',
  iconBorder = 'border-blue-600/20',
  actions
}: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`p-4 ${iconBg} border ${iconBorder} rounded-3xl hidden sm:block`}>
            <Icon className={iconColor} size={32} />
          </div>
        )}
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
          {description && (
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
