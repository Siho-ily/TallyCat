'use client';

import React from 'react';
import { AlertCircle, HelpCircle, Edit3 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import BaseModal from '../ui/BaseModal';
import { Button, Input } from '../ui/InputControls';

export default function GlobalModal() {
  const { modalConfig } = useData();
  const { isOpen, type, title, message, onConfirm, onCancel, defaultValue = '' } = modalConfig;
  const [inputValue, setInputValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const Icon =
    type === 'alert' ? (
      <AlertCircle size={40} />
    ) : type === 'prompt' ? (
      <Edit3 size={40} />
    ) : (
      <HelpCircle size={40} />
    );

  const handleConfirm = () => {
    if (type === 'prompt') {
      onConfirm?.(inputValue);
    } else {
      onConfirm?.();
    }
  };

  const footer = (
    <>
      {(type === 'confirm' || type === 'prompt') && (
        <Button variant="secondary" onClick={onCancel} className="flex-1">
          취소
        </Button>
      )}
      <Button
        variant={type === 'alert' ? 'secondary' : 'primary'}
        onClick={handleConfirm}
        className="flex-1"
        disabled={type === 'prompt' && !inputValue.trim()}>
        {type === 'alert' ? '닫기' : '확인'}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={type === 'alert' ? onConfirm || (() => {}) : onCancel || (() => {})}
      title={title}
      icon={Icon}
      footer={footer}
      maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <p className="text-gray-400 font-medium leading-relaxed whitespace-pre-wrap">{message}</p>

        {type === 'prompt' && (
          <div className="w-full pt-2">
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="내용을 입력하세요..."
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && inputValue.trim()) handleConfirm();
              }}
            />
          </div>
        )}
      </div>
    </BaseModal>
  );
}
