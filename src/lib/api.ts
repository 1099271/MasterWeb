import { config } from "@/config/env";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  withAuth?: boolean;
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const api = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { method = "GET", body, headers = {}, withAuth = true } = options;

  // 构建完整的API URL
  const url = `${config.apiUrl}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  // 设置请求头
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // 如果需要认证，添加认证头
  if (withAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // 请求配置
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: "include", // 包含跨域cookie
  };

  // 如果有请求体，添加到请求选项中
  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // 设置超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);
    requestOptions.signal = controller.signal;

    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    // 如果响应不成功，抛出错误
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`
        );
      }
      throw {
        status: response.status,
        message:
          errorData.message ||
          `HTTP error ${response.status}: ${response.statusText}`,
        data: errorData,
      };
    }

    // 解析响应数据
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("请求超时，请稍后重试");
    }
    throw error;
  }
};
