'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-bold mb-4">🏠 대시보드 (App Router)</h1>
      <p className="text-gray-400 mb-8">프로그램이 정상적으로 표시되고 있습니다.</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <p className="text-sm text-gray-500 uppercase">상태</p>
          <p className="text-2xl font-bold text-emerald-400">정상 작동 중</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <p className="text-sm text-gray-500 uppercase">연결</p>
          <p className="text-2xl font-bold text-blue-400">로컬 DB 연결됨</p>
        </div>
      </div>

      <div className="mt-10">
        <Link href="/records" className="bg-blue-600 px-6 py-3 rounded-xl font-bold">
          내역 관리로 이동
        </Link>
      </div>
    </div>
  );
}
