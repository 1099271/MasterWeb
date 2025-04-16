'use client';

import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import Backdrop from './Backdrop';
import { useSidebar } from '@/contexts/SidebarContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // 根据侧边栏状态计算主内容区域的外边距
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[280px]'
    : 'lg:ml-[80px]';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* 侧边栏和背景遮罩 */}
      <AppSidebar />
      <Backdrop />
      
      {/* 主内容区域 */}
      <div
        className={`flex-1 transition-[margin-left] duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* 顶部导航 */}
        <AppHeader />
        
        {/* 页面内容 */}
        <main className="px-4 pt-[80px] pb-6 md:px-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 