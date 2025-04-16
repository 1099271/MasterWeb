'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/user/UserLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { updateUser } from '@/lib/auth';
import { UserUpdate } from '@/types/user';
import { useTranslation } from '@/utils/useTranslation';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState<UserUpdate>({
    username: '',
    avatar: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        avatar: user.avatar || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateUser(formData);
      
      // 更新成功后，刷新用户信息
      await refreshUser();
      
      setSuccess(t('messages.success.profileUpdated'));
    } catch (err) {
      setError(t('messages.error.general'));
      console.error('Update profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <UserLayout>
        <div className="text-gray-900 dark:text-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">个人资料</h1>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {success && (
                <div className="rounded-md bg-green-50 dark:bg-green-900 p-4 mb-4">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    {success}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900 p-4 mb-4">
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                </div>
              )}
              
              <Input
                label="用户名"
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
              
              <Input
                label="头像URL"
                id="avatar"
                name="avatar"
                type="text"
                placeholder="输入头像图片的URL地址"
                value={formData.avatar || ''}
                onChange={handleChange}
              />
              
              <div className="space-y-1">
                <label 
                  htmlFor="bio" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  个人简介
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="写一些关于你自己的介绍..."
                  value={formData.bio || ''}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={isLoading}
                >
                  保存更改
                </Button>
              </div>
            </form>
          </div>
          
          {user && (
            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">账户信息</h2>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">邮箱</p>
                    <p className="mt-1 text-md font-medium text-gray-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">账户状态</p>
                    <p className={`mt-1 text-md font-medium ${user.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {user.is_active ? '已激活' : '未激活'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">邮箱验证</p>
                    <p className={`mt-1 text-md font-medium ${user.is_verified ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {user.is_verified ? '已验证' : '未验证'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">注册时间</p>
                    <p className="mt-1 text-md font-medium text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
} 