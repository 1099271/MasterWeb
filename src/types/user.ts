export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  avatar?: string;
  bio?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  avatar?: string;
  bio?: string;
}

export interface UserPassword {
  old_password: string;
  new_password: string;
}

export interface EmailRequest {
  email: string;
  frontend_url?: string;
}

export interface EmailVerifyRequest {
  token: string;
}

export interface PasswordResetRequest {
  token: string;
  new_password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginHistory {
  id: number;
  user_id: number;
  ip_address: string;
  user_agent: string;
  login_time: string;
}

export interface ActivityHistory {
  id: number;
  user_id: number;
  action: string;
  description: string;
  created_at: string;
}

export interface UserRoleUpdate {
  user_id: number;
  is_admin: boolean;
}

export interface UserListParams {
  skip?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_admin?: boolean;
  order_by?: string;
  order_direction?: "asc" | "desc";
}
