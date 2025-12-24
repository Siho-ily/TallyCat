'use client';

import React from 'react';
import { Sparkles, Moon, Sun, LayoutDashboard } from 'lucide-react';
import Card from '../ui/Card';

export default function GettingStartedGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          01. 탤리캣 시작하기
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="탤리캣 소개" icon={<Sparkles size={20} className="text-blue-400" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">탤리캣 (TallyCat)</strong>은 오프라인
            가게를 위한 장부 관리 프로그램입니다. 복잡한 회계 지식 없이도 매출과 비용을 간편하게
            기록하고, 실시간으로 수익을 분석할 수 있습니다. 모든 데이터는{' '}
            <strong className="text-gray-900 dark:text-white">내 컴퓨터에만 저장</strong>되어 완벽한
            프라이버시를 보장합니다.
          </p>
        </Card>

        <Card
          title="메인 화면 구성"
          icon={<LayoutDashboard size={20} className="text-emerald-400" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              좌측 <strong className="text-gray-900 dark:text-white">사이드바</strong>에서 주요
              메뉴를 선택하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 leading-relaxed">
              <li>
                <strong className="text-blue-500">대시보드</strong>: 이번 달 요약 통계
              </li>
              <li>
                <strong className="text-blue-500">매출/비용 내역</strong>: 모든 거래 기록 조회 및
                관리
              </li>
              <li>
                <strong className="text-blue-500">분석</strong>: 차트와 그래프로 매장 흐름 파악
              </li>
              <li>
                <strong className="text-blue-500">자동화</strong>: 정기 지출/수입 자동 등록
              </li>
              <li>
                <strong className="text-blue-500">설정</strong>: 카테고리, 백업, 데이터 관리
              </li>
            </ul>
          </div>
        </Card>

        <Card title="다크 모드 전환" icon={<Moon size={20} className="text-indigo-400" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            우측 상단의 <strong className="text-gray-900 dark:text-white">해/달 아이콘</strong>을
            클릭하면 라이트 모드와 다크 모드를 자유롭게 전환할 수 있습니다. 눈의 피로를 줄이고
            싶다면 다크 모드를, 밝은 환경에서는 라이트 모드를 추천합니다.
          </p>
        </Card>

        <Card title="첫 기록 남기기" icon={<Sparkles size={20} className="text-amber-400" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            대시보드나 매출/비용 내역 페이지에서 우측 상단의{' '}
            <strong className="text-blue-500">내역 추가</strong> 버튼을 클릭하세요. 날짜, 금액,
            카테고리만 입력하면 바로 기록이 완료됩니다. 간단한 메모를 덧붙이면 나중에 확인하기 더
            편리합니다!
          </p>
        </Card>
      </div>
    </section>
  );
}
