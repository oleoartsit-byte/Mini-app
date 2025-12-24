/**
 * Quest Wall TMA 设计系统常量
 * 统一管理颜色、字体、间距、圆角、阴影等设计规范
 */

// ============ 颜色系统 ============
export const COLORS = {
  // 核心品牌色
  primary: {
    cyan: '#00e5ff',
    purple: '#bf5fff',
    gradient: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
  },

  // 强调色
  accent: {
    green: '#39ff14',
    gold: '#ffc107',
    pink: '#ff4da6',
    orange: '#ff9500',
  },

  // 功能色
  semantic: {
    success: '#39ff14',
    warning: '#ffc107',
    error: '#ff4da6',
    info: '#00e5ff',
    usdt: '#26A17B',
  },

  // 文本颜色
  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },

  // 背景色
  background: {
    page: 'linear-gradient(180deg, #14142a 0%, #1a1a35 50%, #18182f 100%)',
    card: 'rgba(20, 20, 45, 0.75)',
    cardSolid: '#0f0f23',
    cardGradient: 'linear-gradient(165deg, #191932 0%, #0f0f23 100%)',
    modal: 'linear-gradient(180deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
    input: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  // 边框色
  border: {
    cyan: 'rgba(0, 229, 255, 0.2)',
    cyanStrong: 'rgba(0, 229, 255, 0.35)',
    subtle: 'rgba(255, 255, 255, 0.1)',
    gold: 'rgba(255, 193, 7, 0.4)',
    pink: 'rgba(255, 77, 166, 0.4)',
  },
};

// ============ 渐变色 ============
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
  gold: 'linear-gradient(135deg, #ffc107, #ff9500)',
  green: 'linear-gradient(135deg, #39ff14, #00e5ff)',
  pink: 'linear-gradient(135deg, #ff4da6, #bf5fff)',
  usdt: 'linear-gradient(135deg, #26A17B 0%, #3CB371 100%)',
  card: 'linear-gradient(165deg, #191932 0%, #0f0f23 100%)',
};

// ============ 字体系统 ============
export const TYPOGRAPHY = {
  // 字体族
  fontFamily: {
    display: "'Orbitron', sans-serif",        // 标题、数字
    body: "'Rajdhani', sans-serif",           // 正文、副标题
    mono: "'Roboto Mono', monospace",         // 地址、代码
    system: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  },

  // 字重
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // 字号
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 22,
    '4xl': 28,
    '5xl': 32,
  },
};

// ============ 间距系统 ============
// 基于 4px 网格
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

// ============ 圆角系统 ============
export const RADII = {
  xs: 6,    // 小徽章、标签
  sm: 8,    // 小按钮
  md: 12,   // 按钮、输入框
  lg: 16,   // 卡片
  xl: 20,   // 模态框
  full: 9999,  // 圆形
};

// ============ 阴影系统 ============
export const SHADOWS = {
  none: 'none',
  sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  md: '0 4px 16px rgba(0, 0, 0, 0.3)',
  lg: '0 4px 20px rgba(0, 0, 0, 0.5)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.5)',
  glow: {
    cyan: '0 0 20px rgba(0, 229, 255, 0.3)',
    purple: '0 0 20px rgba(191, 95, 255, 0.3)',
    green: '0 0 10px rgba(57, 255, 20, 0.4)',
    gold: '0 0 15px rgba(255, 193, 7, 0.4)',
  },
};

// ============ 动画时间 ============
export const TRANSITIONS = {
  fast: '0.15s ease',
  default: '0.3s ease',
  slow: '0.4s ease',
  spring: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

// ============ 图标尺寸 ============
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 48,
};

// ============ 可复用组件样式 ============
export const COMPONENT_STYLES = {
  // 标准卡片
  card: {
    backgroundColor: COLORS.background.cardSolid,
    background: GRADIENTS.card,
    borderRadius: RADII.lg,
    border: `1px solid ${COLORS.border.cyan}`,
    boxShadow: SHADOWS.lg,
    position: 'relative',
    zIndex: 10,
    isolation: 'isolate',
  },

  // 毛玻璃卡片
  glassCard: {
    background: COLORS.background.card,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: RADII.lg,
    border: `1px solid ${COLORS.border.cyan}`,
  },

  // 主按钮
  primaryButton: {
    background: GRADIENTS.primary,
    color: '#000',
    borderRadius: RADII.md,
    border: 'none',
    fontFamily: TYPOGRAPHY.fontFamily.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
  },

  // 次级按钮
  secondaryButton: {
    background: 'rgba(0, 229, 255, 0.1)',
    color: COLORS.primary.cyan,
    borderRadius: RADII.md,
    border: `1px solid ${COLORS.border.cyan}`,
    fontFamily: TYPOGRAPHY.fontFamily.display,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    cursor: 'pointer',
    transition: TRANSITIONS.default,
  },

  // 输入框
  input: {
    background: COLORS.background.input,
    border: `1px solid ${COLORS.border.cyanStrong}`,
    borderRadius: RADII.md,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    outline: 'none',
  },

  // 标签/徽章
  badge: {
    borderRadius: RADII.xs,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },

  // 标题样式
  pageTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    fontFamily: TYPOGRAPHY.fontFamily.display,
    color: COLORS.text.primary,
    margin: 0,
    textShadow: `0 0 10px ${COLORS.primary.cyan}40`,
  },

  // 副标题样式
  pageSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.body,
    color: COLORS.text.secondary,
    margin: 0,
  },

  // 加载动画样式
  spinner: {
    width: 24,
    height: 24,
    border: `3px solid ${COLORS.border.cyan}`,
    borderTopColor: COLORS.primary.cyan,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// ============ 文本发光效果 ============
export const TEXT_GLOW = {
  cyan: `0 0 8px ${COLORS.primary.cyan}50`,
  green: `0 0 10px rgba(57, 255, 20, 0.4)`,
  pink: `0 0 10px rgba(255, 77, 166, 0.4)`,
  gold: `0 0 8px rgba(255, 193, 7, 0.4)`,
};

export default {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  RADII,
  SHADOWS,
  TRANSITIONS,
  ICON_SIZES,
  COMPONENT_STYLES,
  TEXT_GLOW,
};
