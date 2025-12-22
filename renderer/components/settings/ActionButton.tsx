'use client';

import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  variant?: 'secondary' | 'danger';
  className?: string;
}

export default function ActionButton({
  icon,
  title,
  desc,
  onClick,
  variant = 'secondary',
  className = ''
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 rounded-3xl border transition-all flex items-center gap-5 text-left group
        ${
          variant === 'danger'
            ? 'bg-rose-600/5 border-rose-600/10 hover:bg-rose-600/10 hover:border-rose-600/30'
            : 'bg-gray-100 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
        }
        ${className}
      `}>
      <div
        className={`p-3 rounded-2xl ${
          variant === 'danger'
            ? 'bg-rose-500/10 text-rose-500'
            : 'bg-gray-200 dark:bg-gray-900 text-blue-500 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
        } transition-all flex-shrink-0`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-black tracking-tight text-lg ${
            variant === 'danger' ? 'text-rose-500' : 'text-gray-900 dark:text-white'
          }`}>
          {title}
        </p>
        <p className="text-xs font-bold text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
