// 多语言系统入口
import { locales } from './locales';

export { locales };

// 获取嵌套对象的值
export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// 替换占位符 {key}
export function replacePlaceholders(str, params = {}) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

// 创建翻译函数
export function createT(locale) {
  const messages = locales[locale] || locales.zh;

  return function t(key, params) {
    const value = getNestedValue(messages, key);
    if (value === undefined) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return replacePlaceholders(value, params);
  };
}

// 支持的语言列表
export const supportedLocales = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

// 检测用户语言偏好
export function detectLocale() {
  // 1. 检查 localStorage
  const saved = localStorage.getItem('questwall_locale');
  if (saved && locales[saved]) {
    return saved;
  }

  // 2. 检查 Telegram 语言
  const tg = window.Telegram?.WebApp;
  if (tg?.initDataUnsafe?.user?.language_code) {
    const tgLang = tg.initDataUnsafe.user.language_code;
    if (tgLang.startsWith('zh')) return 'zh';
    if (tgLang.startsWith('en')) return 'en';
  }

  // 3. 检查浏览器语言
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('en')) return 'en';
  }

  // 4. 默认中文
  return 'zh';
}
