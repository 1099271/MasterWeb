import {
  User,
  UserCreate,
  UserUpdate,
  UserPassword,
  LoginResponse,
  EmailRequest,
  EmailVerifyRequest,
  PasswordResetRequest,
} from "../types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 获取存储的Token
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// 设置Token到localStorage
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// 清除Token
export const clearToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// 获取当前用户
export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
  }
  return null;
};

// 设置当前用户
export const setCurrentUser = (user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// API请求包装
const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // 如果返回401，清除token和用户信息
  if (response.status === 401) {
    clearToken();
    // 可以在这里添加重定向到登录页面的逻辑
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "API request failed");
  }

  return data;
};

// 用户注册
export const register = async (userData: UserCreate): Promise<User> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration failed");
  }

  return data;
};

// 用户登录
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  formData.append("grant_type", "password");

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  // 保存token和用户信息到localStorage
  setToken(data.access_token);
  setCurrentUser(data.user);

  return data;
};

// 登出
export const logout = (): void => {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

// 获取当前用户信息
export const fetchCurrentUser = async (): Promise<User> => {
  return fetchWithAuth("/api/users/me");
};

// 更新用户信息
export const updateUser = async (userData: UserUpdate): Promise<User> => {
  return fetchWithAuth("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

// 修改密码
export const changePassword = async (
  passwordData: UserPassword
): Promise<void> => {
  return fetchWithAuth("/api/users/me/password", {
    method: "PUT",
    body: JSON.stringify(passwordData),
  });
};

// 找回密码请求
export const forgotPassword = async (data: EmailRequest): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.detail || "Failed to process forgot password request"
    );
  }
};

// 重置密码
export const resetPassword = async (
  data: PasswordResetRequest
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to reset password");
  }
};

// 验证邮箱
export const verifyEmail = async (token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to verify email");
  }
};

// 重新发送验证邮件
export const resendVerification = async (data: EmailRequest): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to resend verification email");
  }
};

// 获取登录历史
export const getLoginHistory = async (skip = 0, limit = 10): Promise<any[]> => {
  return fetchWithAuth(
    `/api/users/me/login-history?skip=${skip}&limit=${limit}`
  );
};

// 获取活动历史
export const getActivityHistory = async (
  skip = 0,
  limit = 10
): Promise<any[]> => {
  return fetchWithAuth(
    `/api/users/me/activity-history?skip=${skip}&limit=${limit}`
  );
};
