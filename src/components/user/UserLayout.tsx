'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: '仪表盘', href: '/user/dashboard' },
    { name: '个人资料', href: '/user/profile' },
    { name: '修改密码', href: '/user/change-password' },
    { name: '账户安全', href: '/user/account-security' },
    { name: '小红书笔记', href: '/user/xhs-notes' },
  ];

  const navigationItems = user?.is_admin 
    ? [...navItems, { name: '管理员控制面板', href: '/admin' }]
    : navItems;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  用户管理系统
                </Link>
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {/* 用户下拉菜单 */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium text-gray-700">
                    {user?.username}
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-gray-100"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">打开菜单</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="sm:hidden" id="mobile-menu">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={logout}
                className="mt-4 block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
              >
                退出登录
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 主内容布局 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* 侧边导航 */}
          <div className="hidden lg:col-span-3 lg:block">
            <nav className="sticky top-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* 主内容区 */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout; 