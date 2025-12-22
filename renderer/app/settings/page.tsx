'use client';

import React, { useEffect, useState } from 'react';
import { Category, Settings, StorageInfo } from '../../types';
import {
  Settings as SettingsIcon,
  Database,
  Download,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  FolderOpen,
  RotateCcw,
  Trash2,
  Plus,
  ShieldCheck,
  FileUp
} from 'lucide-react';

import { useData } from '../../context/DataContext';
import PageHeader from '../../components/ui/PageHeader';

export default function SettingsPage() {
  const { categories, settings, loading, refreshData, showAlert, showConfirm } = useData();
  const [error, setError] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('income');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    await (window as any).ipc.invoke('update-settings', updated);
    refreshData();
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim() || isSubmittingCat) return;
    try {
      setIsSubmittingCat(true);
      await (window as any).ipc.invoke('save-category', { type: newCatType, name: newCatName });
      setNewCatName('');
      refreshData();
    } catch (e) {
      console.error(e);
      showAlert('카테고리 추가에 실패했습니다.', '오류');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    showConfirm('이 카테고리를 삭제하시겠습니까?', '카테고리 삭제', async () => {
      await (window as any).ipc.invoke('delete-category', id);
      refreshData();
    });
  };

  const handleExport = async (format: 'xlsx' | 'json') => {
    try {
      const result = await (window as any).ipc.invoke('export-data', format);
      if (result) showAlert('데이터를 성공적으로 내보냈습니다.', '내보내기 완료');
    } catch (error) {
      console.error('Export failed:', error);
      showAlert('데이터 내보내기 중 오류가 발생했습니다.', '오류');
    }
  };

  const handleImport = async () => {
    showConfirm(
      '데이터를 불러오면 현재 저장된 모든 내역이 사라지고 백업 파일의 내용으로 교체됩니다. 정말로 복구하시겠습니까?',
      '데이터 복구 확인',
      async () => {
        try {
          const result = await (window as any).ipc.invoke('import-data');
          showAlert(result.message, result.success ? '복구 완료' : '복구 실패');
          if (result.success) {
            refreshData();
          }
        } catch (error) {
          console.error('Import failed:', error);
          showAlert('데이터를 불러오는 중 오류가 발생했습니다.', '오류');
        }
      }
    );
  };

  const handleImportExcel = async () => {
    showConfirm(
      '엑셀 내역을 현재 장부에 추가합니다. 날짜, 금액, 유형(수입/지출), 카테고리 컬럼이 포함된 파일이어야 합니다. 계속하시겠습니까?',
      '엑셀 가져오기 확인',
      async () => {
        try {
          const result = await (window as any).ipc.invoke('import-excel');
          showAlert(result.message, result.success ? '가져오기 완료' : '가져오기 실패');
          if (result.success) {
            refreshData();
          }
        } catch (error) {
          console.error('Excel Import failed:', error);
          showAlert('엑셀 데이터를 불러오는 중 오류가 발생했습니다.', '오류');
        }
      }
    );
  };

  if (loading) return <div className="text-blue-400 animate-pulse">설정을 불러오는 중...</div>;

  if (error)
    return (
      <div className="text-rose-400 p-10 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
        {error}
      </div>
    );

  if (!settings) return <div className="text-yellow-400 p-10">설정 정보가 없습니다.</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader title="시스템 설정" icon={SettingsIcon} />

      <div className="space-y-8">
        {/* Backup & Safety Section - Full Width */}
        <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl space-y-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-6">
            <h3 className="text-xl font-black flex items-center gap-3">
              <ShieldCheck size={24} className="text-emerald-400" /> 데이터 보호 및 백업 정책
            </h3>
            <div className="flex items-center gap-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800">
              <span className="text-xs font-bold text-gray-400">자동 백업</span>
              <input
                type="checkbox"
                checked={settings.auto_backup}
                onChange={e => handleUpdateSettings({ auto_backup: e.target.checked })}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Backup Config */}
            <div className="space-y-6 bg-gray-950/30 p-8 rounded-3xl border border-gray-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  메인(Main) 저장 정책
                </span>
                <select
                  value={settings.main_backup_mode}
                  onChange={e => handleUpdateSettings({ main_backup_mode: e.target.value as any })}
                  className="bg-gray-900 border border-gray-700 text-[10px] font-black rounded-xl px-3 py-1.5 outline-none text-gray-300">
                  <option value="interval">일 단위 간격</option>
                  <option value="monthly">매달 특정일 (복수 가능)</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                    스케줄 입력
                  </p>
                  <input
                    type="text"
                    value={settings.main_backup_interval.join(', ')}
                    onChange={e => {
                      const vals = e.target.value
                        .split(',')
                        .map(v => parseInt(v.trim()))
                        .filter(v => !isNaN(v));
                      handleUpdateSettings({ main_backup_interval: vals.length > 0 ? vals : [1] });
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/40 outline-none"
                    placeholder={
                      settings.main_backup_mode === 'monthly' ? '예: 1, 15, 30' : '예: 7'
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                      용량 제한 ({settings.main_max_backup_size_gb}GB)
                    </p>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={settings.main_max_backup_size_gb}
                      onChange={e =>
                        handleUpdateSettings({
                          main_max_backup_size_gb: parseFloat(e.target.value)
                        })
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                      자동 정리
                    </p>
                    <select
                      value={settings.main_auto_delete_months}
                      onChange={e =>
                        handleUpdateSettings({ main_auto_delete_months: parseInt(e.target.value) })
                      }
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                      <option value={0}>전체 보관</option>
                      <option value={1}>1개월 후 삭제</option>
                      <option value={3}>3개월 후 삭제</option>
                      <option value={6}>6개월 후 삭제</option>
                    </select>
                  </div>
                </div>

                <BackupPathSelector
                  label="메인 저장 경로"
                  path={settings.main_backup_path}
                  onSelect={async () => {
                    const path = await (window as any).ipc.invoke('select-directory');
                    if (path) handleUpdateSettings({ main_backup_path: path });
                  }}
                />
              </div>
            </div>

            {/* Sub Backup Config */}
            <div className="space-y-6 bg-gray-950/30 p-8 rounded-3xl border border-gray-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  보조(Sub) 저장 정책
                </span>
                <select
                  value={settings.sub_backup_mode}
                  onChange={e => handleUpdateSettings({ sub_backup_mode: e.target.value as any })}
                  className="bg-gray-900 border border-gray-700 text-[10px] font-black rounded-xl px-3 py-1.5 outline-none text-gray-300">
                  <option value="interval">일 단위 간격</option>
                  <option value="monthly">매달 특정일 (복수 가능)</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                    스케줄 입력
                  </p>
                  <input
                    type="text"
                    value={settings.sub_backup_interval.join(', ')}
                    onChange={e => {
                      const vals = e.target.value
                        .split(',')
                        .map(v => parseInt(v.trim()))
                        .filter(v => !isNaN(v));
                      handleUpdateSettings({ sub_backup_interval: vals.length > 0 ? vals : [1] });
                    }}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/40 outline-none"
                    placeholder={settings.sub_backup_mode === 'monthly' ? '예: 1, 15, 30' : '예: 7'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                      용량 제한 ({(settings.sub_max_backup_size_gb || 1.0).toFixed(1)}GB)
                    </p>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={settings.sub_max_backup_size_gb || 1.0}
                      onChange={e =>
                        handleUpdateSettings({ sub_max_backup_size_gb: parseFloat(e.target.value) })
                      }
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                      자동 정리
                    </p>
                    <select
                      value={settings.sub_auto_delete_months}
                      onChange={e =>
                        handleUpdateSettings({ sub_auto_delete_months: parseInt(e.target.value) })
                      }
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs font-bold outline-none">
                      <option value={0}>전체 보관</option>
                      <option value={6}>6개월 후 삭제</option>
                      <option value={12}>12개월 후 삭제</option>
                      <option value={24}>24개월 후 삭제</option>
                    </select>
                  </div>
                </div>

                <BackupPathSelector
                  label="보조 저장 경로"
                  path={settings.sub_backup_path}
                  onSelect={async () => {
                    const path = await (window as any).ipc.invoke('select-directory');
                    if (path) handleUpdateSettings({ sub_backup_path: path });
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Database size={24} className="text-purple-400" /> 카테고리 관리
            </h3>
            <div className="flex gap-2 bg-gray-950 p-2 rounded-2xl border border-gray-800">
              <select
                value={newCatType}
                onChange={e => setNewCatType(e.target.value as any)}
                className="bg-gray-900 border border-gray-700 text-xs font-bold rounded-xl px-3 py-2 outline-none">
                <option value="income">매출</option>
                <option value="expense">매입</option>
              </select>
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="새 카테고리 추가..."
                disabled={isSubmittingCat}
                className="flex-1 bg-transparent px-3 text-sm font-medium outline-none disabled:opacity-50"
              />
              <button
                onClick={handleAddCategory}
                disabled={isSubmittingCat}
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-xl text-white transition-colors disabled:bg-gray-700">
                <Plus size={24} className={isSubmittingCat ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest pl-1 mb-3">
                  매출 항목
                </p>
                {categories
                  .filter(c => c.type === 'income')
                  .map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-950 border border-gray-800/50 px-4 py-3 rounded-2xl group hover:border-emerald-500/30 transition-all">
                      <span className="text-sm font-bold text-gray-300">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest pl-1 mb-3">
                  매입 항목
                </p>
                {categories
                  .filter(c => c.type === 'expense')
                  .map(cat => (
                    <div
                      key={cat.id}
                      className="flex justify-between items-center bg-gray-950 border border-gray-800/50 px-4 py-3 rounded-2xl group hover:border-rose-500/30 transition-all">
                      <span className="text-sm font-bold text-gray-300">{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <section className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl space-y-6 shadow-xl flex flex-col">
            <h3 className="text-xl font-black flex items-center gap-3">
              <Download size={24} className="text-blue-400" /> 데이터 내보내기 및 복구
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              데이터를 엑셀/JSON으로 내보내거나, 저장된 JSON 백업 파일을 불러와 현재 데이터를 과거
              시점으로 복구할 수 있습니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleExport('xlsx')}
                className="flex flex-col items-center justify-center p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group">
                <FileSpreadsheet
                  className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <span className="text-[10px] font-black text-emerald-400">엑셀 저장</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex flex-col items-center justify-center p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl hover:bg-blue-500/10 hover:border-blue-500/30 transition-all group">
                <FileCode
                  className="text-blue-500 mb-2 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <span className="text-[10px] font-black text-blue-400">JSON 저장</span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleImport}
                className="w-full flex items-center justify-center gap-3 p-5 bg-purple-600/10 border border-purple-500/20 rounded-3xl hover:bg-purple-600/20 hover:border-purple-500/40 transition-all group text-purple-400 font-black text-sm">
                <RotateCcw size={20} className="group-hover:rotate-[-45deg] transition-transform" />
                JSON 백업 파일로 데이터 복구하기
              </button>
              <button
                onClick={handleImportExcel}
                className="w-full flex items-center justify-center gap-3 p-5 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl hover:bg-emerald-600/20 hover:border-emerald-500/40 transition-all group text-emerald-400 font-black text-sm">
                <FileUp size={20} className="group-hover:translate-y-[-2px] transition-transform" />
                엑셀 데이터 일괄 가져오기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function BackupPathSelector({ label, path, onSelect }) {
  const isMissing = !path;
  return (
    <div className="space-y-2">
      <label
        className={`text-[10px] font-black uppercase pl-1 ${
          isMissing ? 'text-rose-500' : 'text-gray-500'
        }`}>
        {label} {isMissing && '(필수 설정)'}
      </label>
      <div className="flex gap-2">
        <div
          className={`flex-1 bg-gray-950 border ${
            isMissing ? 'border-rose-500/50 bg-rose-500/5' : 'border-gray-800'
          } rounded-xl px-4 py-3 text-sm flex items-center gap-3 truncate`}>
          {isMissing ? (
            <>
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span className="text-rose-400 font-bold">경로를 선택해 주세요</span>
            </>
          ) : (
            <span className="text-gray-400">{path}</span>
          )}
        </div>
        <button
          onClick={onSelect}
          className={`px-4 rounded-xl text-xs font-bold border transition-all ${
            isMissing
              ? 'bg-rose-600 border-rose-500 text-white hover:bg-rose-500'
              : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          }`}>
          {isMissing ? '경로 지정' : '변경'}
        </button>
      </div>
    </div>
  );
}
