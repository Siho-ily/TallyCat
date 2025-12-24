'use client';

import React from 'react';
import { Settings, Tag, CreditCard, HardDrive, Download, Upload, Cloud } from 'lucide-react';
import Card from '../ui/Card';

export default function SettingsBackupGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          05. 설정 및 백업 관리
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="카테고리 맞춤 설정" icon={<Tag size={20} className="text-blue-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">설정 &gt; 카테고리 관리</strong>에서
              우리 가게에 맞는 항목을 만드세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong className="text-blue-500">수입 카테고리</strong>: 헤어컷, 파마, 염색 등
              </li>
              <li>
                <strong className="text-amber-500">매입 카테고리</strong>: 재고, 소모품 등
              </li>
              <li>
                <strong className="text-rose-500">지출 카테고리</strong>: 임대료, 인건비 등
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              카테고리를 클릭하면 <strong>이름을 변경</strong>할 수 있고, + 버튼으로 새 항목을
              추가할 수 있습니다. '기본' 카테고리는 시스템 필수 항목으로 삭제할 수 없습니다.
            </p>
          </div>
        </Card>

        <Card title="결제수단 관리" icon={<CreditCard size={20} className="text-emerald-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">설정 &gt; 결제수단 관리</strong>에서
            카드, 현금, 계좌이체 등 사용하는 결제방법을 등록하세요. 카테고리와 마찬가지로 항목을
            클릭하여 이름을 바꾸거나, + 버튼으로 추가, 삭제 버튼으로 제거할 수 있습니다.
          </p>
        </Card>

        <Card title="자동 백업 설정" icon={<HardDrive size={20} className="text-indigo-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">Main과 Sub 백업</strong>은 완전히
              독립적으로 작동합니다:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>Main 백업</strong>: 내부 드라이브에 자주 백업 (예: 매일, 500MB)
              </li>
              <li>
                <strong>Sub 백업</strong>: 외부 드라이브에 장기 보관 (예: 매주, 1GB)
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              각각 백업 경로, 주기(일/주/월), 최대 크기, 보관 기간을 다르게 설정할 수 있습니다.
            </p>
          </div>
        </Card>

        <Card title="수동 백업/복구" icon={<Download size={20} className="text-amber-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            설정 페이지에서 <strong className="text-blue-500">전체 데이터 백업 (JSON)</strong>{' '}
            버튼을 눌러 즉시 백업하거나,
            <strong className="text-emerald-500">백업 데이터 복구 (JSON)</strong> 버튼으로 이전
            시점의 데이터를 불러올 수 있습니다. 중요한 작업 전에는 수동 백업을 권장합니다!
          </p>
        </Card>

        <Card title="엑셀 내보내기/가져오기" icon={<Upload size={20} className="text-rose-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              데이터를 엑셀 파일로 변환하거나 외부 데이터를 불러올 수 있습니다:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>내보내기 (Export)</strong>: XLSX 또는 JSON 형식으로 저장
              </li>
              <li>
                <strong>가져오기 (Import)</strong>: 외부 엑셀 파일을 시스템에 추가
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              세무사에게 자료 전달하거나, 다른 프로그램과 연동할 때 유용합니다.
            </p>
          </div>
        </Card>

        <Card title="클라우드 폴더 활용 팁" icon={<Cloud size={20} className="text-blue-500" />}>
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              💡{' '}
              <strong className="text-gray-900 dark:text-white">
                백업 경로를 OneDrive나 Google Drive 같은 클라우드 폴더로 설정
              </strong>
              하면 PC 문제가 생겨도 데이터를 안전하게 보호할 수 있습니다. 탤리캣은 로컬 전용
              프로그램이므로, 클라우드 백업은 데이터 안전의 핵심입니다!
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
