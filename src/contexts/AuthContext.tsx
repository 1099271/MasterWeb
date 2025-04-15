'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { 
  getCurrentUser, 
  setCurrentUser, 
  clearToken, 
  login as authLogin,
  logout as authLogout,
  fetchCurrentUser
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkIsAdmin: () => boolean;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 初始化时从localStorage获取用户信息
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 从localStorage获取用户信息
        const storedUser = getCurrentUser();
        
        if (storedUser) {
          // 如果localStorage有用户信息，尝试从服务器获取最新的用户信息
          try {
            const freshUser = await fetchCurrentUser();
            setUser(freshUser);
            setCurrentUser(freshUser); // 更新localStorage
          } catch (error) {
            // 如果获取失败（如token过期），清除用户信息
            clearToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 登录
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authLogin(email, password);
      setUser(data.user);
      
      // 统一跳转到用户仪表盘，不再根据角色区分跳转目标
      if (data.user.is_active) {
        router.push('/user/dashboard'); // 所有用户（包括管理员）都跳转到用户面板
      } else {
        // 如果账户未激活，可以考虑显示提示信息或保持在登录页
        console.warn("用户账户未激活");
        // 可以在这里添加 setError("账户未激活") 或其他逻辑
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出
  const logout = () => {
    authLogout();
    setUser(null);
    router.push('/auth/login');
  };

  // 检查是否为管理员
  const checkIsAdmin = () => {
    // 直接检查用户的 is_admin 属性
    return user?.is_admin === true;
  };

  // 刷新用户信息
  const refreshUser = async (): Promise<User> => {
    try {
      const updatedUser = await fetchCurrentUser();
      setUser(updatedUser);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkIsAdmin,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 