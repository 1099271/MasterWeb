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
    console.error("Reset password error:", errorData);
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

// 获取用户列表（管理员接口）
export const getUserList = async (
  params: any = {}
): Promise<{ users: User[]; total: number }> => {
  const queryParams = new URLSearchParams();

  // 添加查询参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/admin/users?${queryParams.toString()}`);
};

// 获取用户详情（管理员接口）
export const getUserDetail = async (userId: number): Promise<User> => {
  return fetchWithAuth(`/api/admin/users/${userId}`);
};

// 更新用户状态（管理员接口）
export const updateUserStatus = async (
  userId: number,
  isActive: boolean
): Promise<User> => {
  return fetchWithAuth(`/api/admin/users/${userId}/status`, {
    method: "PUT",
    body: JSON.stringify({ is_active: isActive }),
  });
};

// 更新用户角色（管理员接口）
export const updateUserRole = async (
  userId: number,
  isAdmin: boolean
): Promise<User> => {
  return fetchWithAuth(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ is_admin: isAdmin }),
  });
};

// 获取用户的登录历史（管理员接口）
export const getUserLoginHistory = async (
  userId: number,
  skip = 0,
  limit = 10
): Promise<any[]> => {
  return fetchWithAuth(
    `/api/admin/users/${userId}/login-history?skip=${skip}&limit=${limit}`
  );
};

// 获取用户的活动历史（管理员接口）
export const getUserActivityHistory = async (
  userId: number,
  skip = 0,
  limit = 10
): Promise<any[]> => {
  return fetchWithAuth(
    `/api/admin/users/${userId}/activity-history?skip=${skip}&limit=${limit}`
  );
};

// 小红书接口相关函数

// 定义小红书笔记列表项类型
export interface XhsNoteListItem {
  note_id: string;
  note_url: string;
  note_cover_url_default: string | null;
  note_display_title: string | null;
  note_liked_count: number;
  comment_count: number;
  share_count: number;
  collected_count: number;
  author_id: string;
  author_nick_name: string | null;
  author_avatar: string | null;
  note_create_time: string | null;
  note_last_update_time: string | null;
}

// 定义分页响应类型
export interface PaginatedXhsNotesResponse {
  items: XhsNoteListItem[];
  total: number;
  page: number;
  page_size: number;
}

// 获取小红书笔记列表
export const getXhsNotesList = async (
  params: {
    page?: number;
    page_size?: number;
    note_id?: string;
    title?: string;
    content?: string;
    min_likes?: number;
    max_likes?: number;
    min_comments?: number;
    max_comments?: number;
    min_shares?: number;
    max_shares?: number;
    author_id?: string;
    author_name?: string;
    start_create_time?: string;
    end_create_time?: string;
    start_update_time?: string;
    end_update_time?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  } = {}
): Promise<PaginatedXhsNotesResponse> => {
  const queryParams = new URLSearchParams();

  // 添加查询参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/v1/xhs/notes/?${queryParams.toString()}`);
};

// 小红书笔记详情相关接口

// 定义笔记基础信息类型
export interface NoteBasicDetails {
  note_id: string;
  note_url: string | null;
  note_display_title: string | null;
  note_cover_url_default: string | null;
  note_liked_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  collected_count: number | null;
  note_desc: string | null;
  note_create_time: string | null;
  note_last_update_time: string | null;
  note_image_list: Array<{ url: string; width: number; height: number }> | null;
  note_tags: string[] | null;
  video_h264_url: string | null;
  auther_user_id: string | null;
  auther_nick_name: string | null;
  auther_avatar: string | null;
  auther_home_page_url: string | null;
}

// 定义作者详情类型
export interface AuthorDetails {
  user_id: string;
  nick_name: string | null;
  avatar: string | null;
  desc: string | null;
  ip_location: string | null;
  fans: string | null;
  follows: string | null;
  gender: string | null;
}

// 定义关键词群组类型
export interface KeywordGroupItem {
  retrieved_at: string | null;
  keyword_group: {
    group_id: number;
    group_name: string;
    keywords: string[] | null;
  };
}

// 获取笔记基础信息
export const getNoteBasicDetails = async (
  noteId: string
): Promise<NoteBasicDetails> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/basic`);
};

// 获取笔记作者详情
export const getNoteAuthorDetails = async (
  noteId: string
): Promise<AuthorDetails> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/author`);
};

// 获取笔记关键词群组
export const getNoteKeywordGroups = async (
  noteId: string
): Promise<KeywordGroupItem[]> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/keyword-groups`);
};

// 获取笔记评论
export const getNoteComments = async (noteId: string): Promise<any[]> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/comments`);
};

// 获取笔记的LLM诊断结果
export const getNoteLlmDiagnoses = async (noteId: string): Promise<any[]> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/llm-diagnoses`);
};

// 获取笔记的标签比较
export const getNoteTagComparisons = async (noteId: string): Promise<any[]> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/tag-comparisons`);
};

// 获取笔记的评论分析
export const getNoteCommentAnalyses = async (
  noteId: string
): Promise<any[]> => {
  return fetchWithAuth(`/api/v1/xhs/notes/${noteId}/comment-analyses`);
};
