import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // 如果您仍在使用 pages 目录
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // 启用 class 策略以配合 next-themes
  theme: {
    extend: {
      // 在这里可以添加自定义主题配置，例如颜色、字体等
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // 示例：添加一些常用的暗黑模式颜色变量 (可选)
      colors: {
        dark: {
          primary: "#1F2937", // 例如 bg-dark-primary
          secondary: "#374151", // 例如 bg-dark-secondary
          text: "#F9FAFB", // 例如 text-dark-text
          border: "#4B5563", // 例如 border-dark-border
        },
      },
    },
  },
  plugins: [],
};
export default config;
