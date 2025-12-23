import React from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { Button } from './InputControls';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'info'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} className="flex-1">
        {cancelText}
      </Button>
      <Button
        onClick={handleConfirm}
        className={`flex-1 ${
          type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 border-transparent text-white' : ''
        }`}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={type === 'danger' ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
      maxWidth="max-w-sm"
      footer={footer}>
      <p className="text-gray-600 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
        {message}
      </p>
    </BaseModal>
  );
}
