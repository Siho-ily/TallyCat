'use client';

import React from 'react';
import {
  HelpCircle,
  PlusCircle,
  Search,
  Calendar,
  Settings,
  ShieldCheck,
  FileDown,
  FileUp,
  BarChart3
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function GuidePage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="사용자 가이드"
        description="HairShop Sales Manager를 처음 사용하시나요? 주요 기능과 활용 팁을 안내해 드립니다."
        icon={<HelpCircle />}
      />

      <div className="space-y-12">
        {/* Step 1: 기록하기 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
            <h2 className="text-xl font-black text-white tracking-tight">01. 스마트한 장부 기록</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="빠른 기록 추가" icon={<PlusCircle size={20} className="text-blue-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                대시보드나 내역 페이지의 <strong className="text-white">+ 버튼</strong>을
                눌러보세요. 매출(수입)인 경우에는 금액과 항목을, 재료비나 공과금 같은 지출은
                매입으로 기록하면 됩니다. 간단한 메모를 덧붙여 나중에 기억하기 쉽게 관리할 수
                있습니다.
              </p>
            </Card>
            <Card title="카테고리 활용" icon={<Settings size={20} className="text-gray-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">설정 &gt; 카테고리 관리</strong>에서 우리 매장만의
                전용 항목을 만들어보세요. 커트, 펌, 염색 등 자주 쓰는 매출 항목을 등록해두면 기록할
                때 클릭 한 번으로 입력이 가능합니다.
              </p>
            </Card>
          </div>
        </section>

        {/* Step 2: 분석하기 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
            <h2 className="text-xl font-black text-white tracking-tight">
              02. 내역 분석 및 필터링
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              title="다양한 보기 모드"
              icon={<Calendar size={20} className="text-emerald-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">목록 뷰</strong>에서는 상세한 내역을 표 형태로
                확인하고,
                <strong className="text-white">달력 뷰</strong>에서는 날짜별 매출 합계를 한눈에
                파악할 수 있습니다. 우측 상단의 아이콘으로 간편하게 전환해보세요.
              </p>
            </Card>
            <Card
              title="강력한 필터 시스템"
              icon={<Search size={20} className="text-emerald-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                조회하고 싶은 기간(일/주/월/연)을 선택하고 유형이나 카테고리로 좁혀보세요. 상단에는{' '}
                <strong className="text-white">전체 누적 통계</strong>가, 테이블 하단에는{' '}
                <strong className="text-white">현재 필터링된 범위의 합계</strong>가 표시되어 원하는
                정보를 즉시 알 수 있습니다.
              </p>
            </Card>
          </div>
        </section>

        {/* Step 3: 데이터 관리 */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
            <h2 className="text-xl font-black text-white tracking-tight">
              03. 소중한 데이터 안전하게
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="2중 자동 백업" icon={<ShieldCheck size={20} className="text-amber-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                설정에서 백업 경로를 지정해두면, PC 내부와 외부 저장소(USB 등) 두 곳에 주기적으로
                데이터를 자동 백업합니다. 컴퓨터 고장 시에도 데이터를 안전하게 복구할 수 있도록{' '}
                <strong className="text-white">자동 백업</strong>을 켜두는 것을 권장합니다.
              </p>
            </Card>
            <Card
              title="엑셀 활용 및 이전"
              icon={<FileDown size={20} className="text-amber-400" />}>
              <p className="text-sm text-gray-400 leading-relaxed">
                장부 내역을 <strong className="text-white">엑셀로 내보내기</strong>하여 세무 신고나
                정산에 활용해보세요. 또한, 기존에 쓰던 엑셀 장부 파일을 가져와서 시스템에{' '}
                <strong className="text-white">데이터 덧붙이기</strong> 기능을 사용할 수도 있습니다.
              </p>
            </Card>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 flex-shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-1">
                매출 증대의 핵심은 '기록'입니다
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                꾸준히 기록된 데이터는 매장의 월간 트렌드와 효자 품목을 분석하는 가장 강력한 무기가
                됩니다. HairShop Sales Manager와 함께 체계적인 매장 관리를 시작해보세요.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
