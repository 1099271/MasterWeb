export type Environment = "development" | "test" | "production";

interface EnvironmentConfig {
  apiUrl: string;
  apiTimeout: number;
  debug: boolean;
}

const configs: Record<Environment, EnvironmentConfig> = {
  development: {
    apiUrl: "http://127.0.0.1:8000",
    apiTimeout: 10000,
    debug: true,
  },
  test: {
    apiUrl: "https://api-test.example.com",
    apiTimeout: 10000,
    debug: true,
  },
  production: {
    apiUrl: "https://api.example.com",
    apiTimeout: 15000,
    debug: false,
  },
};

// 获取当前环境，默认为开发环境
export const getEnvironment = (): Environment => {
  const env = (process.env.NEXT_PUBLIC_APP_ENV as Environment) || "development";
  return env;
};

// 获取当前环境的配置
export const getConfig = (): EnvironmentConfig => {
  const env = getEnvironment();
  return configs[env];
};

// 导出当前环境的配置
export const config = getConfig();
