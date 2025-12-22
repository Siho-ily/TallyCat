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
import { DateTime } from 'luxon';

import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import { Button, Input } from '../../components/ui/InputControls';
import { Settings } from '../../types';

export default function SettingsPage() {
  const { categories, settings, loading, refreshData, showAlert, showConfirm, showPrompt } =
    useData();
  const [showDebug, setShowDebug] = React.useState(false);

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
                자동 백업 활성화
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
              autoDeleteEnabled={settings.main_auto_delete_enabled}
              retentionYears={settings.main_retention_years}
              retentionMonths={settings.main_retention_months}
              retentionDays={settings.main_retention_days}
              retentionCount={settings.main_retention_count}
              path={settings.main_backup_path}
              lastDate={settings.last_main_backup_date}
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
              autoDeleteEnabled={settings.sub_auto_delete_enabled}
              retentionYears={settings.sub_retention_years}
              retentionMonths={settings.sub_retention_months}
              retentionDays={settings.sub_retention_days}
              retentionCount={settings.sub_retention_count}
              path={settings.sub_backup_path}
              lastDate={settings.last_sub_backup_date}
              colorClass="text-emerald-400"
              dotClass="bg-emerald-500"
              onUpdate={handleUpdateSettings}
              prefix="sub"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Categories + Danger Zone */}
          <div className="space-y-8">
            {/* Category Management */}
            <Card title="카테고리 관리" icon={<Package size={24} className="text-blue-400" />}>
              <div className="space-y-8">
                <CategoryList
                  type="income"
                  title="매출 항목"
                  categories={categories.filter(
                    c => c.type === 'income' && (c as any).is_active !== false
                  )}
                  onAdd={() => handleCategoryAction('add', 'income')}
                  onDelete={(id: string) => handleCategoryAction('delete', 'income', id)}
                />
                <div className="h-px bg-gray-800/50 mx-4" />
                <CategoryList
                  type="expense"
                  title="매입 항목"
                  categories={categories.filter(
                    c => c.type === 'expense' && (c as any).is_active !== false
                  )}
                  onAdd={() => handleCategoryAction('add', 'expense')}
                  onDelete={(id: string) => handleCategoryAction('delete', 'expense', id)}
                />
              </div>
            </Card>

            {/* Dangerous Area - Independent Card */}
            <Card
              title="위험 구역"
              icon={<Zap size={24} className="text-rose-500" />}
              className="border-rose-500/20 bg-rose-500/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">
                    DANGER ZONE
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <ActionButton
                    icon={<RotateCcw />}
                    title="장부 내역만 초기화"
                    desc="카테고리/설정은 유지하고 내역만 삭제합니다"
                    variant="danger"
                    onClick={() => {
                      showConfirm(
                        '장부 내역만 초기화하시겠습니까? 카테고리와 시스템 설정은 유지됩니다. 이 작업은 되돌릴 수 없습니다.',
                        '데이터 삭제 경고',
                        async () => {
                          const success = await (window as any).ipc.invoke('reset-data');
                          if (success) showAlert('모든 내역이 삭제되었습니다.', '초기화 완료');
                          await refreshData();
                        }
                      );
                    }}
                  />
                  <ActionButton
                    icon={<Zap />}
                    title="시스템 전체 초기화"
                    desc="내역, 카테고리, 설정을 모두 초기화합니다"
                    variant="danger"
                    onClick={() => {
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
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Maintenance Actions */}
          <Card title="시스템 유지보수" icon={<Zap size={24} className="text-amber-400" />}>
            <div className="space-y-8">
              {/* Export Group */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <FileDown size={14} className="text-gray-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    데이터 내보내기
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <ActionButton
                    icon={<ShieldCheck />}
                    title="전체 데이터 백업 (JSON)"
                    desc="설정 정보를 포함한 전체 데이터를 파일로 저장합니다"
                    onClick={() => handleExport('json')}
                  />
                  <ActionButton
                    icon={<FileDown />}
                    title="내역 엑셀로 내보내기"
                    desc="전체 내역을 가공이 용이한 엑셀 파일로 추출합니다"
                    onClick={() => handleExport('xlsx')}
                  />
                </div>
              </div>

              <div className="h-px bg-gray-800/50" />

              {/* Import Group */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1 pl-1">
                  <FileUp size={14} className="text-gray-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    데이터 가져오기
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <ActionButton
                    icon={<RotateCcw />}
                    title="백업 데이터 복구 (JSON)"
                    desc="저장된 JSON 백업 파일로부터 전체 데이터를 복원합니다"
                    onClick={handleImport}
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
              </div>
            </div>
          </Card>
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

function BackupConfigPanel({
  label,
  mode,
  interval,
  maxSize,
  autoDeleteEnabled,
  retentionYears,
  retentionMonths,
  retentionDays,
  retentionCount,
  path: currentPath,
  lastDate,
  onUpdate,
  prefix,
  colorClass,
  dotClass
}: any) {
  const [localInterval, setLocalInterval] = React.useState(interval.join(', '));
  const [localMaxSize, setLocalMaxSize] = React.useState(maxSize);

  // Granular Retention Local States
  const [localYears, setLocalYears] = React.useState(retentionYears);
  const [localMonths, setLocalMonths] = React.useState(retentionMonths);
  const [localDays, setLocalDays] = React.useState(retentionDays);
  const [localCount, setLocalCount] = React.useState(retentionCount);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalInterval(interval.join(', '));
    setError(null);
  }, [interval]);

  React.useEffect(() => {
    setLocalMaxSize(maxSize);
  }, [maxSize]);

  React.useEffect(() => {
    setLocalYears(retentionYears);
    setLocalMonths(retentionMonths);
    setLocalDays(retentionDays);
    setLocalCount(retentionCount);
  }, [retentionYears, retentionMonths, retentionDays, retentionCount]);

  const handleApply = () => {
    setError(null);
    const rawValue = localInterval.trim();

    if (!rawValue) {
      setError('주기를 입력해주세요.');
      return;
    }

    if (/[^0-9,\s]/.test(rawValue)) {
      setError('숫자와 쉼표만 입력 가능합니다.');
      return;
    }

    const vals = rawValue
      .split(',')
      .map((v: string) => parseInt(v.trim()))
      .filter((v: number) => !isNaN(v));

    if (vals.length === 0) {
      setError('유효한 숫자를 입력해주세요.');
      return;
    }

    let finalVals: number[] = [];
    if (mode === 'monthly') {
      const invalidDays = vals.filter(d => d < 1 || d > 31);
      if (invalidDays.length > 0) {
        setError('날짜는 1일에서 31일 사이여야 합니다.');
        return;
      }
      finalVals = vals;
    } else {
      if (vals[0] <= 0) {
        setError('간격은 1일 이상이어야 합니다.');
        return;
      }
      finalVals = [vals[0]];
      if (vals.length > 1) {
        setLocalInterval(vals[0].toString());
      }
    }

    if (JSON.stringify(finalVals) !== JSON.stringify(interval)) {
      onUpdate({ [`${prefix}_backup_interval`]: finalVals });
    } else {
      setLocalInterval(finalVals.join(', '));
    }
  };

  const handleMaxSizeApply = () => {
    let val = parseInt(String(localMaxSize));
    if (isNaN(val) || val < 10) {
      val = 100; // Fallback to safe default
    }
    setLocalMaxSize(val);
    if (val !== maxSize) {
      onUpdate({ [`${prefix}_max_backup_size_mb`]: val });
    }
  };

  const handleRetentionUpdate = (field: string, val: any) => {
    let numeric = parseInt(val) || 0;
    if (numeric < 0) numeric = 0;

    onUpdate({ [`${prefix}_retention_${field}`]: numeric });
  };

  const formattedDate = lastDate
    ? DateTime.fromISO(lastDate).toFormat('yyyy-MM-dd HH:mm')
    : '기록 없음';

  return (
    <div className="space-y-6 bg-gray-950/30 p-8 rounded-3xl border border-gray-800/50 shadow-inner">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span
            className={`text-[10px] font-black ${colorClass} uppercase tracking-widest flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${dotClass} animate-pulse`} />
            {label}
          </span>
          <span className="text-[9px] font-bold text-gray-600 pl-4">
            최근 성공: {formattedDate}
          </span>
        </div>
        <select
          value={mode}
          onChange={e => {
            setError(null);
            const newMode = e.target.value;
            if (newMode === 'interval' && interval.length > 1) {
              onUpdate({
                [`${prefix}_backup_mode`]: newMode,
                [`${prefix}_backup_interval`]: [interval[0]]
              });
            } else {
              onUpdate({ [`${prefix}_backup_mode`]: newMode });
            }
          }}
          className="bg-gray-900 border border-gray-700 text-[10px] font-black rounded-xl px-3 py-1.5 outline-none text-gray-300">
          <option value="interval">일 단위 간격</option>
          <option value="monthly">매달 특정일</option>
        </select>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Input
            label={mode === 'monthly' ? '백업 날짜 (여러 날짜 가능)' : '백업 간격 (일)'}
            type="text"
            value={localInterval}
            onChange={e => {
              setLocalInterval(e.target.value);
              if (error) setError(null);
            }}
            onBlur={handleApply}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleApply();
                (e.target as any).blur();
              }
            }}
            placeholder={mode === 'monthly' ? '예: 1, 15, 30' : '예: 7'}
            desc={
              mode === 'interval'
                ? '입력한 일수마다 백업을 수행합니다. (하나의 숫자만 입력)'
                : '쉼표(,)로 구분하여 여러 날짜를 입력할 수 있습니다.'
            }
          />
          {error && (
            <p className="text-[10px] font-bold text-rose-500 pl-1 animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input
              label="용량 제한 (MB)"
              type="text"
              value={localMaxSize}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setLocalMaxSize(val);
              }}
              onBlur={handleMaxSizeApply}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleMaxSizeApply();
                  (e.target as any).blur();
                }
              }}
              placeholder="예: 100"
              desc="지정한 용량이 넘어가면 게이지가 붉은색으로 변합니다."
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pr-2">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">
                자동 삭제 정책
              </span>
              <input
                type="checkbox"
                checked={autoDeleteEnabled}
                onChange={e => onUpdate({ [`${prefix}_auto_delete_enabled`]: e.target.checked })}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>
            <div
              className={`space-y-3 transition-all ${
                autoDeleteEnabled ? 'opacity-100' : 'opacity-30 pointer-events-none grayscale'
              }`}>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <span className="text-[8px] font-black text-gray-700 uppercase pl-1">년</span>
                  <input
                    type="number"
                    value={localYears}
                    onChange={e => setLocalYears(e.target.value)}
                    onBlur={e => handleRetentionUpdate('years', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[8px] font-black text-gray-700 uppercase pl-1">월</span>
                  <input
                    type="number"
                    value={localMonths}
                    onChange={e => setLocalMonths(e.target.value)}
                    onBlur={e => handleRetentionUpdate('months', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-[8px] font-black text-gray-700 uppercase pl-1">일</span>
                  <input
                    type="number"
                    value={localDays}
                    onChange={e => setLocalDays(e.target.value)}
                    onBlur={e => handleRetentionUpdate('days', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-2 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black text-gray-700 uppercase pl-1">
                  최대 보관 개수
                </span>
                <input
                  type="number"
                  value={localCount}
                  onChange={e => setLocalCount(e.target.value)}
                  onBlur={e => handleRetentionUpdate('count', e.target.value)}
                  placeholder="무제한: 0"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">
            저장 경로
          </p>
          <div className="flex gap-2 items-start">
            <div
              title={currentPath || '미지정'}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3.5 text-[11px] font-bold text-gray-400 break-all leading-relaxed min-h-[52px]">
              {currentPath || '미지정'}
            </div>
            <Button
              variant="secondary"
              className="!py-4 !px-4"
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
