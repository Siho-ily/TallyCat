'use client';

import React from 'react';
import { Calendar, Search } from 'lucide-react';
import Card from '../ui/Card';

export default function AnalysisGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
        <h2 className="text-xl font-black text-white tracking-tight">02. 내역 분석 및 필터링</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="다양한 보기 모드" icon={<Calendar size={20} className="text-emerald-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-white">목록 뷰</strong>에서는 상세한 내역을 표 형태로 확인하고,
            <strong className="text-white">달력 뷰</strong>에서는 날짜별 매출 합계를 한눈에 파악할
            수 있습니다. 우측 상단의 아이콘으로 간편하게 전환해보세요.
          </p>
        </Card>
        <Card title="강력한 필터 시스템" icon={<Search size={20} className="text-emerald-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            조회하고 싶은 기간(일/주/월/연)을 선택하고 유형이나 카테고리로 좁혀보세요. 상단 통계
            바에서 <strong className="text-white">수입 - 지출 = 순이익</strong>을 즉시 계산하여
            보여줍니다. 복잡한 계산기 없이도 이번 달 매장이 얼마나 벌었는지 바로 확인하세요.
          </p>
        </Card>
      </div>
    </section>
  );
}
