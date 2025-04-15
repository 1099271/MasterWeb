'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getCurrentUser,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  getUserLoginHistory,
  getUserActivityHistory
} from '@/lib/auth';
import { User, LoginHistory, ActivityHistory } from '@/types/user';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/user/UserLayout';

// 分页响应接口
interface PaginatedResponse<T> {
  history: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = parseInt(params.id);
  
  const [user, setUser] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'login' | 'activity'>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // 添加分页相关状态
  const [loginCurrentPage, setLoginCurrentPage] = useState(1);
  const [loginPageSize, setLoginPageSize] = useState(10);
  const [loginTotalPages, setLoginTotalPages] = useState(1);
  const [loginTotal, setLoginTotal] = useState(0);
  
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);

  // 加载用户信息和历史记录
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserDetail(userId);
      setUser(userData);
      
      // 加载登录历史和活动历史
      await loadLoginHistory();
      await loadActivityHistory();
    } catch (error) {
      console.error('Failed to load user data:', error);
      setStatusMessage({
        type: 'error',
        text: '加载用户数据失败，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 加载登录历史
  const loadLoginHistory = async (page = loginCurrentPage, pageSize = loginPageSize) => {
    try {
      const skip = (page - 1) * pageSize;
      const loginData = await getUserLoginHistory(userId, skip, pageSize) as unknown as PaginatedResponse<LoginHistory>;
      
      // 正确提取 history 数组和分页信息
      setLoginHistory(loginData.history);
      setLoginTotal(loginData.total);
      setLoginTotalPages(loginData.total_pages);
      setLoginCurrentPage(loginData.page);
      setLoginPageSize(loginData.page_size);
    } catch (error) {
      console.error('Failed to load login history:', error);
      setStatusMessage({
        type: 'error',
        text: '加载登录历史失败，请重试'
      });
    }
  };
  
  // 加载活动历史
  const loadActivityHistory = async (page = activityCurrentPage, pageSize = activityPageSize) => {
    try {
      const skip = (page - 1) * pageSize;
      const activityData = await getUserActivityHistory(userId, skip, pageSize) as unknown as PaginatedResponse<ActivityHistory>;
      
      // 提取数据和分页信息
      setActivityHistory(activityData.history);
      setActivityTotal(activityData.total);
      setActivityTotalPages(activityData.total_pages);
      setActivityCurrentPage(activityData.page);
      setActivityPageSize(activityData.page_size);
    } catch (error) {
      console.error('Failed to load activity history:', error);
      setStatusMessage({
        type: 'error',
        text: '加载活动历史失败，请重试'
      });
    }
  };
  
  // 处理登录历史分页变化
  const handleLoginPageChange = (newPage: number) => {
    loadLoginHistory(newPage, loginPageSize);
  };
  
  // 处理活动历史分页变化
  const handleActivityPageChange = (newPage: number) => {
    loadActivityHistory(newPage, activityPageSize);
  };

  // 初始加载用户数据
  useEffect(() => {
    loadUserData();
  }, [userId]);

  // 更新用户状态（激活/停用）
  const handleUpdateStatus = async (isActive: boolean) => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      await updateUserStatus(userId, isActive);
      
      // 更新本地用户数据
      setUser({ ...user, is_active: isActive });
      
      setStatusMessage({
        type: 'success',
        text: `用户已${isActive ? '激活' : '停用'}`
      });
      
      // 刷新用户数据
      await loadUserData();
    } catch (error) {
      console.error('Failed to update user status:', error);
      setStatusMessage({
        type: 'error',
        text: '更新用户状态失败，请重试'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 更新用户角色（设置/取消管理员）
  const handleUpdateRole = async (isAdmin: boolean) => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      await updateUserRole(userId, isAdmin);
      
      // 更新本地用户数据
      setUser({ ...user, is_admin: isAdmin });
      
      setStatusMessage({
        type: 'success',
        text: `用户已${isAdmin ? '设为管理员' : '取消管理员权限'}`
      });
      
      // 刷新用户数据
      await loadUserData();
    } catch (error) {
      console.error('Failed to update user role:', error);
      setStatusMessage({
        type: 'error',
        text: '更新用户角色失败，请重试'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 渲染页面内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-red-600 mb-2">用户不存在</h2>
            <p className="text-gray-600 mb-4">找不到指定的用户信息</p>
            <Link href="/admin/user-management" className="text-indigo-600 hover:text-indigo-500">
              返回用户管理
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">用户详情</h1>
          <Link href="/admin/user-management" className="text-indigo-600 hover:text-indigo-500">
            返回用户列表
          </Link>
        </div>

        {/* 状态消息 */}
        {statusMessage && (
          <div className={`mb-4 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* 用户信息卡 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">用户信息</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">用户详细资料和账户设置</p>
            </div>
            <div className="flex space-x-2">
              {/* 激活/停用按钮 */}
              <button
                onClick={() => handleUpdateStatus(!user.is_active)}
                disabled={isProcessing}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  user.is_active 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  user.is_active ? 'focus:ring-red-500' : 'focus:ring-green-500'
                } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? '处理中...' : user.is_active ? '停用账户' : '激活账户'}
              </button>
              
              {/* 设置/取消管理员权限按钮 */}
              <button
                onClick={() => handleUpdateRole(!user.is_admin)}
                disabled={isProcessing}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  user.is_admin 
                    ? 'bg-yellow-600 hover:bg-yellow-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  user.is_admin ? 'focus:ring-yellow-500' : 'focus:ring-purple-500'
                } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? '处理中...' : user.is_admin ? '取消管理员' : '设为管理员'}
              </button>
            </div>
          </div>
          
          {/* 标签页导航 */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'info'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                基本信息
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'login'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                登录历史
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                活动记录
              </button>
            </nav>
          </div>

          {/* 用户基本信息 */}
          {activeTab === 'info' && (
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">用户ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.id}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">用户名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">电子邮箱</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">账户状态</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? '已激活' : '未激活'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">邮箱验证</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.is_verified ? '已验证' : '未验证'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">用户角色</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_admin ? '管理员' : '普通用户'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">最后登录时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '从未登录'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">注册时间</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(user.created_at).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">个人简介</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.bio || '未设置个人简介'}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* 登录历史 */}
          {activeTab === 'login' && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP地址
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        设备信息
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        登录时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!Array.isArray(loginHistory) || loginHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          暂无登录记录
                        </td>
                      </tr>
                    ) : (
                      loginHistory.map((login) => (
                        <tr key={login.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {login.ip_address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {login.user_agent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(login.login_time).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* 分页控件 */}
                {loginTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <button
                        onClick={() => handleLoginPageChange(loginCurrentPage - 1)}
                        disabled={loginCurrentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          loginCurrentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => handleLoginPageChange(loginCurrentPage + 1)}
                        disabled={loginCurrentPage === loginTotalPages}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          loginCurrentPage === loginTotalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        下一页
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          显示第 <span className="font-medium">{(loginCurrentPage - 1) * loginPageSize + 1}</span> 到 
                          <span className="font-medium">
                            {Math.min(loginCurrentPage * loginPageSize, loginTotal)}
                          </span> 条，共 
                          <span className="font-medium">{loginTotal}</span> 条结果
                        </p>
                      </div>
                      <div>
                        <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handleLoginPageChange(loginCurrentPage - 1)}
                            disabled={loginCurrentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                              loginCurrentPage === 1
                                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">上一页</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          
                          {/* 页码按钮 */}
                          {Array.from({ length: loginTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handleLoginPageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                page === loginCurrentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handleLoginPageChange(loginCurrentPage + 1)}
                            disabled={loginCurrentPage === loginTotalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                              loginCurrentPage === loginTotalPages
                                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">下一页</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 活动历史 */}
          {activeTab === 'activity' && (
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作类型
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        描述
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {!Array.isArray(activityHistory) || activityHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          暂无活动记录
                        </td>
                      </tr>
                    ) : (
                      activityHistory.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {activity.action}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {activity.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* 活动历史分页控件 */}
                {activityTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <button
                        onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
                        disabled={activityCurrentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          activityCurrentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
                        disabled={activityCurrentPage === activityTotalPages}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                          activityCurrentPage === activityTotalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        下一页
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          显示第 <span className="font-medium">{(activityCurrentPage - 1) * activityPageSize + 1}</span> 到 
                          <span className="font-medium">
                            {Math.min(activityCurrentPage * activityPageSize, activityTotal)}
                          </span> 条，共 
                          <span className="font-medium">{activityTotal}</span> 条结果
                        </p>
                      </div>
                      <div>
                        <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
                            disabled={activityCurrentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                              activityCurrentPage === 1
                                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">上一页</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          
                          {/* 页码按钮 */}
                          {Array.from({ length: activityTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handleActivityPageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                page === activityCurrentPage
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
                            disabled={activityCurrentPage === activityTotalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                              activityCurrentPage === activityTotalPages
                                ? 'border-gray-300 bg-white text-gray-300 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            <span className="sr-only">下一页</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute adminOnly>
      <UserLayout>
        {renderContent()}
      </UserLayout>
    </ProtectedRoute>
  );
} 