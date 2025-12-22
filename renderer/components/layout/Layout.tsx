'use client';

import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-gray-50 dark:bg-[#050505] relative custom-scrollbar">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
