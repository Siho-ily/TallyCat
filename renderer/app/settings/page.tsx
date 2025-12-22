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
  const { categories, settings, loading, refreshData, showAlert, showConfirm } = useData();

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
    if (action === 'add') {
      const name = prompt('새 카테고리 이름을 입력하세요:');
      if (name) {
        await (window as any).ipc.invoke('save-category', { type, name });
        await refreshData();
      }
    } else if (action === 'delete' && id) {
      if (confirm('카테고리를 삭제하시겠습니까?')) {
        await (window as any).ipc.invoke('delete-category', id);
        await refreshData();
      }
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
            <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800">
              <span className="text-xs font-bold text-gray-400">자동 백업</span>
              <input
                type="checkbox"
                checked={settings.auto_backup}
                onChange={e => handleUpdateSettings({ auto_backup: e.target.checked })}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BackupConfigPanel
              label="메인(Main) 저장 정책"
              mode={settings.main_backup_mode}
              interval={settings.main_backup_interval}
              maxSize={settings.main_max_backup_size_gb}
              autoDelete={settings.main_auto_delete_months}
              path={settings.main_backup_path}
              colorClass="text-blue-400"
              dotClass="bg-blue-500"
              onUpdate={handleUpdateSettings}
              prefix="main"
            />
            <BackupConfigPanel
              label="보조(Sub) 저장 정책"
              mode={settings.sub_backup_mode}
              interval={settings.sub_backup_interval}
              maxSize={settings.sub_max_backup_size_gb}
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
            <div className="space-y-6">
              <CategoryList
                type="income"
                title="매출 카테고리"
                categories={categories.filter(c => c.type === 'income')}
                onAdd={() => handleCategoryAction('add', 'income')}
                onDelete={(id: string) => handleCategoryAction('delete', 'income', id)}
              />
              <CategoryList
                type="expense"
                title="매입 카테고리"
                categories={categories.filter(c => c.type === 'expense')}
                onAdd={() => handleCategoryAction('add', 'expense')}
                onDelete={(id: string) => handleCategoryAction('delete', 'expense', id)}
              />
            </div>
          </Card>

          {/* Maintenance Actions */}
          <Card title="시스템 관리 유틸리티" icon={<Zap size={24} className="text-amber-400" />}>
            <div className="grid grid-cols-1 gap-4">
              <ActionButton
                icon={<FileDown />}
                title="데이터 내보내기"
                desc="엑셀 또는 JSON 파일로 백업"
                onClick={() => handleExport('xlsx')}
              />
              <ActionButton
                icon={<FileUp />}
                title="데이터 불러오기"
                desc="백업 파일로부터 전체 복구"
                onClick={handleImport}
              />
              <ActionButton
                icon={<RotateCcw />}
                title="프로그램 초기화"
                desc="모든 데이터가 삭제됩니다"
                variant="danger"
                onClick={() => {
                  showConfirm(
                    '모든 내역과 설정이 초기화됩니다. 정말 진행하시겠습니까?',
                    '시스템 초기화',
                    async () => {
                      // Implementation for reset if needed
                    }
                  );
                }}
              />
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
    <div className="space-y-6 bg-gray-950/30 p-8 rounded-3xl border border-gray-800/50">
      <div className="flex justify-between items-center mb-2">
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

      <div className="space-y-4">
        <Input
          label="스케줄 구성"
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
          <div className="space-y-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
              용량 제한 ({maxSize}GB)
            </p>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={maxSize}
              onChange={e =>
                onUpdate({ [`${prefix}_max_backup_size_gb`]: parseFloat(e.target.value) })
              }
              className={`w-full ${prefix === 'main' ? 'accent-blue-600' : 'accent-emerald-600'}`}
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
              자동 정리
            </p>
            <select
              value={autoDelete}
              onChange={e =>
                onUpdate({ [`${prefix}_auto_delete_months`]: parseInt(e.target.value) })
              }
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
              <option value={0}>전체 보관</option>
              <option value={1}>1개월 후 삭제</option>
              <option value={3}>3개월 후 삭제</option>
              <option value={6}>6개월 후 삭제</option>
              <option value={12}>12개월 후 삭제</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1 font-black">
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
        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h4>
        <Button variant="ghost" size="sm" onClick={onAdd} icon={<PlusCircle size={14} />}>
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c: any) => (
          <div
            key={c.id}
            className="flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl group hover:border-blue-500/50 transition-all">
            <span className="text-xs font-bold text-gray-300">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
              &times;
            </button>
          </div>
        ))}
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
        } transition-all`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div className="flex-1">
        <p
          className={`font-black tracking-tight ${
            variant === 'danger' ? 'text-rose-500' : 'text-white'
          }`}>
          {title}
        </p>
        <p className="text-xs font-bold text-gray-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}
