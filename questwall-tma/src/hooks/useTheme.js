import { useState, useEffect } from 'react';

// 主题模式：'system' | 'light' | 'dark'
export function useTheme(tg) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('questwall_theme');
    return saved || 'system';
  });

  // 保存主题设置
  useEffect(() => {
    localStorage.setItem('questwall_theme', themeMode);
  }, [themeMode]);

  // 判断是否深色模式
  const getIsDark = () => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // system 模式，跟随 Telegram
    return tg?.colorScheme === 'dark';
  };

  const isDark = getIsDark();

  return {
    bg: isDark ? '#1c1c1d' : '#ffffff',
    secondaryBg: isDark ? '#2c2c2e' : '#f2f2f7',
    text: isDark ? '#ffffff' : '#000000',
    hint: '#8e8e93',
    link: '#007aff',
    button: '#007aff',
    buttonText: '#ffffff',
    accent: '#007aff',
    success: '#34c759',
    warning: '#ff9500',
    danger: '#ff3b30',
    isDark,
    themeMode,
    setThemeMode,
  };
}
