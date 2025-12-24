import { useState, useEffect } from 'react';

// 霓虹赛博朋克主题 - 固定暗色风格
export function useTheme(tg) {
  // 霓虹配色
  const neonColors = {
    cyan: '#00e5ff',
    pink: '#ff4da6',
    yellow: '#ffe135',
    green: '#39ff14',
    purple: '#bf5fff',
    gold: '#ffc107',
    blue: '#3b82f6',
  };

  return {
    // 基础颜色
    bg: '#1a1a2e',
    secondaryBg: '#2c2c4a',
    cardBg: 'rgba(30, 30, 55, 0.95)',
    cardBgLight: 'rgba(45, 45, 80, 0.95)',
    text: '#ffffff',
    hint: 'rgba(255,255,255,0.5)',
    link: neonColors.cyan,

    // 按钮
    button: neonColors.cyan,
    buttonText: '#000000',

    // 状态颜色
    accent: neonColors.cyan,
    success: neonColors.green,
    warning: neonColors.yellow,
    danger: '#ff4757',

    // 霓虹颜色
    neon: neonColors,

    // 边框发光
    borderGlow: 'rgba(0, 229, 255, 0.4)',

    // 渐变
    gradients: {
      primary: `linear-gradient(135deg, ${neonColors.cyan}, ${neonColors.purple})`,
      gold: `linear-gradient(135deg, ${neonColors.gold}, #ff9500)`,
      pink: `linear-gradient(135deg, ${neonColors.pink}, ${neonColors.purple})`,
      green: `linear-gradient(135deg, ${neonColors.green}, ${neonColors.cyan})`,
      card: 'linear-gradient(145deg, rgba(40, 40, 75, 0.95), rgba(30, 30, 60, 0.95))',
      cardHover: 'linear-gradient(145deg, rgba(50, 50, 90, 0.95), rgba(40, 40, 70, 0.95))',
    },

    // 阴影
    shadows: {
      cyan: `0 0 20px rgba(0, 229, 255, 0.4)`,
      pink: `0 0 20px rgba(255, 77, 166, 0.4)`,
      gold: `0 0 20px rgba(255, 193, 7, 0.4)`,
      green: `0 0 20px rgba(57, 255, 20, 0.4)`,
      purple: `0 0 20px rgba(191, 95, 255, 0.4)`,
    },

    // 固定为暗色模式
    isDark: true,
    themeMode: 'dark',
    setThemeMode: () => {}, // 不再支持切换
  };
}
