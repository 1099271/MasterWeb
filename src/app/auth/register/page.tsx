'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { register } from '@/lib/auth';
import { useTranslation } from '@/utils/useTranslation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const { t } = useTranslation();
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username) {
      newErrors.username = t('form.validation.required', { field: t('form.fields.username') });
    }
    
    if (!formData.email) {
      newErrors.email = t('form.validation.required', { field: t('form.fields.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('form.validation.email');
    }
    
    if (!formData.password) {
      newErrors.password = t('form.validation.required', { field: t('form.fields.password') });
    } else if (formData.password.length < 8) {
      newErrors.password = t('messages.error.passwordComplexity');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('messages.error.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      setSuccess(t('messages.success.register'));
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 5000);
      
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        setErrors({
          email: t('messages.error.emailInUse'),
        });
      } else if (error.message.includes('username already exists')) {
        setErrors({
          username: t('messages.error.usernameInUse'),
        });
      } else {
        setErrors({
          general: t('messages.error.general'),
        });
      }
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          创建新账户
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 px-6 py-8 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {success ? (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 mb-4">
              <div className="text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {errors.general}
                  </div>
                </div>
              )}
              
              <Input
                label="用户名"
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
              />
              
              <Input
                label="邮箱"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
              />
              
              <Input
                label="密码"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
              />
              
              <Input
                label="确认密码"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
              />
              
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  注册
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              已有账户? 立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 