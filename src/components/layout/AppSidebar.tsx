'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// 定义导航项子项类型
type SubNavItem = {
  name: string;
  href: string;
};

// 定义导航项类型
type NavItem = {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  subItems?: SubNavItem[];
  adminOnly?: boolean;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // 判断路径是否匹配当前导航项
  const isActive = (path: string) => pathname === path;

  // 判断子菜单是否应该展开（如果当前路径匹配子菜单中的某个项）
  useEffect(() => {
    let foundActiveSubmenu = false;
    navItems.forEach((item, index) => {
      if (item.subItems) {
        const isSubItemActive = item.subItems.some(subItem => isActive(subItem.href));
        if (isSubItemActive) {
          setOpenSubmenu(index);
          foundActiveSubmenu = true; // 标记找到了活动的子菜单
        }
      }
    });
    // 如果当前路径不属于任何子菜单项，确保没有子菜单是打开状态
    // (可选逻辑，看是否需要，如果不需要，可以注释掉if块)
    // if (!foundActiveSubmenu) {
    //   setOpenSubmenu(null);
    // }
  }, [pathname]); // 依赖项仅为pathname，假设navItems是稳定的

  // 更新子菜单高度
  useEffect(() => {
    Object.entries(subMenuRefs.current).forEach(([key, ref]) => {
      if (ref) {
        const index = parseInt(key);
        const height = ref.scrollHeight;
        setSubMenuHeight(prev => ({
          ...prev,
          [index]: height
        }));
      }
    });
  }, [openSubmenu, isExpanded, isHovered, isMobileOpen]);

  // 切换子菜单展开/收起
  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu(prev => prev === index ? null : index);
  };

  // 用户导航项，包含子菜单
  const navItems: NavItem[] = [
    {
      name: '仪表盘',
      href: '/user/dashboard',
      icon: (
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
          className="w-5 h-5"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    {
      name: '小红书笔记',
      href: '/user/xhs-notes',
      icon: (
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
          className="w-5 h-5"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    {
      name: '账户设置',
      icon: (
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
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      subItems: [
        { name: '个人资料', href: '/user/profile' },
        { name: '修改密码', href: '/user/change-password' },
        { name: '账户安全', href: '/user/account-security' }
      ]
    }
  ];

  // 如果是管理员，添加管理员控制面板
  const adminMenuItem: NavItem = {
    name: '管理员控制面板',
    href: '/admin',
    adminOnly: true,
    icon: (
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
        className="w-5 h-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  };

  // 筛选导航项，管理员可见所有
  const filteredNavItems = user?.is_admin 
    ? [...navItems, adminMenuItem]
    : navItems;

  // 侧边栏宽度样式计算
  const sidebarWidthClass = isExpanded || isMobileOpen
    ? 'w-[280px]'
    : isHovered
    ? 'w-[280px]'
    : 'w-[80px]';

  // 侧边栏变换效果
  const sidebarTransformClass = isMobileOpen 
    ? 'translate-x-0' 
    : '-translate-x-full lg:translate-x-0';

  return (
    <aside
      ref={sidebarRef}
      className={`${sidebarWidthClass} ${sidebarTransformClass} fixed left-0 top-0 z-50 h-full overflow-y-auto bg-white pt-[72px] transition-all duration-300 ease-in-out dark:bg-gray-900 lg:pt-[80px]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="no-scrollbar flex h-full flex-col overflow-y-auto px-5 pb-6">
        <nav className="mt-5 flex flex-col space-y-1.5">
          {filteredNavItems.map((item, index) => (
            <div key={item.name} className={`${item.adminOnly ? 'mt-5 pt-5 border-t border-gray-200 dark:border-gray-800' : ''}`}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => handleSubmenuToggle(index)}
                    className={`flex h-12 w-full items-center justify-between rounded-lg px-4 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 ${
                      openSubmenu === index ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`${!isExpanded && !isHovered && !isMobileOpen ? 'opacity-100' : 'mr-3 opacity-100'}`}>
                        {item.icon}
                      </span>
                      <span
                        className={`${
                          !isExpanded && !isHovered && !isMobileOpen ? 'hidden opacity-0' : 'opacity-100'
                        } whitespace-nowrap transition-opacity duration-200`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`${
                        !isExpanded && !isHovered && !isMobileOpen ? 'hidden' : ''
                      } transition-transform duration-200 ${openSubmenu === index ? 'rotate-180' : ''}`}
                    >
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
                        className="h-4 w-4"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  <div
                    ref={(el) => {
                      subMenuRefs.current[index] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height: openSubmenu === index ? `${subMenuHeight[index] || 0}px` : '0px',
                    }}
                  >
                    <div className="ml-10 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex h-10 items-center rounded-lg pl-4 pr-2 text-sm ${
                            isActive(subItem.href)
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-500'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`flex h-12 items-center rounded-lg px-4 ${
                    isActive(item.href || '')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <span
                    className={`${
                      !isExpanded && !isHovered && !isMobileOpen ? 'opacity-100' : 'mr-3 opacity-100'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`${
                      !isExpanded && !isHovered && !isMobileOpen ? 'hidden opacity-0' : 'opacity-100'
                    } whitespace-nowrap transition-opacity duration-200`}
                  >
                    {item.name}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* 底部登出按钮 */}
        <div className="mt-auto pt-3">
          <button
            onClick={() => useAuth().logout()}
            className="flex h-12 w-full items-center rounded-lg px-4 text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
          >
            <span
              className={`${
                !isExpanded && !isHovered && !isMobileOpen ? 'opacity-100' : 'mr-3 opacity-100'
              }`}
            >
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
                className="w-5 h-5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span
              className={`${
                !isExpanded && !isHovered && !isMobileOpen ? 'hidden opacity-0' : 'opacity-100'
              } whitespace-nowrap transition-opacity duration-200`}
            >
              退出登录
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar; 