import React from 'react';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '탤리캣 - 가게 장부 관리 고양이',
  description: '오프라인 가게 장부 관리 시스템'
};

import { DataProvider } from '../context/DataContext';
import { ThemeProvider } from '../context/ThemeContext';
import GlobalModal from '../components/layout/GlobalModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <DataProvider>
            <Layout>{children}</Layout>
            <GlobalModal />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
