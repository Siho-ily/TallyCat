'use client';

import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Card from '../ui/Card';
import RecordTable from '../records/RecordTable';
import { Record, Category, PaymentMethod } from '../../types';

interface RecentRecordsSectionProps {
  records: Record[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onRecordClick: (record: Record) => void;
}

export default function RecentRecordsSection({
  records,
  categories,
  paymentMethods,
  onRecordClick
}: RecentRecordsSectionProps) {
  return (
    <Card
      title="최근 거래 요약"
      icon={<CalendarIcon size={20} className="text-gray-400" />}
      noPadding>
      <RecordTable
        records={records}
        categories={categories}
        paymentMethods={paymentMethods}
        onRecordClick={onRecordClick}
        showFooter={false}
      />
    </Card>
  );
}
