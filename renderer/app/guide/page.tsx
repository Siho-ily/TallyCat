'use client';

import React from 'react';
import {
  HelpCircle,
  Database,
  TrendingUp,
  ShieldCheck,
  Download,
  Settings,
  FileUp,
  RotateCcw
} from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

export default function GuidePage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700 max-w-4xl mx-auto pb-20">
      <PageHeader
        title="프로그램 사용 가이드"
        description="Sales Management System User Manual"
        icon={HelpCircle}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-[40px] space-y-4 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <TrendingUp className="text-blue-400" size={20} />
            </div>
            <h3 className="text-xl font-black text-white">대시보드: 실시간 현황</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            프로그램 시작 시 나타나는 대시보드에서는 한 달 동안의{' '}
            <span className="text-blue-400">총 매출, 총 지출, 순이익</span>을 실시간으로 확인합니다.
            최근 7일간의 지표를 통해 매장 흐름을 파악하세요.
          </p>
        </section>

        <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-[40px] space-y-4 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <Database className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-xl font-black text-white">내역 관리: 데이터 기록</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed font-medium">
            <span className="text-emerald-400">매출/매입 내역</span> 메뉴에서 일상의 금융 흐름을
            기록하세요. 상단의 필터와 검색 기능을 통해 원하는 데이터를 즉시 찾아낼 수 있습니다.
          </p>
        </section>
      </div>

      <section className="bg-gray-900/50 border border-gray-800 p-10 rounded-[40px] space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
          <ShieldCheck className="text-purple-400" size={24} />
          <h3 className="text-2xl font-black text-white">데이터 보호 및 복구</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3 bg-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Auto Backup
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              설정한 주기에 맞춰 지정된 두 곳의 경로에 데이터를 자동으로 백업합니다. 사이드바의
              게이지는 백업 용량 상태를 실시간으로 보여줍니다.
            </p>
          </div>

          <div className="space-y-3 bg-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-purple-500/20 transition-all">
            <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
              <RotateCcw size={14} /> JSON Restore
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              프로그램 설정과 모든 데이터를 과거 특정 시점으로 완벽하게 되돌리고 싶을 때 사용합니다.
              설정 페이지에서 JSON 백업 파일을 선택하세요.
            </p>
          </div>

          <div className="space-y-3 bg-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
              <FileUp size={14} /> Excel Import
            </div>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              기존에 쓰던 엑셀 파일이 있다면 한꺼번에 데이터를 앱으로 가져올 수 있습니다.
              날짜/금액/유형 열이 포함된 파일을 선택하기만 하면 됩니다.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900/50 border border-gray-800 p-10 rounded-[40px] space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="text-rose-400" size={24} />
          <h3 className="text-2xl font-black text-white">맞춤형 환경 설정</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed font-medium">
          <span className="text-white font-black">[설정]</span> 메뉴에서는 매장의 카테고리를
          편집하거나 백업 주기, 용량 제한 등을 매장 운영 환경에 최적화하여 설정할 수 있습니다.
        </p>
      </section>

      <div className="text-center pt-8">
        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
          Sales Management System Guide v1.1 • Final Edition
        </p>
      </div>
    </div>
  );
}
