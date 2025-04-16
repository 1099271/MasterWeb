'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import UserLayout from '@/components/user/UserLayout';
import XhsNoteDetail from '../components/XhsNoteDetail';

export default function XhsNoteDetailPage() {
  const router = useRouter();
  
  const handleBackToList = () => {
    router.push('/user/xhs-notes');
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackToList}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              返回笔记列表
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">笔记详情</h1>
          </div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
              <li className="inline-flex items-center">
                <a href="/user/dashboard" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                  仪表盘
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-1 text-gray-400 dark:text-gray-500">/</span>
                  <a href="/user/xhs-notes" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                    小红书笔记
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-1 text-gray-400 dark:text-gray-500">/</span>
                  <span className="text-blue-600 dark:text-blue-500">笔记详情</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        <XhsNoteDetail />
      </div>
    </UserLayout>
  );
} 