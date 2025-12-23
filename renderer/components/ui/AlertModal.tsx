import React from 'react';
import { AlertCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { Button } from './InputControls';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function AlertModal({ isOpen, onClose, title = '알림', message }: AlertModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<AlertCircle size={20} />}
      maxWidth="max-w-sm"
      footer={
        <Button onClick={onClose} className="w-full">
          확인
        </Button>
      }>
      <p className="text-gray-600 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
        {message}
      </p>
    </BaseModal>
  );
}
