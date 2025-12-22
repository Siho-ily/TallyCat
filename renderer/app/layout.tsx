import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HAIRSHOP - Sales & Backup Manager',
  description: 'Offline sales and backup management for hairshops'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
