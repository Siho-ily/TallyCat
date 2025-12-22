'use client';

import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import { Settings } from '../../types';

// Refactored Components
import BackupSection from '../../components/settings/BackupSection';
import CategorySection from '../../components/settings/CategorySection';
import MaintenanceSection from '../../components/settings/MaintenanceSection';
import DangerZoneSection from '../../components/settings/DangerZoneSection';

export default function SettingsPage() {
  const { categories, settings, loading, refreshData, showAlert, showConfirm, showPrompt } =
    useData();
  const [showDebug, setShowDebug] = React.useState(false);

  // --- Handlers ---
  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    try {
      if (!settings) return;
      await (window as any).ipc.invoke('update-settings', { ...settings, ...newSettings });
      await refreshData();
    } catch (error) {
      showAlert('설정 저장 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleExport = async (format: 'xlsx' | 'json'): Promise<boolean> => {
    try {
      const result = await (window as any).ipc.invoke('export-data', format);
      return !!result;
    } catch (error) {
      showAlert('데이터 내보내기 중 오류가 발생했습니다.', '오류');
      return false;
    }
  };

  const handleImport = async () => {
    showConfirm(
      '저장된 백업 파일로 데이터를 복구하시겠습니까? 현재 데이터는 백업 파일의 내용으로 대체됩니다.',
      '데이터 복구 확인',
      async () => {
        try {
          const result = await (window as any).ipc.invoke('import-data');
          if (result.success) {
            showAlert(result.message, '복구 완료');
            await refreshData();
          } else {
            showAlert(result.message, '복구 실패');
          }
        } catch (error) {
          showAlert('데이터를 불러오는 중 오류가 발생했습니다.', '오류');
        }
      }
    );
  };

  const handleCategoryAction = async (
    action: 'add' | 'delete',
    type: 'income' | 'expense',
    id?: string
  ) => {
    try {
      if (action === 'add') {
        showPrompt('새 카테고리 이름을 입력하세요:', '카테고리 추가', async name => {
          if (name && name.trim()) {
            const success = await (window as any).ipc.invoke('save-category', {
              type,
              name: name.trim()
            });
            if (success) await refreshData();
          }
        });
      } else if (action === 'delete' && id) {
        if (confirm('카테고리를 삭제하시겠습니까?')) {
          const success = await (window as any).ipc.invoke('delete-category', id);
          if (success) await refreshData();
        }
      }
    } catch (error: any) {
      console.error('Category action failed:', error);
      const msg = error?.message || '카테고리 수정 중 오류가 발생했습니다.';
      showAlert(msg, '오류');
    }
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    try {
      const success = await (window as any).ipc.invoke('save-category', { id, name: newName });
      if (success) {
        await refreshData();
      } else {
        showAlert('카테고리 수정에 실패했습니다.', '오류');
      }
    } catch (error) {
      console.error('Failed to rename category:', error);
      showAlert('카테고리 이름 변경 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleResetData = () => {
    showConfirm(
      '장부 내역만 초기화하시겠습니까? 카테고리와 시스템 설정은 유지됩니다. 이 작업은 되돌릴 수 없습니다.',
      '데이터 삭제 경고',
      async () => {
        const success = await (window as any).ipc.invoke('reset-data');
        if (success) showAlert('모든 내역이 삭제되었습니다.', '초기화 완료');
        await refreshData();
      }
    );
  };

  const handleResetSystem = () => {
    showConfirm(
      '시스템의 모든 정보를 삭제하고 초기화하시겠습니까? 저장된 모든 데이터가 영구적으로 삭제됩니다.',
      '시스템 전체 초기화 경고',
      async () => {
        const success = await (window as any).ipc.invoke('reset-system');
        if (success) {
          showAlert(
            '시스템이 초기화되었습니다. 프로그램을 다시 시작하거나 데이터를 복구해 주세요.',
            '완전 초기화 완료'
          );
          window.location.reload();
        }
      }
    );
  };

  if (!settings || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader title="시스템 설정" icon={<SettingsIcon />} />

      <div className="space-y-8">
        {/* Backup & Safety Section */}
        <BackupSection settings={settings} onUpdateSettings={handleUpdateSettings} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Categories + Danger Zone */}
          <div className="space-y-8">
            <CategorySection
              categories={categories}
              onAction={handleCategoryAction}
              onRename={handleRenameCategory}
            />
            <DangerZoneSection onResetData={handleResetData} onResetSystem={handleResetSystem} />
          </div>

          {/* Right Column: Maintenance Actions */}
          <MaintenanceSection
            onExport={handleExport}
            onImport={handleImport}
            onRefresh={refreshData}
            showAlert={showAlert}
          />
        </div>
      </div>

      {/* Debug Section */}
      <div className="pt-10 flex flex-col items-center gap-4">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-[9px] font-black text-gray-700 hover:text-gray-500 transition-colors uppercase tracking-[0.2em]">
          {showDebug ? '디버그 정보 숨기기' : '시스템 데이터 조회 (Debug)'}
        </button>

        {showDebug && (
          <div className="w-full bg-gray-950 p-6 rounded-3xl border border-gray-900 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                Raw Settings Data
              </span>
              <span className="text-[9px] text-gray-600 font-bold tracking-tighter tabular-nums">
                TOTAL KEYS: {Object.keys(settings || {}).length}
              </span>
            </div>
            <pre className="text-[10px] text-gray-400 font-mono bg-gray-900/50 p-4 rounded-xl border border-gray-800/50 overflow-x-auto leading-relaxed">
              {JSON.stringify(settings, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
