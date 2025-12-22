'use client';

import React from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Package,
  PlusCircle,
  FileDown,
  FileUp,
  RotateCcw,
  Zap,
  HardDrive
} from 'lucide-react';

import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import { Button, Input } from '../../components/ui/InputControls';
import { Settings } from '../../types';

export default function SettingsPage() {
  const { categories, settings, loading, refreshData, showAlert, showConfirm, showPrompt } =
    useData();

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    try {
      if (!settings) return;
      await (window as any).ipc.invoke('update-settings', { ...settings, ...newSettings });
      await refreshData();
    } catch (error) {
      showAlert('설정 저장 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleExport = async (format: 'xlsx' | 'json') => {
    try {
      await (window as any).ipc.invoke('export-data', format);
    } catch (error) {
      showAlert('데이터 내보내기 중 오류가 발생했습니다.', '오류');
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
        <Card
          title="데이터 보호 및 백업 정책"
          icon={<ShieldCheck size={24} className="text-emerald-400" />}
          actions={
            <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800 shadow-inner">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                실시간 감시
              </span>
              <input
                type="checkbox"
                checked={settings.auto_backup}
                onChange={e => handleUpdateSettings({ auto_backup: e.target.checked })}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>
          }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BackupConfigPanel
              label="기본(Main) 백업 저장소"
              mode={settings.main_backup_mode}
              interval={settings.main_backup_interval}
              maxSize={settings.main_max_backup_size_mb}
              autoDelete={settings.main_auto_delete_months}
              path={settings.main_backup_path}
              colorClass="text-blue-400"
              dotClass="bg-blue-500"
              onUpdate={handleUpdateSettings}
              prefix="main"
            />
            <BackupConfigPanel
              label="외부(Sub) 백업 저장소"
              mode={settings.sub_backup_mode}
              interval={settings.sub_backup_interval}
              maxSize={settings.sub_max_backup_size_mb}
              autoDelete={settings.sub_auto_delete_months}
              path={settings.sub_backup_path}
              colorClass="text-emerald-400"
              dotClass="bg-emerald-500"
              onUpdate={handleUpdateSettings}
              prefix="sub"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Category Management */}
          <Card title="카테고리 관리" icon={<Package size={24} className="text-blue-400" />}>
            <div className="space-y-8">
              <CategoryList
                type="income"
                title="매출 항목"
                categories={categories.filter(c => c.type === 'income')}
                onAdd={() => handleCategoryAction('add', 'income')}
                onDelete={(id: string) => handleCategoryAction('delete', 'income', id)}
              />
              <div className="h-px bg-gray-800/50 mx-4" />
              <CategoryList
                type="expense"
                title="매입 항목"
                categories={categories.filter(c => c.type === 'expense')}
                onAdd={() => handleCategoryAction('add', 'expense')}
                onDelete={(id: string) => handleCategoryAction('delete', 'expense', id)}
              />
            </div>
          </Card>

          {/* Maintenance Actions */}
          <Card title="시스템 유지보수" icon={<Zap size={24} className="text-amber-400" />}>
            <div className="space-y-6">
              {/* Export/Import Vertical Stack (1 per line) */}
              <div className="flex flex-col gap-4">
                {/* JSON Group */}
                <ActionButton
                  icon={<ShieldCheck />}
                  title="전체 데이터 백업 (JSON)"
                  desc="설정 정보를 포함한 전체 데이터를 파일로 저장합니다"
                  onClick={() => handleExport('json')}
                />
                <ActionButton
                  icon={<RotateCcw />}
                  title="백업 데이터 복구 (JSON)"
                  desc="저장된 JSON 백업 파일로부터 전체 데이터를 복원합니다"
                  onClick={handleImport}
                />

                {/* Excel Group */}
                <ActionButton
                  icon={<FileDown />}
                  title="내역 엑셀로 내보내기"
                  desc="전체 내역을 가공이 용이한 엑셀 파일로 추출합니다"
                  onClick={() => handleExport('xlsx')}
                />
                <ActionButton
                  icon={<FileUp />}
                  title="엑셀 데이터 가져오기"
                  desc="기존 장부 등의 엑셀 데이터를 시스템으로 이전합니다"
                  onClick={async () => {
                    const result = await (window as any).ipc.invoke('import-excel');
                    if (result.success) {
                      showAlert(result.message, '가져오기 완료');
                      await refreshData();
                    } else if (result.message !== '취소되었습니다.') {
                      showAlert(result.message, '실패');
                    }
                  }}
                />
              </div>

              {/* Dangerous Area */}
              <div className="pt-4 border-t border-gray-800/50">
                <ActionButton
                  icon={<RotateCcw />}
                  title="시스템 데이터 완전 초기화"
                  desc="모든 내역과 설정이 영구적으로 삭제됩니다"
                  variant="danger"
                  onClick={() => {
                    showConfirm(
                      '초기화 후에는 데이터를 복구할 수 없습니다. 정말 모든 데이터를 삭제하시겠습니까?',
                      '시스템 초기화 경고',
                      async () => {
                        // Reset logic handled in main if needed
                      }
                    );
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackupConfigPanel({
  label,
  mode,
  interval,
  maxSize,
  autoDelete,
  path: currentPath,
  colorClass,
  dotClass,
  onUpdate,
  prefix
}: any) {
  return (
    <div className="space-y-6 bg-gray-950/30 p-8 rounded-3xl border border-gray-800/50 shadow-inner">
      <div className="flex justify-between items-center">
        <span
          className={`text-[10px] font-black ${colorClass} uppercase tracking-widest flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${dotClass} animate-pulse`} />
          {label}
        </span>
        <select
          value={mode}
          onChange={e => onUpdate({ [`${prefix}_backup_mode`]: e.target.value })}
          className="bg-gray-900 border border-gray-700 text-[10px] font-black rounded-xl px-3 py-1.5 outline-none text-gray-300">
          <option value="interval">일 단위 간격</option>
          <option value="monthly">매달 특정일</option>
        </select>
      </div>

      <div className="space-y-5">
        <Input
          label="백업 주기 설정"
          type="text"
          value={interval.join(', ')}
          onChange={e => {
            const vals = e.target.value
              .split(',')
              .map(v => parseInt(v.trim()))
              .filter(v => !isNaN(v));
            onUpdate({ [`${prefix}_backup_interval`]: vals.length > 0 ? vals : [1] });
          }}
          placeholder={mode === 'monthly' ? '예: 1, 15, 30' : '예: 7'}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">
              용량 제한 ({maxSize}MB)
            </p>
            <div className="px-1">
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={maxSize}
                onChange={e =>
                  onUpdate({ [`${prefix}_max_backup_size_mb`]: parseInt(e.target.value) })
                }
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-800 ${
                  prefix === 'main' ? 'accent-blue-500' : 'accent-emerald-500'
                }`}
              />
              <div className="flex justify-between mt-2 text-[8px] font-black text-gray-600">
                <span>100MB</span>
                <span>10GB</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">
              보관 기간
            </p>
            <select
              value={autoDelete}
              onChange={e =>
                onUpdate({ [`${prefix}_auto_delete_months`]: parseInt(e.target.value) })
              }
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none text-white focus:border-blue-500 transition-colors">
              <option value={0}>전체 보관</option>
              <option value={1}>1개월 후 삭제</option>
              <option value={3}>3개월 후 삭제</option>
              <option value={6}>6개월 후 삭제</option>
              <option value={12}>12개월 후 삭제</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">
            저장 경로
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3.5 text-[11px] font-bold text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
              {currentPath || '미지정'}
            </div>
            <Button
              variant="secondary"
              className="!py-2 !px-4"
              onClick={async () => {
                const path = await (window as any).ipc.invoke('select-directory');
                if (path) onUpdate({ [`${prefix}_backup_path`]: path });
              }}>
              <HardDrive size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryList({ title, categories, onAdd, onDelete }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">
          {title}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          className="!text-[10px] !py-1 !px-2"
          icon={<PlusCircle size={14} />}>
          항목 추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c: any) => (
          <div
            key={c.id}
            className="flex items-center gap-2 bg-gray-900 border border-gray-800 pl-4 pr-2 py-2 rounded-2xl group hover:border-blue-500/50 transition-all shadow-sm">
            <span className="text-xs font-bold text-white">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="p-1 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10 rounded-lg">
              <PlusCircle size={14} className="rotate-45" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-[10px] text-gray-600 font-bold italic pl-1">등록된 항목이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, title, desc, onClick, variant = 'secondary' }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-6 rounded-3xl border transition-all flex items-center gap-5 text-left group
        ${
          variant === 'danger'
            ? 'bg-rose-600/5 border-rose-600/10 hover:bg-rose-600/10 hover:border-rose-600/30'
            : 'bg-gray-950 border-gray-800 hover:bg-gray-900 hover:border-gray-700'
        }
      `}>
      <div
        className={`p-3 rounded-2xl ${
          variant === 'danger'
            ? 'bg-rose-500/10 text-rose-500'
            : 'bg-gray-900 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
        } transition-all flex-shrink-0`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-black tracking-tight text-lg ${
            variant === 'danger' ? 'text-rose-500' : 'text-white'
          }`}>
          {title}
        </p>
        <p className="text-xs font-bold text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
