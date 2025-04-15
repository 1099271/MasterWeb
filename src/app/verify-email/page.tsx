'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/auth';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('验证您的邮箱中...');
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('无效的验证链接。请检查您的邮件或请求新的验证链接。');
        return;
      }
      
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('邮箱验证成功！您现在可以登录了。');
      } catch (error) {
        setStatus('error');
        setMessage('验证失败。链接可能已过期或无效。');
        console.error('验证邮箱失败:', error);
      }
    };
    
    verify();
  }, [token]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">邮箱验证</h2>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <div className="animate-pulse">
              <p className="text-lg text-gray-600">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">{message}</p>
              <div className="pt-4">
                <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                  前往登录
                </Link>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900">{message}</p>
              <div className="pt-4">
                <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 mr-4">
                  返回登录
                </Link>
                <Link href="/auth/register" className="text-indigo-600 hover:text-indigo-500">
                  重新注册
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 