'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Settings,
  Database,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { storage, settings, refreshData, loading } = useData();

  const navItems = [
    { name: '대시보드', href: '/home', icon: LayoutDashboard },
    { name: '매출/매입 내역', href: '/records', icon: ReceiptText },
    { name: '설정', href: '/settings', icon: Settings },
    { name: '프로그램 가이드', href: '/guide', icon: HelpCircle }
  ];

  return (
    <nav className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl">
      <div className="p-6">
        <h1 className="flex items-center gap-3 text-2xl font-black">
          <img src="/images/logo.png" alt="SPMS Logo" className="w-8 h-8 object-contain" />
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            SPMS
          </span>
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 uppercase tracking-widest font-bold">
          Sales & Purchase Manager
        </p>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <item.icon
                size={20}
                className={
                  isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'
                }
              />
              <span className="font-semibold text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer: Data Health & Backup Status */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="bg-white dark:bg-gray-950/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-800/50 space-y-5">
          {/* 1. Source DB Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Source DB (원본)
                </span>
              </div>
              <button
                onClick={() =>
                  (window as any).refreshing
                    ? null
                    : (async () => {
                        (window as any).refreshing = true;
                        await (refreshData as any)();
                        (window as any).refreshing = false;
                      })()
                }
                className={`text-gray-600 hover:text-blue-400 transition-colors p-1 -m-1 rounded-full hover:bg-gray-800 ${
                  loading ? 'animate-spin opacity-50' : ''
                }`}
                title="데이터 새로고침">
                <RefreshCw size={10} />
              </button>
            </div>
            <p className="text-[16px] font-black text-gray-900 dark:text-white">
              {((storage?.dbSize || 0) / 1024 / 1024).toFixed(2)}{' '}
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold">MB</span>
            </p>
          </div>

          {/* 2. Main Backup Status */}
          <div className="space-y-1.5 grayscale-[0.3] hover:grayscale-0 transition-all">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    storage?.mainPathExists ? 'bg-blue-500' : 'bg-rose-500'
                  }`}
                />
                <span className="text-gray-400">Main Policy</span>
              </div>
              <span className="text-gray-600">
                Limit: {((settings?.main_max_backup_size_mb || 500) / 1024).toFixed(1)}GB
              </span>
            </div>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  (storage?.mainTotalSize || 0) >
                  (settings?.main_max_backup_size_mb || 500) * 1024 * 1024
                    ? 'bg-rose-500'
                    : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    ((storage?.mainTotalSize || 0) /
                      ((settings?.main_max_backup_size_mb || 500) * 1024 * 1024)) *
                      100
                  )}%`
                }}
              />
            </div>
          </div>

          {/* 3. Sub Backup Status */}
          <div className="space-y-1.5 grayscale-[0.3] hover:grayscale-0 transition-all">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    storage?.subPathExists ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="text-gray-400">Sub Policy</span>
              </div>
              <span className="text-gray-600">
                Limit: {((settings?.sub_max_backup_size_mb || 1000) / 1024).toFixed(1)}GB
              </span>
            </div>
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  (storage?.subTotalSize || 0) >
                  (settings?.sub_max_backup_size_mb || 1000) * 1024 * 1024
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    ((storage?.subTotalSize || 0) /
                      ((settings?.sub_max_backup_size_mb || 1000) * 1024 * 1024)) *
                      100
                  )}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
