'use client';

import React from 'react';
import PageHeader from '../../components/ui/PageHeader';

// Guide Components
import GettingStartedGuide from '../../components/guide/GettingStartedGuide';
import RecordsManagementGuide from '../../components/guide/RecordsManagementGuide';
import AnalysisGuide from '../../components/guide/AnalysisGuide';
import AutomationGuide from '../../components/guide/AutomationGuide';
import SettingsBackupGuide from '../../components/guide/SettingsBackupGuide';
import DataSafetyGuide from '../../components/guide/DataSafetyGuide';

export default function GuidePage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 max-w-4xl mx-auto">
      <PageHeader
        title="탤리캣 사용 가이드"
        description="탤리캣 (TallyCat) 의 모든 기능을 단계별로 안내해 드립니다. 처음 사용하시는 분도 쉽게 따라할 수 있습니다."
      />

      <div className="space-y-12">
        <GettingStartedGuide />
        <RecordsManagementGuide />
        <AnalysisGuide />
        <AutomationGuide />
        <SettingsBackupGuide />
        <DataSafetyGuide />
      </div>
    </div>
  );
}
