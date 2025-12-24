'use client';

import React from 'react';
import {
  ShieldCheck,
  Database,
  AlertTriangle,
  FileDown,
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import Card from '../ui/Card';

export default function DataSafetyGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-rose-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          06. 데이터 안전 관리
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="백업 정책 이해하기" icon={<ShieldCheck size={20} className="text-blue-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              탤리캣의 백업 시스템은{' '}
              <strong className="text-gray-900 dark:text-white">2중 안전망</strong>으로 구성됩니다:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong className="text-blue-500">Main 백업</strong>: 빠른 복구를 위한 단기 백업
              </li>
              <li>
                <strong className="text-emerald-500">Sub 백업</strong>: 장기 보관용 외부 백업
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              각 백업은 독립적으로 작동하여, 하나가 실패해도 다른 쪽에서 데이터를 복구할 수
              있습니다. 최대 크기를 초과하면 오래된 백업부터 자동으로 삭제됩니다.
            </p>
          </div>
        </Card>

        <Card
          title="장부내역 초기화 vs 전체 초기화"
          icon={<AlertTriangle size={20} className="text-rose-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">
                설정 페이지 하단의 위험 구역
              </strong>
              에서 초기화를 실행할 수 있습니다:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong className="text-amber-500">장부내역 초기화</strong>: 모든 거래 내역만 삭제
                (자동화 규칙, 카테고리, 설정은 유지)
              </li>
              <li>
                <strong className="text-rose-500">전체 초기화</strong>: 내역, 자동화 규칙, 카테고리,
                설정, 백업까지 모두 삭제
              </li>
            </ul>
            <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-bold">
              ⚠️ 초기화된 데이터는 복구할 수 없습니다! 반드시 백업 후 실행하세요.
            </p>
          </div>
        </Card>

        <Card title="백업 상태 모니터링" icon={<Database size={20} className="text-emerald-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            좌측 사이드바 하단에서{' '}
            <strong className="text-gray-900 dark:text-white">실시간 백업 상태</strong>를
            확인하세요. 원본 DB 크기, Main/Sub 백업 용량 사용률이 표시됩니다. 용량이 한계에
            가까워지면 빨간색으로 경고하니, 백업 경로를 확인하거나 최대 크기를 늘려주세요.
          </p>
        </Card>

        <Card title="데이터 복구 방법" icon={<RotateCcw size={20} className="text-indigo-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              실수로 데이터를 삭제했거나 문제가 생겼을 때:
            </p>
            <ol className="text-xs text-gray-500 space-y-1.5 ml-4 list-decimal leading-relaxed">
              <li>설정 페이지로 이동</li>
              <li>
                <strong className="text-emerald-500">백업 데이터 복구 (JSON)</strong> 버튼 클릭
              </li>
              <li>복구할 백업 파일 선택 (날짜 확인)</li>
              <li>프로그램 재시작</li>
            </ol>
            <p className="text-xs text-gray-500 leading-relaxed">
              복구하면 현재 데이터는 백업 시점의 데이터로 완전히 대체됩니다.
            </p>
          </div>
        </Card>

        <Card title="문제 해결 가이드" icon={<HelpCircle size={20} className="text-amber-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              자주 발생하는 문제와 해결 방법:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>백업 실패</strong>: 백업 경로 접근 권한 확인, 디스크 공간 확보
              </li>
              <li>
                <strong>엑셀 가져오기 오류</strong>: 파일 형식 확인 (XLSX), 데이터 구조 확인
              </li>
            </ul>
          </div>
        </Card>

        <Card title="정기 점검 체크리스트" icon={<FileDown size={20} className="text-blue-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              매월 또는 분기마다 체크하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>✅ 백업 용량 사용률 확인</li>
              <li>✅ 클라우드 폴더 동기화 상태 확인</li>
              <li>✅ 수동 백업으로 최신 버전 보관</li>
              <li>✅ 엑셀 내보내기로 세무 자료 준비</li>
              <li>✅ 자동화 규칙 실행 이력 점검</li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}
