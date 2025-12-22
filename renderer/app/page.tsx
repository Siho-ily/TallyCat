'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full text-blue-400 animate-pulse">
      초기화 중...
    </div>
  );
}
