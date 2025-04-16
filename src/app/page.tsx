'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/utils/useTranslation';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  
  // 如果用户已登录，根据角色重定向到对应的仪表盘
  useEffect(() => {
    if (!isLoading && user) {
      // 可以根据角色或权限决定跳转到哪个面板
      if (user) {
        router.push('/user/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          {t('common.system.title')}
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          {t('common.system.description')}
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/auth/login" size="lg">
            {t('common.buttons.login')}
          </Button>
          <Button href="/auth/register" variant="outline" size="lg">
            {t('common.buttons.register')}
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{t('common.features.security.title')}</h3>
            <p className="text-gray-600">
              {t('common.features.security.description')}
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{t('common.features.profile.title')}</h3>
            <p className="text-gray-600">
              {t('common.features.profile.description')}
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{t('common.features.recovery.title')}</h3>
            <p className="text-gray-600">
              {t('common.features.recovery.description')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
