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
// import Pagination from '@/components/ui/Pagination'; // 暂时移除，组件不存在或路径错误

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">用户不存在</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">找不到指定的用户信息</p>
            <Link href="/admin/user-management" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              返回用户管理
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="text-gray-900 dark:text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">用户详情</h1>
          <Link href="/admin/user-management" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            返回用户列表
          </Link>
        </div>

        {/* 状态消息 */}
        {statusMessage && (
          <div className={`mb-4 p-4 rounded-md ${statusMessage.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
            {statusMessage.text}
          </div>
        )}

        {/* 用户信息卡 */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">用户信息</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">用户详细资料和账户设置</p>
            </div>
            <div className="flex space-x-2">
              {/* 激活/停用按钮 */}
              <button
                onClick={() => handleUpdateStatus(!user.is_active)}
                disabled={isProcessing}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  user.is_active 
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800' 
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  user.is_active ? 'focus:ring-red-500 dark:focus:ring-red-600' : 'focus:ring-green-500 dark:focus:ring-green-600'
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
                    ? 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600' 
                    : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  user.is_admin ? 'focus:ring-gray-500 dark:focus:ring-gray-400' : 'focus:ring-purple-500 dark:focus:ring-purple-400'
                } ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? '处理中...' : user.is_admin ? '取消管理员' : '设为管理员'}
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200 sm:dark:divide-gray-700">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">用户名</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user.username}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">邮箱</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">头像 URL</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2 truncate">{user.avatar || '未设置'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">个人简介</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user.bio || '未设置'}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">状态</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {user.is_active ? '已激活' : '未激活'}
                  </span>
                  <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_verified ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                    {user.is_verified ? '已验证' : '未验证'}
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">角色</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'}`}>
                    {user.is_admin ? '管理员' : '普通用户'}
                  </span>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">注册时间</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{new Date(user.created_at).toLocaleString()}</dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">上次登录</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '从未登录'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Tabs for history */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('info')}
              className={`${activeTab === 'info' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              信息概览 (已显示)
            </button>
             <button
              onClick={() => setActiveTab('login')}
              className={`${activeTab === 'login' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              登录历史
            </button>
            <button
              onClick={() => setActiveTab('activity')}
               className={`${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              活动历史
            </button>
          </nav>
        </div>

        {/* History Tables */} 
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
          {activeTab === 'login' && (
             <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">登录历史 ({loginTotal})</h3>
               {/* Login History Table */}
               <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-4">
                 <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                   <thead className="bg-gray-50 dark:bg-gray-700">
                     <tr>
                       <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">时间</th>
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">IP 地址</th>
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">用户代理</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                     {loginHistory.length > 0 ? (
                       loginHistory.map((entry) => (
                         <tr key={entry.id}>
                           <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6">{new Date(entry.login_time).toLocaleString()}</td>
                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{entry.ip_address}</td>
                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.user_agent}</td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={3} className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">没有登录历史记录。</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
               {/* Login History Pagination */}
               {loginTotal > 0 && loginTotalPages > 1 && (
                 <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                   <div className="flex justify-between flex-1 sm:hidden">
                     <button
                       onClick={() => handleLoginPageChange(loginCurrentPage - 1)}
                       disabled={loginCurrentPage === 1}
                       className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 ${loginCurrentPage === 1
                         ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                         : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                       }`}
                     >
                       上一页
                     </button>
                     <button
                       onClick={() => handleLoginPageChange(loginCurrentPage + 1)}
                       disabled={loginCurrentPage === loginTotalPages}
                       className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 ${loginCurrentPage === loginTotalPages
                         ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                         : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                       }`}
                     >
                       下一页
                     </button>
                   </div>
                   <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                     <div>
                       <p className="text-sm text-gray-700 dark:text-gray-300">
                         显示第 <span className="font-medium">{(loginCurrentPage - 1) * loginPageSize + 1}</span> 到
                         <span className="font-medium">
                           {Math.min(loginCurrentPage * loginPageSize, loginTotal)}
                         </span> 条，共
                         <span className="font-medium">{loginTotal}</span> 条结果
                       </p>
                     </div>
                     <div>
                       <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                         <button
                           onClick={() => handleLoginPageChange(loginCurrentPage - 1)}
                           disabled={loginCurrentPage === 1}
                           className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${loginCurrentPage === 1
                             ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                             : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                           }`}
                         >
                           <span className="sr-only">上一页</span>
                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                             <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                         {/* 页码按钮 */}
                         {Array.from({ length: loginTotalPages }, (_, i) => i + 1).map((page) => (
                           <button
                             key={page}
                             onClick={() => handleLoginPageChange(page)}
                             aria-current={page === loginCurrentPage ? 'page' : undefined}
                             className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${page === loginCurrentPage
                               ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                               : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                             }`}
                           >
                             {page}
                           </button>
                         ))}
                         <button
                           onClick={() => handleLoginPageChange(loginCurrentPage + 1)}
                           disabled={loginCurrentPage === loginTotalPages}
                           className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${loginCurrentPage === loginTotalPages
                             ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                             : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                           }`}
                         >
                           <span className="sr-only">下一页</span>
                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                       </nav>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}
          {activeTab === 'activity' && (
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">活动历史 ({activityTotal})</h3>
               {/* Activity History Table */}
               <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg mb-4">
                  <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                   <thead className="bg-gray-50 dark:bg-gray-700">
                     <tr>
                       <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">时间</th>
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">操作类型</th>
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">描述</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
                    {activityHistory.length > 0 ? (
                       activityHistory.map((entry) => (
                         <tr key={entry.id}>
                           <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-300 sm:pl-6">{new Date(entry.created_at).toLocaleString()}</td>
                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{entry.action}</td>
                           <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{entry.description}</td>
                         </tr>
                       ))
                     ) : (
                        <tr>
                         <td colSpan={3} className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">没有活动历史记录。</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
               {/* Activity History Pagination */}
               {activityTotal > 0 && activityTotalPages > 1 && (
                 <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
                   <div className="flex justify-between flex-1 sm:hidden">
                      <button
                        onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
                        disabled={activityCurrentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 ${activityCurrentPage === 1
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        }`}
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
                        disabled={activityCurrentPage === activityTotalPages}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 ${activityCurrentPage === activityTotalPages
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                          : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                        }`}
                      >
                        下一页
                      </button>
                    </div>
                   <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                     <div>
                       <p className="text-sm text-gray-700 dark:text-gray-300">
                         显示第 <span className="font-medium">{(activityCurrentPage - 1) * activityPageSize + 1}</span> 到
                         <span className="font-medium">
                           {Math.min(activityCurrentPage * activityPageSize, activityTotal)}
                         </span> 条，共
                         <span className="font-medium">{activityTotal}</span> 条结果
                       </p>
                     </div>
                     <div>
                       <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                         <button
                           onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
                           disabled={activityCurrentPage === 1}
                           className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${activityCurrentPage === 1
                             ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                             : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                           }`}
                         >
                           <span className="sr-only">上一页</span>
                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                             <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                         {/* 页码按钮 */}
                         {Array.from({ length: activityTotalPages }, (_, i) => i + 1).map((page) => (
                           <button
                             key={page}
                             onClick={() => handleActivityPageChange(page)}
                             aria-current={page === activityCurrentPage ? 'page' : undefined}
                             className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${page === activityCurrentPage
                               ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
                               : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                             }`}
                           >
                             {page}
                           </button>
                         ))}
                         <button
                           onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
                           disabled={activityCurrentPage === activityTotalPages}
                           className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${activityCurrentPage === activityTotalPages
                             ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed bg-gray-50 dark:bg-gray-700'
                             : 'text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}
                           }`}
                         >
                           <span className="sr-only">下一页</span>
                           <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                           </svg>
                         </button>
                       </nav>
                     </div>
                   </div>
                 </div>
               )}
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