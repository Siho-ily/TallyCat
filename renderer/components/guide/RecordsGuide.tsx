'use client';

import React from 'react';
import { PlusCircle, Settings } from 'lucide-react';
import Card from '../ui/Card';

export default function RecordsGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-black text-white tracking-tight">01. 스마트한 장부 기록</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="빠른 기록 추가" icon={<PlusCircle size={20} className="text-blue-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            대시보드나 내역 페이지의 <strong className="text-white">+ 버튼</strong>을 눌러보세요.
            매출(수입)인 경우에는 금액과 항목을, 재료비나 공과금 같은 지출은 매입으로 기록하면
            됩니다. 간단한 메모를 덧붙여 나중에 기억하기 쉽게 관리할 수 있습니다.
          </p>
        </Card>
        <Card title="카테고리 활용" icon={<Settings size={20} className="text-gray-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">설정 &gt; 카테고리 관리</strong>에서 우리 매장만의 전용
            항목을 만들어보세요. 커트, 펌, 염색 등 자주 쓰는 매출 항목을 등록해두면 기록할 때 클릭
            한 번으로 입력이 가능합니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
