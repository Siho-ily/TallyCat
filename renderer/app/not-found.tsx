import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-3xl flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400">
          <FileQuestion size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          href="/home"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all text-sm">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
