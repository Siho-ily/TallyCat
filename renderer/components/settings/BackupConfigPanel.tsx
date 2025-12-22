'use client';

import React from 'react';
import { HardDrive } from 'lucide-react';
import { DateTime } from 'luxon';
import { Button, Input } from '../ui/InputControls';
import RetentionInputGroup from './RetentionInputGroup';
import { Settings } from '../../types';

interface BackupConfigPanelProps {
  label: string;
  mode: 'interval' | 'monthly';
  interval: number[];
  maxSize: number;
  autoDeleteEnabled: boolean;
  retentionYears: number;
  retentionMonths: number;
  retentionDays: number;
  retentionCount: number;
  path: string;
  lastDate: string;
  onUpdate: (settings: Partial<Settings>) => void;
  prefix: 'main' | 'sub';
  colorClass: string;
  dotClass: string;
}

export default function BackupConfigPanel({
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
}: BackupConfigPanelProps) {
  const [localInterval, setLocalInterval] = React.useState<string>((interval || []).join(', '));
  const [localMaxSize, setLocalMaxSize] = React.useState<string>((maxSize || 0).toString());

  // Granular Retention Local States
  const [localYears, setLocalYears] = React.useState<string>((retentionYears || 0).toString());
  const [localMonths, setLocalMonths] = React.useState<string>((retentionMonths || 0).toString());
  const [localDays, setLocalDays] = React.useState<string>((retentionDays || 0).toString());
  const [localCount, setLocalCount] = React.useState<string>((retentionCount || 0).toString());

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalInterval((interval || []).join(', '));
    setError(null);
  }, [interval]);

  React.useEffect(() => {
    setLocalMaxSize((maxSize || 0).toString());
  }, [maxSize]);

  React.useEffect(() => {
    setLocalYears((retentionYears || 0).toString());
    setLocalMonths((retentionMonths || 0).toString());
    setLocalDays((retentionDays || 0).toString());
    setLocalCount((retentionCount || 0).toString());
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
    setLocalMaxSize(val.toString());
    if (val !== maxSize) {
      onUpdate({ [`${prefix}_max_backup_size_mb`]: val });
    }
  };

  const handleRetentionUpdate = (field: 'years' | 'months' | 'days' | 'count', val: string) => {
    let numeric = parseInt(val) || 0;
    if (numeric < 0) numeric = 0;

    onUpdate({ [`${prefix}_retention_${field}`]: numeric });
  };

  const formattedDate = lastDate
    ? DateTime.fromISO(lastDate).toFormat('yyyy-MM-dd HH:mm')
    : '기록 없음';

  return (
    <div className="space-y-6 bg-gray-100 dark:bg-gray-950/30 p-8 rounded-3xl border border-gray-200 dark:border-gray-800/50 shadow-inner">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span
            className={`text-[10px] font-black ${colorClass} uppercase tracking-widest flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${dotClass} animate-pulse`} />
            {label}
          </span>
          <span className="text-[9px] font-bold text-gray-500 dark:text-gray-600 pl-4">
            최근 성공: {formattedDate}
          </span>
        </div>
        <select
          value={mode}
          onChange={e => {
            setError(null);
            const newMode = e.target.value as 'interval' | 'monthly';
            if (newMode === 'interval' && interval.length > 1) {
              onUpdate({
                [`${prefix}_backup_mode`]: newMode,
                [`${prefix}_backup_interval`]: [interval[0]]
              });
            } else {
              onUpdate({ [`${prefix}_backup_mode`]: newMode });
            }
          }}
          className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-[10px] font-black rounded-xl px-3 py-1.5 outline-none text-gray-900 dark:text-gray-300">
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
              <span className="text-[10px] text-gray-600 dark:text-gray-500 font-black uppercase tracking-widest pl-1">
                자동 삭제 정책
              </span>
              <input
                type="checkbox"
                checked={autoDeleteEnabled}
                onChange={e => onUpdate({ [`${prefix}_auto_delete_enabled`]: e.target.checked })}
                className="w-4 h-4 accent-rose-500 cursor-pointer"
              />
            </div>
            <RetentionInputGroup
              years={localYears}
              months={localMonths}
              days={localDays}
              count={localCount}
              onYearsChange={setLocalYears}
              onMonthsChange={setLocalMonths}
              onDaysChange={setLocalDays}
              onCountChange={setLocalCount}
              onYearsBlur={value => handleRetentionUpdate('years', value)}
              onMonthsBlur={value => handleRetentionUpdate('months', value)}
              onDaysBlur={value => handleRetentionUpdate('days', value)}
              onCountBlur={value => handleRetentionUpdate('count', value)}
              disabled={!autoDeleteEnabled}
            />
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
