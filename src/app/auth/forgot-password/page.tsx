'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { forgotPassword } from '@/lib/auth';
import { useTranslation } from '@/utils/useTranslation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { t } = useTranslation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      await forgotPassword({ email });
      setSuccess(t('messages.success.resetLinkSent'));
      setEmail('');
    } catch (err) {
      setError(t('messages.error.general'));
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          找回密码
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          请输入您的邮箱，我们将发送重置密码链接
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-8 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-green-50 p-4 mb-4">
              <div className="text-sm text-green-700">
                {success}
              </div>
              <div className="mt-4 text-center">
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  返回登录
                </Link>
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
                label="邮箱"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  发送重置邮件
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