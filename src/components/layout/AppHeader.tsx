'use client';

import React from 'react';
import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/utils/useTranslation';
import { ThemeToggleButton } from './ThemeToggleButton';

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar, isMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const { t } = useTranslation();

  // 切换侧边栏处理函数
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // 切换用户菜单
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex w-full items-center justify-between px-4 py-4 md:px-6">
        {/* 左侧:汉堡菜单和Logo */}
        <div className="flex items-center gap-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={handleToggle}
            aria-label={t('common.buttons.toggleSidebar')}
          >
            {isMobileOpen ? (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6"
              >
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            )}
          </button>

          <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-500">
            {t('common.system.title')}
          </Link>
        </div>

        {/* 右侧:用户信息和操作 */}
        <div className="relative flex items-center gap-3">
          {/* 搜索框可以在这里添加 */}
          
          {/* 添加 ThemeToggleButton */}
          <ThemeToggleButton />

          {/* 用户头像和下拉菜单 */}
          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-lg py-1.5 px-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={toggleUserMenu}
            >
              <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {/* 用户头像 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-full w-full p-1.5 text-gray-500 dark:text-gray-400"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <span className="hidden md:inline-block">{user?.username}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>

            {/* 用户下拉菜单 */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.email}
                </div>
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                <Link
                  href="/user/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t('common.nav.profile')}
                </Link>
                {user?.is_admin && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {t('common.nav.admin')}
                  </Link>
                )}
                <div className="my-1 h-px bg-gray-200 dark:bg-gray-800"></div>
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
                >
                  {t('common.nav.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 