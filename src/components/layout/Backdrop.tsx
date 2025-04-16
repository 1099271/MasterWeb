'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import React from 'react';

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  return (
    <div
      className={`fixed inset-0 z-40 bg-gray-900/50 transition-opacity duration-300 lg:hidden ${
        isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={toggleMobileSidebar}
      aria-hidden="true"
    />
  );
};

export default Backdrop; 