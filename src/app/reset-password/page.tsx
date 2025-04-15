'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // 获取URL中的token参数
    const token = searchParams.get('token');
    
    // 重定向到实际的重置密码页面，保留token参数
    if (token) {
      router.push(`/auth/reset-password?token=${token}`);
    } else {
      router.push('/auth/reset-password');
    }
  }, [router, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">正在跳转到重置密码页面...</p>
    </div>
  );
} 