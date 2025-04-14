'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/user/UserLayout';
import { getLoginHistory, getActivityHistory } from '@/lib/auth';
import { LoginHistory, ActivityHistory } from '@/types/user';

export default function Dashboard() {
  const { user } = useAuth();
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loginData, activityData] = await Promise.all([
          getLoginHistory(0, 5),
          getActivityHistory(0, 5)
        ]);
        
        setLoginHistory(loginData);
        setActivityHistory(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <UserLayout>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">用户仪表盘</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 用户信息卡片 */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">账户信息</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">用户名:</span>
                  <span className="font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">邮箱:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">账户状态:</span>
                  <span className={`font-medium ${user?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.is_active ? '已激活' : '未激活'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">邮箱验证:</span>
                  <span className={`font-medium ${user?.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.is_verified ? '已验证' : '未验证'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">注册时间:</span>
                  <span className="font-medium">
                    {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">上次登录:</span>
                  <span className="font-medium">
                    {user?.last_login_at 
                      ? new Date(user.last_login_at).toLocaleString() 
                      : '无记录'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 系统通知卡片 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">系统通知</h2>
              {!user?.is_verified ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        您的邮箱尚未验证，请检查邮箱并点击验证链接完成验证。
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">目前没有新的系统通知。</p>
              )}
            </div>
          </div>
          
          {/* 登录历史记录 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">最近登录记录</h2>
            {isLoading ? (
              <div className="text-center py-4">
                <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : loginHistory.length > 0 ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP地址
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          设备信息
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loginHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.ip_address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.user_agent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">暂无登录记录。</p>
            )}
          </div>
          
          {/* 活动历史记录 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">最近活动记录</h2>
            {isLoading ? (
              <div className="text-center py-4">
                <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : activityHistory.length > 0 ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          详情
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activityHistory.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">暂无活动记录。</p>
            )}
          </div>
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
} 