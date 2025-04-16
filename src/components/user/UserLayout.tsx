'use client';

import { ReactNode } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            {children}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default UserLayout; 