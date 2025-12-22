'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';

// Refactored Components
import RecordsGuide from '../../components/guide/RecordsGuide';
import AnalysisGuide from '../../components/guide/AnalysisGuide';
import DataSafetyGuide from '../../components/guide/DataSafetyGuide';

export default function GuidePage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="사용자 가이드"
        description="SPMS (Sales and Purchase Management System)를 처음 사용하시나요? 주요 기능과 활용 팁을 안내해 드립니다."
        icon={<HelpCircle />}
      />

      <div className="space-y-12">
        <RecordsGuide />
        <AnalysisGuide />
        <DataSafetyGuide />
      </div>
    </div>
  );
}
