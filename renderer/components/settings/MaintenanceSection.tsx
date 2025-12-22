'use client';

import React from 'react';
import { ShieldCheck, FileDown, FileUp, RotateCcw, Zap } from 'lucide-react';
import Card from '../ui/Card';
import ActionButton from './ActionButton';
import BaseModal from '../ui/BaseModal';
import { Button } from '../ui/InputControls';

interface MaintenanceSectionProps {
  onExport: (format: 'xlsx' | 'json') => Promise<boolean>;
  onImport: () => void;
  onRefresh: () => Promise<void>;
  showAlert: (message: string, title?: string) => void;
}

export default function MaintenanceSection({
  onExport,
  onImport,
  onRefresh,
  showAlert
}: MaintenanceSectionProps) {
  const [showImportModal, setShowImportModal] = React.useState(false);

  return (
    <>
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
                onClick={() => onExport('json')}
              />
              <ActionButton
                icon={<FileDown />}
                title="내역 엑셀로 내보내기"
                desc="전체 내역을 가공이 용이한 엑셀 파일로 추출합니다"
                onClick={() => onExport('xlsx')}
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
                onClick={onImport}
              />
              <ActionButton
                icon={<FileUp />}
                title="엑셀 데이터 가져오기"
                desc="기존 장부 등의 엑셀 데이터를 시스템으로 이전합니다"
                onClick={() => setShowImportModal(true)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Excel Import Backup Guard Modal */}
      <BaseModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="데이터 가져오기 전 확인"
        icon={<Zap size={30} className="text-amber-400" />}
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col w-full gap-3">
            <Button
              variant="primary"
              fullWidth
              onClick={async () => {
                await onExport('json');
              }}>
              현재 데이터 백업하기 (JSON)
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={async () => {
                  const result = await (window as any).ipc.invoke('import-excel');
                  if (result.success) {
                    showAlert(result.message, '가져오기 완료');
                    await onRefresh();
                  } else if (result.message !== '취소되었습니다.') {
                    showAlert(result.message, '실패');
                  }
                }}>
                엑셀 데이터 가져오기
              </Button>
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-6 py-4 rounded-3xl text-sm font-black text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
                취소
              </button>
            </div>
          </div>
        }>
        <div className="text-center space-y-4">
          <p className="text-gray-400 font-medium leading-relaxed">
            엑셀 데이터를 가져오기 전에 현재 데이터를 백업하는 것을 권장합니다.
          </p>
          <div className="text-[11px] text-gray-500 bg-gray-950 p-4 rounded-2xl border border-gray-800/50 leading-relaxed">
            데이터를 가져오는 과정에서 기존 데이터와 충돌하거나 예기치 못한 문제가 발생할 수
            있습니다.
            <br />
            안전한 진행을 위해 백업을 먼저 수행하시겠습니까?
          </div>
        </div>
      </BaseModal>
    </>
  );
}
