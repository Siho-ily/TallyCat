'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode | LucideIcon;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, icon, actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div className="flex items-center gap-6">
        {icon && (
          <div className="p-5 bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)] rounded-[24px] text-white animate-in zoom-in-50 duration-500">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement, { size: 32, strokeWidth: 2.5 })
              : // @ts-ignore
                React.createElement(icon, { size: 32, strokeWidth: 2.5 })}
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none">{title}</h1>
          {description && (
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] pl-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
