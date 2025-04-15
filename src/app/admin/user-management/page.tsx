'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getUserList } from '@/lib/auth';
import { User, UserListParams } from '@/types/user';

export default function UserManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserListParams>({
    skip: 0,
    limit: 10,
    search: '',
    is_active: searchParams.get('is_active') === 'true' ? true : undefined,
    is_verified: searchParams.get('is_verified') === 'true' ? true : undefined,
    is_admin: searchParams.get('is_admin') === 'true' ? true : undefined,
    order_by: 'created_at',
    order_direction: 'desc',
  });

  // 加载用户列表
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getUserList(filters);
      setUsers(result.users);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始检查管理员权限并加载用户
  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = getCurrentUser();
      
      // 如果未登录或不是管理员，重定向到登录页
      if (!currentUser || !currentUser.is_admin) {
        router.push('/auth/login');
        return;
      }

      await loadUsers();
    };

    checkAdmin();
  }, []);

  // 当过滤器更改时重新加载用户
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, skip: 0 });
    setCurrentPage(1);
  };

  // 处理过滤更改
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({ ...filters, [filterName]: value, skip: 0 });
    setCurrentPage(1);
  };

  // 处理页面变化
  const handlePageChange = (page: number) => {
    const skip = (page - 1) * filters.limit!;
    setFilters({ ...filters, skip });
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">用户管理</h1>
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-500">
              返回管理面板
            </Link>
          </div>

          {/* 搜索和过滤区域 */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  搜索
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="搜索用户名或邮箱"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  筛选
                </label>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
                    value={filters.is_active === undefined ? '' : String(filters.is_active)}
                    onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">所有状态</option>
                    <option value="true">已激活</option>
                    <option value="false">未激活</option>
                  </select>

                  <select
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
                    value={filters.is_verified === undefined ? '' : String(filters.is_verified)}
                    onChange={(e) => handleFilterChange('is_verified', e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">所有验证状态</option>
                    <option value="true">已验证</option>
                    <option value="false">未验证</option>
                  </select>

                  <select
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
                    value={filters.is_admin === undefined ? '' : String(filters.is_admin)}
                    onChange={(e) => handleFilterChange('is_admin', e.target.value === '' ? undefined : e.target.value === 'true')}
                  >
                    <option value="">所有角色</option>
                    <option value="true">管理员</option>
                    <option value="false">普通用户</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  搜索
                </button>
              </div>
            </form>
          </div>

          {/* 用户列表 */}
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          角色
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          注册时间
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            没有找到用户
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                    alt={user.username}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {user.is_active ? '已激活' : '未激活'}
                                </span>
                                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {user.is_verified ? '已验证' : '未验证'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                {user.is_admin ? '管理员' : '普通用户'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link href={`/admin/user-detail/${user.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                详情
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 分页 */}
          {total > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  上一页
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage * filters.limit! >= total}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    currentPage * filters.limit! >= total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{filters.skip! + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(filters.skip! + filters.limit!, total)}
                    </span>{' '}
                    条，共 <span className="font-medium">{total}</span> 条结果
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">上一页</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.ceil(total / filters.limit!) }).slice(0, 5).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === idx + 1
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage * filters.limit! >= total}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        currentPage * filters.limit! >= total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
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
      </div>
    </div>
  );
} 