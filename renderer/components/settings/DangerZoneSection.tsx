'use client';

import React from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import Card from '../ui/Card';
import ActionButton from './ActionButton';

interface DangerZoneSectionProps {
  onResetData: () => void;
  onResetSystem: () => void;
}

export default function DangerZoneSection({ onResetData, onResetSystem }: DangerZoneSectionProps) {
  return (
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
            onClick={onResetData}
          />
          <ActionButton
            icon={<Zap />}
            title="시스템 전체 초기화"
            desc="내역, 카테고리, 설정을 모두 초기화합니다"
            variant="danger"
            onClick={onResetSystem}
          />
        </div>
      </div>
    </Card>
  );
}
