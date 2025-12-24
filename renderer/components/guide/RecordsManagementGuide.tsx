'use client';

import React from 'react';
import { PlusCircle, Edit3, Trash2, Search, Calendar, Filter, List } from 'lucide-react';
import Card from '../ui/Card';

export default function RecordsManagementGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          02. 내역 조회 및 관리
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="내역 추가하기" icon={<PlusCircle size={20} className="text-blue-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              우측 상단의 <strong className="text-blue-500">내역 추가</strong> 버튼을 클릭하세요.
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>날짜와 시간</strong>을 정확히 선택합니다
              </li>
              <li>
                <strong>유형</strong>을 선택하세요 (매출/매입/지출)
              </li>
              <li>
                <strong>카테고리</strong>를 지정하면 나중에 분석이 정확해집니다
              </li>
              <li>
                <strong>금액</strong>을 입력하고 결제수단을 선택합니다
              </li>
              <li>
                간단한 <strong>메모</strong>를 남기면 검색할 때 유용합니다
              </li>
            </ul>
          </div>
        </Card>

        <Card title="내역 수정/삭제" icon={<Edit3 size={20} className="text-indigo-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            테이블 뷰에서 원하는 내역을 클릭하면{' '}
            <strong className="text-gray-900 dark:text-white">상세 모달</strong>이 열립니다. 여기서{' '}
            <strong className="text-blue-500">편집</strong> 버튼으로 수정하거나,{' '}
            <strong className="text-rose-500">삭제</strong> 버튼으로 제거할 수 있습니다. 삭제된
            내역은 복구할 수 없으니 신중하게 선택하세요.
          </p>
        </Card>

        <Card title="전체 누적 통계" icon={<List size={20} className="text-amber-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            필터 영역 상단에는{' '}
            <strong className="text-gray-900 dark:text-white">
              시스템에 등록된 모든 내역의 누적 통계
            </strong>
            가 표시됩니다. 누적 매출, 누적 비용, 그리고 전체 순익을 한눈에 확인할 수 있어 장기적인
            매장 성과를 파악하기 좋습니다.
          </p>
        </Card>

        <Card title="기간별 조회" icon={<Calendar size={20} className="text-rose-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">일일/주간/월간/전체</strong>{' '}
              버튼으로 조회 기간을 변경하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 leading-relaxed">
              <li>
                <strong className="text-blue-500">일일</strong>: 특정 날짜의 상세 내역 (테이블)
              </li>
              <li>
                <strong className="text-blue-500">주간</strong>: 7일 요약 카드 형태
              </li>
              <li>
                <strong className="text-blue-500">월간</strong>: 달력으로 일별 수입/지출 보기
              </li>
              <li>
                <strong className="text-blue-500">전체</strong>: 시작일~종료일 범위 지정
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              날짜 영역을 클릭하면 캘린더 피커가 열리고, 좌우 화살표로 날짜를 이동할 수 있습니다.
            </p>
          </div>
        </Card>

        <Card title="검색과 필터" icon={<Search size={20} className="text-emerald-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              원하는 기록을 빠르게 찾으세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>메모 검색</strong>: 키워드로 기록 찾기
              </li>
              <li>
                <strong>유형 필터</strong>: 전체/매출/매입/지출
              </li>
              <li>
                <strong>카테고리 필터</strong>: 특정 항목만 보기
              </li>
              <li>
                <strong>결제수단 필터</strong>: 카드, 현금 등으로 구분
              </li>
            </ul>
          </div>
        </Card>

        <Card title="뷰 자동 전환" icon={<Filter size={20} className="text-indigo-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            선택한 기간에 따라 뷰가 자동으로 전환됩니다.
            <strong className="text-gray-900 dark:text-white">일일/전체</strong>는 상세 테이블,
            <strong className="text-gray-900 dark:text-white">주간</strong>은 주간 요약 카드,
            <strong className="text-gray-900 dark:text-white">월간</strong>은 달력 뷰로 표시됩니다.
            수십 개의 기록도 페이지네이션으로 쉽게 탐색할 수 있습니다.
          </p>
        </Card>
      </div>
    </section>
  );
}
