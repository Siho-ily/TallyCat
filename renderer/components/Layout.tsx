'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ReceiptText,
  Settings,
  Database,
  Activity,
  AlertCircle,
  HardDrive,
  HelpCircle,
  X
} from 'lucide-react';
import { StorageInfo, Settings as SettingsType } from '../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [storage, setStorage] = React.useState<StorageInfo | null>(null);
  const [settings, setSettings] = React.useState<SettingsType | null>(null);
  const [showGuide, setShowGuide] = React.useState(false);

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const storageInfo = await (window as any).ipc.invoke('check-storage');
        const settingsInfo = await (window as any).ipc.invoke('get-settings');
        setStorage(storageInfo);
        setSettings(settingsInfo);
      } catch (e) {
        console.error('Failed to fetch storage info in layout', e);
      }
    };
    fetchStatus();
    // Refresh every 5 mins OR when pathname changes (sync when moving pages)
    const timer = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [pathname]); // Refresh on navigation to sync settings changes

  const navItems = [
    { name: '대시보드', href: '/home', icon: LayoutDashboard },
    { name: '매출/매입 내역', href: '/records', icon: ReceiptText },
    { name: '설정', href: '/settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shadow-xl">
        <div className="p-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
            <Database className="text-blue-400" /> HAIRSHOP
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
            Sales & Backup Manager
          </p>
        </div>

        <div className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <item.icon
                  size={20}
                  className={
                    isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'
                  }
                />
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Data Health & Backup Status */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="bg-gray-950/50 rounded-2xl p-4 border border-gray-800/50 space-y-5">
            {/* 1. Source DB Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Source DB (원본)
                </span>
              </div>
              <p className="text-[16px] font-black text-white">
                {((storage?.dbSize || 0) / 1024 / 1024).toFixed(2)}{' '}
                <span className="text-[10px] text-gray-500 font-bold">MB</span>
              </p>
            </div>

            {/* 2. Main Backup Status */}
            <div className="space-y-1.5 grayscale-[0.3] hover:grayscale-0 transition-all">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      (storage as any)?.mainPathExists ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-gray-400">Main Policy</span>
                </div>
                <span className="text-gray-600">
                  Limit: {settings?.main_max_backup_size_gb || 1.0}GB
                </span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${
                    storage?.limitReached ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      ((storage?.dbSize || 0) /
                        ((settings?.main_max_backup_size_gb || 1.0) * 1024 * 1024 * 1024)) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* 3. Sub Backup Status */}
            <div className="space-y-1.5 grayscale-[0.3] hover:grayscale-0 transition-all">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      (storage as any)?.subPathExists ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <span className="text-gray-400">Sub Policy</span>
                </div>
                <span className="text-gray-600">
                  Limit: {settings?.sub_max_backup_size_gb || 1.0}GB
                </span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      ((storage?.dbSize || 0) /
                        ((settings?.sub_max_backup_size_gb || 1.0) * 1024 * 1024 * 1024)) *
                        100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* 4. Help & Guide Section */}
            <div className="pt-3 border-t border-gray-800/30">
              <button
                onClick={() => setShowGuide(true)}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group text-left">
                <div className="p-1.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <HelpCircle size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                    User Guide
                  </p>
                  <p className="text-[9px] text-gray-500 font-bold">프로그램 사용 가이드</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-[#050505] relative custom-scrollbar">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Help Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowGuide(false)}
          />
          <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <HelpCircle className="text-blue-400" size={24} />
                </div>
                <h2 className="text-2xl font-black text-white">매출 관리 프로그램 사용 가이드</h2>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>
            <div className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-12">
              <section className="space-y-4">
                <h3 className="text-lg font-black text-blue-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  대시보드: 실시간 현황 파악
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  프로그램 시작 시 나타나는 대시보드에서는 한 달 동안의{' '}
                  <span className="text-white font-bold">총 매출, 총 지출, 순이익</span>을 한눈에 볼
                  수 있습니다. 또한 최근 7일간의 매출 흐름을 그래프로 분석하여 매장의 성장세를
                  파악할 수 있습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  내역 관리: 꼼꼼한 기록 생활
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  <span className="text-white font-bold">[내역 관리]</span> 메뉴에서 매출(수입)과
                  매입(지출)을 등록하세요. 날짜, 카테고리, 금액, 메모를 입력할 수 있으며, 상단의
                  검색과 필터 기능을 통해 특정 기간이나 항목의 내역만 골라볼 수 있습니다.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-black text-purple-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  데이터 보호 및 복구
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800">
                    <p className="text-white font-black text-xs mb-2 uppercase tracking-widest text-blue-400">
                      Automatic Backup
                    </p>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      설정한 스케줄에 따라 지정된 경로에 데이터를 자동으로 복사해 둡니다. 사이드바
                      게이지로 상태를 확인하세요.
                    </p>
                  </div>
                  <div className="bg-gray-950 p-5 rounded-3xl border border-gray-800">
                    <p className="text-white font-black text-xs mb-2 uppercase tracking-widest text-emerald-400">
                      Data Restore
                    </p>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      과거의 백업(JSON)을 불러오거나, 기존 엑셀 데이터를 일괄 등록하여 이사할 수
                      있습니다.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-black text-rose-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  운영 설정: 내 매장에 맞게
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  <span className="text-white font-bold">[설정]</span> 메뉴에서는 매장에서 자주
                  사용하는 카테고리를 자유롭게 편집하고, 백업 정책(주기, 용량 제한, 자동 정리 등)을
                  매장 환경에 맞게 조정할 수 있습니다.
                </p>
              </section>
            </div>
            <div className="p-8 bg-gray-950/50 border-t border-gray-800 text-center text-[10px] font-bold text-gray-700 tracking-widest uppercase">
              Sales Management System Guide v1.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
