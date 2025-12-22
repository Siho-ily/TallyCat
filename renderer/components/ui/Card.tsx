'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function Card({
  children,
  title,
  icon,
  actions,
  className = '',
  noPadding = false
}: CardProps) {
  return (
    <section
      className={`bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl transition-all hover:border-gray-300 dark:hover:border-gray-700/50 ${className}`}>
      {(title || icon || actions) && (
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-100 dark:bg-gray-900/30">
          <div className="flex items-center gap-3">
            {icon && <div className="text-blue-500 dark:text-blue-400">{icon}</div>}
            {title && <h3 className="text-xl font-black text-gray-900 dark:text-white">{title}</h3>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-8'}>{children}</div>
    </section>
  );
}
