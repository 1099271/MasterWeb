'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isLoading, checkIsAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果不是加载中且没有用户信息，则重定向到登录页
    if (!isLoading && !user) {
      router.push('/auth/login');
    }

    // 如果需要管理员权限但用户不是管理员，则重定向到用户仪表盘
    if (!isLoading && user && adminOnly && !checkIsAdmin()) {
      router.push('/user/dashboard');
    }
  }, [user, isLoading, adminOnly, router, checkIsAdmin]);

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

  // 如果用户未登录或不满足权限要求，返回null（useEffect会处理重定向）
  if (!user || (adminOnly && !checkIsAdmin())) {
    return null;
  }

  // 如果用户已登录且满足权限要求，显示子组件
  return <>{children}</>;
};

export default ProtectedRoute; 