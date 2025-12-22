import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HAIRSHOP - Sales & Backup Manager',
  description: 'Offline sales and backup management for hairshops'
};

import { DataProvider } from '../context/DataContext';
import GlobalModal from '../components/GlobalModal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#050505] text-white">
        <DataProvider>
          <Layout>{children}</Layout>
          <GlobalModal />
        </DataProvider>
      </body>
    </html>
  );
}
