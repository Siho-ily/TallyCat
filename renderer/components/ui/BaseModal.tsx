'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = 'max-w-md'
}: BaseModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className={`bg-gray-900 border border-gray-800 w-full ${maxWidth} rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col`}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-400">{icon}</div>}
            <h3 className="text-xl font-black text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">{children}</div>

        {/* Footer */}
        {footer && <div className="p-8 pt-0 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
