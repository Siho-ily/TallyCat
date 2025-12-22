'use client';

import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function GlobalModal() {
  const { modalConfig } = useData();
  const { isOpen, type, title, message, onConfirm, onCancel } = modalConfig;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className={`p-4 rounded-3xl ${
                type === 'alert' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
              {type === 'alert' ? <AlertCircle size={40} /> : <HelpCircle size={40} />}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">{title}</h3>
              <p className="text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {type === 'confirm' && (
              <button
                onClick={onCancel}
                className="flex-1 bg-gray-800 text-gray-300 font-black py-4 rounded-2xl hover:bg-gray-700 transition-all border border-gray-700">
                취소
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`flex-1 font-black py-4 rounded-2xl shadow-lg transition-all transform active:scale-95 ${
                type === 'confirm'
                  ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'
                  : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
              }`}>
              {type === 'confirm' ? '확인' : '닫기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
