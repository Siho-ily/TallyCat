import React from 'react';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SPMS - Sales and Purchase Management System',
  description: 'Offline sales and purchase management system'
};

import { DataProvider } from '../context/DataContext';
import GlobalModal from '../components/layout/GlobalModal';

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
