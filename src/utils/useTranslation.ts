import { useCallback } from "react";
import zhCN from "@/locales";

// 支持的语言类型
type Locale = "zh-CN"; // 可以在未来添加更多语言

// 获取翻译的钩子函数
export const useTranslation = (locale: Locale = "zh-CN") => {
  // 获取对象路径的值，例如 'messages.error.general'
  const getNestedValue = useCallback((obj: any, path: string) => {
    const keys = path.split(".");
    return keys.reduce((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return acc[key];
      }
      return undefined;
    }, obj);
  }, []);

  // 获取翻译文本
  const t = useCallback(
    (key: string, placeholders?: Record<string, string>) => {
      // 选择语言包
      const translations = locale === "zh-CN" ? zhCN : zhCN; // 目前只有中文

      // 获取翻译文本
      let text = getNestedValue(translations, key);

      // 如果翻译不存在，返回键名
      if (!text) {
        console.warn(`Translation not found for key: ${key}`);
        return key;
      }

      // 替换占位符
      if (placeholders) {
        Object.entries(placeholders).forEach(([placeholder, value]) => {
          text = text.replace(new RegExp(`{${placeholder}}`, "g"), value);
        });
      }

      return text;
    },
    [locale, getNestedValue]
  );

  return { t };
};
