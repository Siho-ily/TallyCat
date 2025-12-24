'use client';

import React from 'react';
import { Zap, Plus, Power, Edit, CalendarCheck, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

export default function AutomationGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          04. 자동화로 시간 절약하기
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="자동화란?" icon={<Zap size={20} className="text-amber-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">자동화 규칙</strong>은 매월 정기적으로
            발생하는 수입이나 비용을 자동으로 기록하는 기능입니다. 임대료, 인건비, 구독료처럼 매달
            같은 날짜에 반복되는 항목을 한 번만 설정하면 매월 자동으로 내역이 생성되어 수동 입력의
            번거로움을 덜어줍니다.
          </p>
        </Card>

        <Card title="규칙 추가하기" icon={<Plus size={20} className="text-blue-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              우측 상단의 <strong className="text-blue-500">규칙 추가</strong> 버튼을 클릭하세요.
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>이름</strong>: 규칙을 구분할 수 있는 이름 (예: 월세, 직원급여)
              </li>
              <li>
                <strong>유형</strong>: 매출/매입/지출 선택
              </li>
              <li>
                <strong>카테고리</strong>: 적절한 분류 항목
              </li>
              <li>
                <strong>결제수단</strong>: 자동 이체 계좌 등
              </li>
              <li>
                <strong>금액</strong>: 매월 동일한 금액
              </li>
              <li>
                <strong>실행 날짜</strong>: 매월 몇 일에 자동 기록할지 (1~31)
              </li>
            </ul>
          </div>
        </Card>

        <Card title="규칙 관리" icon={<Edit size={20} className="text-indigo-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              등록된 규칙 카드에서 다양한 작업을 수행할 수 있습니다:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong className="text-emerald-500">활성화/비활성화</strong>: 전원 아이콘 클릭
              </li>
              <li>
                <strong className="text-blue-500">편집</strong>: 금액이나 날짜 변경
              </li>
              <li>
                <strong className="text-rose-500">삭제</strong>: 더 이상 필요 없는 규칙 제거
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              비활성화된 규칙은 회색으로 표시되며 자동 실행되지 않습니다.
            </p>
          </div>
        </Card>

        <Card
          title="실행 이력 확인"
          icon={<CalendarCheck size={20} className="text-emerald-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            각 규칙 카드에는{' '}
            <strong className="text-gray-900 dark:text-white">마지막 실행 날짜</strong>가
            표시됩니다. 규칙이 제대로 작동하고 있는지 확인하고, 혹시 누락된 기록이 없는지 점검할 수
            있습니다. 실행된 내역은 일반 기록처럼 매출/비용 내역 페이지에서 수정하거나 삭제할 수
            있습니다.
          </p>
        </Card>

        <Card title="활용 예시" icon={<Zap size={20} className="text-amber-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              자동화 규칙으로 관리하기 좋은 항목들:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>임대료</strong>: 매월 1일 또는 5일
              </li>
              <li>
                <strong>직원급여</strong>: 매월 25일
              </li>
              <li>
                <strong>정기 구독료</strong>: 각종 서비스 요금
              </li>
              <li>
                <strong>고정 매출</strong>: 멤버십, 월 정기권
              </li>
              <li>
                <strong>유틸리티 비용</strong>: 전기, 수도, 인터넷
              </li>
            </ul>
          </div>
        </Card>

        <Card title="주의사항" icon={<AlertTriangle size={20} className="text-rose-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              자동화 규칙 사용 시 참고하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>31일이 없는 달에는 해당 달의 마지막 날에 실행됩니다</li>
              <li>금액이 자주 바뀌는 항목은 수동 기록이 더 정확할 수 있습니다</li>
              <li>규칙을 삭제해도 이미 생성된 내역은 남아있습니다</li>
              <li>프로그램이 꺼져 있어도 다음 실행 시 자동으로 기록됩니다</li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}
