'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Record, Category, Settings, StorageInfo, PaymentMethod } from '../types';

interface DataContextType {
  records: Record[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  settings: Settings | null;
  storage: StorageInfo | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, title?: string, onConfirm?: () => void) => void;
  showPrompt: (message: string, title?: string, onConfirm?: (value: string) => void) => void;
  modalConfig: {
    isOpen: boolean;
    type: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    onConfirm?: (value?: any) => void;
    onCancel?: () => void;
    defaultValue?: string;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [storage, setStorage] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<DataContextType['modalConfig']>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: ''
  });

  const showAlert = useCallback((message: string, title: string = '알림') => {
    setModalConfig({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  }, []);

  const showConfirm = useCallback(
    (message: string, title: string = '확인', onConfirm?: () => void) => {
      setModalConfig({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          onConfirm?.();
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    },
    []
  );

  const showPrompt = useCallback(
    (message: string, title: string = '입력', onConfirm?: (value: string) => void) => {
      setModalConfig({
        isOpen: true,
        type: 'prompt',
        title,
        message,
        onConfirm: (value: string) => {
          onConfirm?.(value);
          setModalConfig(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      });
    },
    []
  );

  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch core data first to unblock UI
      const [r, c, pm, s] = await Promise.all([
        (window as any).ipc.invoke('get-records'),
        (window as any).ipc.invoke('get-categories'),
        (window as any).ipc.invoke('get-payment-methods'),
        (window as any).ipc.invoke('get-settings')
      ]);

      setRecords(r);
      setCategories(c);
      setPaymentMethods(pm);
      setSettings(s);
      setLoading(false);

      // 2. Fetch storage info in background (can be slow due to file system traversal)
      try {
        const st = await (window as any).ipc.invoke('check-storage');
        setStorage(st);
      } catch (storageError) {
        console.warn('Background storage check failed:', storageError);
      }
    } catch (error) {
      console.error('Failed to refresh core global data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Listen for background updates (e.g., from automation or other windows)
    const cleanup = (window as any).ipc.on('refresh-data', () => {
      console.log('Data update triggered from background...');
      refreshData();
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [refreshData]);

  return (
    <DataContext.Provider
      value={{
        records,
        categories,
        paymentMethods,
        settings,
        storage,
        loading,
        refreshData,
        showAlert,
        showConfirm,
        showPrompt,
        modalConfig
      }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
