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
        <Card title="2중 자동 백업" icon={<ShieldCheck size={20} className="text-amber-400" />}>
          <p className="text-sm text-gray-400 leading-relaxed">
            설정에서 백업 경로를 지정해두면, PC 내부와 외부 저장소(USB 등) 두 곳에 주기적으로
            데이터를 자동 백업합니다. 컴퓨터 고장 시에도 데이터를 안전하게 복구할 수 있도록{' '}
            <strong className="text-white">자동 백업</strong>을 켜두는 것을 권장합니다.
          </p>
        </Card>
        <Card title="엑셀 활용 및 이전" icon={<FileDown size={20} className="text-amber-400" />}>
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
          <h4 className="text-sm font-black text-white mb-1">매출 증대의 핵심은 '기록'입니다</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            꾸준히 기록된 데이터는 매장의 월간 트렌드와 효자 품목을 분석하는 가장 강력한 무기가
            됩니다. SPMS와 함께 체계적인 매장 관리를 시작해보세요.
          </p>
        </div>
      </div>
    </section>
  );
}
