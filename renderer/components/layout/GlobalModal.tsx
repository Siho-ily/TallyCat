'use client';

import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import BaseModal from '../ui/BaseModal';
import { Button } from '../ui/InputControls';

export default function GlobalModal() {
  const { modalConfig } = useData();
  const { isOpen, type, title, message, onConfirm, onCancel } = modalConfig;

  if (!isOpen) return null;

  const Icon = type === 'alert' ? <AlertCircle size={40} /> : <HelpCircle size={40} />;

  const footer = (
    <>
      {type === 'confirm' && (
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          취소
        </Button>
      )}
      <Button
        variant={type === 'confirm' ? 'primary' : 'secondary'}
        onClick={onConfirm}
        className="flex-1">
        {type === 'confirm' ? '확인' : '닫기'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={type === 'confirm' ? onCancel || (() => {}) : onConfirm || (() => {})}
      title={title}
      icon={Icon}
      footer={footer}
      maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </BaseModal>
  );
}
