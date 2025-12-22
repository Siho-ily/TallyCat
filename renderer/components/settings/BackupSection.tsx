'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Card from '../ui/Card';
import BackupConfigPanel from './BackupConfigPanel';
import { Settings } from '../../types';

interface BackupSectionProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

export default function BackupSection({ settings, onUpdateSettings }: BackupSectionProps) {
  return (
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
            onChange={e => onUpdateSettings({ auto_backup: e.target.checked })}
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
          onUpdate={onUpdateSettings}
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
          onUpdate={onUpdateSettings}
          prefix="sub"
        />
      </div>
    </Card>
  );
}
