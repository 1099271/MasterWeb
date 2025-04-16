'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // 重新启用图标导入

export const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // 确保只在客户端渲染实际内容
  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免水合不匹配，返回一个占位符
  if (!mounted) {
    return <div className="h-10 w-10"></div>;
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('Current resolved theme:', resolvedTheme);
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors duration-200"
      aria-label="Toggle Dark Mode"
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className="h-6 w-6 text-yellow-500" /> // 使用 SunIcon
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-700" /> // 使用 MoonIcon
      )}
    </button>
  );
}; 