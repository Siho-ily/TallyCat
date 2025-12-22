'use client';

import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Settings,
  Calendar,
  ShieldCheck,
  Download,
  Terminal
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function GuidePage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="사용자 가이드"
        description="매장 관리 시스템의 주요 기능과 사용 방법을 안내해 드립니다."
        icon={<HelpCircle />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-300">
        <Card title="내역 관리 기초" icon={<BookOpen size={20} />}>
          <div className="space-y-4 font-medium text-sm">
            <p>
              • <strong className="text-white">기록 추가:</strong> 대시보드나 상세 목록 페이지의 +
              버튼을 눌러 수입/지출 내역을 기록할 수 있습니다.
            </p>
            <p>
              • <strong className="text-white">실시간 필터:</strong> 기간별, 유형별, 검색어별로 즉시
              내역을 조회할 수 있습니다.
            </p>
            <p>
              • <strong className="text-white">캘린더 뷰:</strong> 일자별 매출 현황을 한눈에 파악할
              수 있는 달력 모드를 지원합니다.
            </p>
          </div>
        </Card>

        <Card
          title="데이터 보호 정책 (중요)"
          icon={<ShieldCheck size={20} className="text-emerald-400" />}>
          <div className="space-y-4 font-medium text-sm">
            <p>
              본 시스템은 <strong className="text-emerald-400">2중 백업 시스템</strong>을
              운영합니다.
            </p>
            <p>
              • <strong className="text-white">Main 백업:</strong> 짧은 주기로 가장 최신 데이터를
              보관합니다.
            </p>
            <p>
              • <strong className="text-white">Sub 백업:</strong> 더 긴 주기로 과거 데이터를
              안전하게 분산 보관합니다.
            </p>
            <p className="text-gray-500 text-xs mt-2 border-t border-gray-800 pt-2">
              ※ 설정 메뉴에서 각 백업 경로와 주기를 직접 지정할 수 있습니다.
            </p>
          </div>
        </Card>

        <Card title="카테고리 개인화" icon={<Settings size={20} />}>
          <div className="space-y-4 font-medium text-sm">
            <p>
              설정 메뉴에서 <strong className="text-white">카테고리 관리</strong>를 통해 각 매장의
              상황에 맞는 수입/지출 항목을 정의할 수 있습니다.
            </p>
            <p>이미 생성된 카테고리를 삭제하더라도 기존 내역에는 영향을 주지 않습니다.</p>
          </div>
        </Card>

        <Card title="데이터 공유 및 보관" icon={<Download size={20} />}>
          <div className="space-y-4 font-medium text-sm">
            <p>
              • <strong className="text-white">Excel 내보내기:</strong> 세무 신고나 정산을 위해 전체
              내역을 엑셀 파일로 저장할 수 있습니다.
            </p>
            <p>
              • <strong className="text-white">JSON 백업:</strong> 전체 데이터베이스를 파일로
              추출하여 다른 PC로 옮기거나 수동으로 백업할 수 있습니다.
            </p>
          </div>
        </Card>

        <Card
          title="기술 사양"
          icon={<Terminal size={20} className="text-blue-400" />}
          className="md:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl text-center">
              Storage: LowDB v5
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl text-center">
              Runtime: Electron 25
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl text-center">
              Framework: Next.js 13
            </div>
            <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl text-center">
              Style: Tailwind CSS
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
