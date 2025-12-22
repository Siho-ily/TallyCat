'use client';

import React, { useEffect, useState } from 'react';
import { Category, Settings, StorageInfo } from '../../types';
import {
  Settings as SettingsIcon,
  Database,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('income');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cats = await (window as any).ipc.invoke('get-categories');
      const sets = await (window as any).ipc.invoke('get-settings');
      setCategories(cats);
      setSettings(sets);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    await (window as any).ipc.invoke('update-settings', updated);
    setSettings(updated);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await (window as any).ipc.invoke('save-category', { type: newCatType, name: newCatName });
    setNewCatName('');
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('이 카테고리를 삭제하시겠습니까?')) {
      await (window as any).ipc.invoke('delete-category', id);
      fetchData();
    }
  };

  const handleExport = async (format: 'xlsx' | 'json') => {
    const success = await (window as any).ipc.invoke('export-data', format);
    if (success) alert('데이터가 성공적으로 내보내졌습니다.');
  };

  if (loading || !settings)
    return <div className="text-blue-400 animate-pulse">설정을 불러오는 중...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
          <SettingsIcon className="text-blue-400" size={24} />
        </div>
        <h2 className="text-3xl font-black text-white">시스템 설정</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" /> 백업 정책
            </h3>
            <div className="flex justify-between items-center bg-gray-950 p-4 border border-gray-800 rounded-2xl">
              <div>
                <p className="text-sm font-bold">자동 백업 활성화</p>
                <p className="text-xs text-gray-500">지정한 주기마다 자동 백업</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_backup}
                onChange={e => handleUpdateSettings({ auto_backup: e.target.checked })}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">
                  백업 주기 (일)
                </label>
                <input
                  type="number"
                  value={settings.backup_interval}
                  onChange={e =>
                    handleUpdateSettings({ backup_interval: parseInt(e.target.value) || 1 })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/40 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">
                  용량 제한 (GB)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.max_backup_size_gb}
                  onChange={e =>
                    handleUpdateSettings({ max_backup_size_gb: parseFloat(e.target.value) || 1.0 })
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              <BackupPathSelector
                label="메인 백업 경로"
                path={settings.main_backup_path}
                onSelect={async () => {
                  const path = await (window as any).ipc.invoke('select-directory');
                  if (path) handleUpdateSettings({ main_backup_path: path });
                }}
              />
              <BackupPathSelector
                label="서브 백업 경로"
                path={settings.sub_backup_path}
                onSelect={async () => {
                  const path = await (window as any).ipc.invoke('select-directory');
                  if (path) handleUpdateSettings({ sub_backup_path: path });
                }}
              />
            </div>
          </section>
          <section className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Download size={20} className="text-blue-400" /> 데이터 내보내기
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleExport('xlsx')}
                className="flex flex-col items-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/10">
                <FileSpreadsheet className="text-emerald-500 mb-2" size={32} />
                <span className="text-sm font-bold">EXCEL</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex flex-col items-center p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl hover:bg-blue-500/10">
                <FileJson className="text-blue-500 mb-2" size={32} />
                <span className="text-sm font-bold">JSON</span>
              </button>
            </div>
          </section>
        </div>
        <div className="space-y-8">
          <section className="bg-gray-900/50 border border-gray-800 p-6 rounded-3xl space-y-6 min-h-[500px]">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Database size={20} className="text-purple-400" /> 카테고리 설정
            </h3>
            <div className="flex gap-2 bg-gray-950 p-2 rounded-2xl border border-gray-800">
              <select
                value={newCatType}
                onChange={e => setNewCatType(e.target.value as any)}
                className="bg-gray-900 border border-gray-700 text-xs font-bold rounded-xl px-2 py-2 outline-none">
                <option value="income">매출</option>
                <option value="expense">매입</option>
              </select>
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="새 카테고리 이름"
                className="flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button onClick={handleAddCategory} className="bg-blue-600 p-2 rounded-xl text-white">
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[400px]">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest pl-1">
                  매출 항목
                </p>
                {categories
                  .filter(c => c.type === 'income')
                  .map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-900 border border-gray-800 p-3 rounded-xl group">
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest pl-1">
                  매입 항목
                </p>
                {categories
                  .filter(c => c.type === 'expense')
                  .map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-900 border border-gray-800 p-3 rounded-xl group">
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BackupPathSelector({ label, path, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-500 uppercase pl-1">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-400 truncate">
          {path || '경로 미지정'}
        </div>
        <button
          onClick={onSelect}
          className="bg-gray-800 px-4 rounded-xl text-xs font-bold border border-gray-700">
          선택
        </button>
      </div>
    </div>
  );
}
