'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { resetPassword } from '@/lib/auth';
import { useTranslation } from '@/utils/useTranslation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
  // 从URL中获取重置密码的token
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError(t('messages.error.invalidResetLink'));
    }
  }, [searchParams, t]);
  
  const validateForm = () => {
    if (password.length < 8) {
      setError(t('messages.error.passwordComplexity'));
      return false;
    }
    
    if (password !== confirmPassword) {
      setError(t('messages.error.passwordMismatch'));
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword({
        token,
        new_password: password,
      });
      setSuccess(t('messages.success.passwordReset'));
      
      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError(t('messages.error.invalidResetLink'));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          重置密码
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="text-sm text-green-700">
                {success}
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
              )}
              
              <Input
                label="新密码"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!token || isLoading}
              />
              
              <Input
                label="确认密码"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!token || isLoading}
              />

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={!token}
                >
                  重置密码
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  返回登录
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 