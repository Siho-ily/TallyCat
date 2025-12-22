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
            언제든 <strong className="text-white">+ 버튼</strong>을 눌러 내역을 추가할 수 있습니다.
            실수를 줄이기 위해 초기 카테고리는 <strong>'기본'</strong> 상태로 시작하므로, 꼭
            알맞은 항목을 선택해주세요. 금액, 날짜, 간단한 메모를 입력하면 기록이 완료됩니다.
          </p>
        </Card>
        <Card title="카테고리 활용" icon={<Settings size={20} className="text-gray-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">설정 &gt; 카테고리 관리</strong>에서 항목을 추가하거나
            클릭하여 <strong className="text-white">이름을 변경</strong>할 수 있습니다. 단, 시스템
            기본값인 <strong>'기본'</strong> 카테고리는 삭제할 수 없으며, 불필요한 항목은 삭제하여
            정리할 수 있습니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
