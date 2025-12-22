// 多语言 Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { locales, createT, detectLocale, supportedLocales } from '../locales';

export function useLocale() {
  // 初始化语言
  const [locale, setLocaleState] = useState(() => detectLocale());

  // 切换语言
  const setLocale = useCallback((newLocale) => {
    if (locales[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('questwall_locale', newLocale);
    }
  }, []);

  // 创建翻译函数
  const t = useMemo(() => createT(locale), [locale]);

  // 监听 Telegram 语言变化
  useEffect(() => {
    const handleVisibilityChange = () => {
      // 当应用重新可见时，检查是否需要更新语言
      if (document.visibilityState === 'visible') {
        const savedLocale = localStorage.getItem('questwall_locale');
        if (savedLocale && savedLocale !== locale && locales[savedLocale]) {
          setLocaleState(savedLocale);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [locale]);

  return {
    locale,           // 当前语言代码 'zh' | 'en'
    setLocale,        // 设置语言
    t,                // 翻译函数 t('key') 或 t('key', { param: value })
    locales: supportedLocales, // 支持的语言列表
    isZh: locale === 'zh',
    isEn: locale === 'en',
  };
}

export default useLocale;
