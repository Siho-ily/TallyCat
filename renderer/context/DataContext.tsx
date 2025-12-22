'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Record, Category, Settings, StorageInfo } from '../types';

interface DataContextType {
  records: Record[];
  categories: Category[];
  settings: Settings | null;
  storage: StorageInfo | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  showAlert: (message: string, title?: string) => void;
  showConfirm: (message: string, title?: string, onConfirm?: () => void) => void;
  modalConfig: {
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const refreshData = useCallback(async () => {
    try {
      // Parallel fetching for performance
      const [r, c, s, st] = await Promise.all([
        (window as any).ipc.invoke('get-records'),
        (window as any).ipc.invoke('get-categories'),
        (window as any).ipc.invoke('get-settings'),
        (window as any).ipc.invoke('check-storage')
      ]);

      setRecords(r);
      setCategories(c);
      setSettings(s);
      setStorage(st);
    } catch (error) {
      console.error('Failed to refresh global data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider
      value={{
        records,
        categories,
        settings,
        storage,
        loading,
        refreshData,
        showAlert,
        showConfirm,
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
