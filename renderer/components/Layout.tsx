'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Settings, Database } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: '대시보드', href: '/home', icon: LayoutDashboard },
    { name: '매출/매입 내역', href: '/records', icon: ReceiptText },
    { name: '설정', href: '/settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="text-blue-400" /> HAIRSHOP
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
            Sales & Backup Manager
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
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <item.icon
                  size={20}
                  className={
                    isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'
                  }
                />
                <span className="font-semibold">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
