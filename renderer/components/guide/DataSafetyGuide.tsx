'use client';

import React from 'react';
import { ShieldCheck, FileDown, BarChart3 } from 'lucide-react';
import Card from '../ui/Card';

export default function DataSafetyGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
        <h2 className="text-xl font-black text-white tracking-tight">03. 소중한 데이터 안전하게</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="독립적인 맞춤 백업"
          icon={<ShieldCheck size={20} className="text-amber-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            Main(내부)과 Sub(외부) 백업은 <strong className="text-white">완전히 독립적</strong>으로
            작동합니다. 각각 <strong>백업 주기</strong>(예: 매일 vs 매월)와{' '}
            <strong>보관 기간</strong>(자동 삭제 주기)을 다르게 설정하여, 용량 효율과 데이터
            안전성을 모두 챙길 수 있습니다.
          </p>
        </Card>
        <Card
          title="수동 관리 및 엑셀 연동"
          icon={<FileDown size={20} className="text-amber-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            설정 페이지에서 언제든 <strong className="text-white">수동 백업 및 복구</strong>가
            가능합니다. 또한 <strong>엑셀 내보내기</strong>로 데이터를 활용하거나, 외부 엑셀 파일을{' '}
            <strong>가져오기(Import)</strong>하여 기존 데이터와 합칠 수도 있습니다.
          </p>
        </Card>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 flex-shrink-0">
          <BarChart3 size={24} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white mb-1">
            백업 팁: 안전을 위해 클라우드 폴더를 활용해보세요!
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            SPMS는 모든 데이터를 내 컴퓨터(Local)에만 저장합니다.{' '}
            <strong>예기치 못한 PC 문제나 데이터 손실</strong>에 대비하기 위해, 백업 경로를
            OneDrive나 Google Drive 같은 <strong>클라우드 연동 폴더</strong>로 설정하는 것을
            권장합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
