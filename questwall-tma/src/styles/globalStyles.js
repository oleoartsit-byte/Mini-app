export const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  html {
    height: 100%;
    /* 支持 iOS 安全区域 */
    padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  body {
    background-color: #1c1c1d;
    /* 确保安全区域背景色一致 */
    padding-bottom: env(safe-area-inset-bottom);
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* 按钮按压效果 */
  button, .pressable {
    transition: transform 0.1s ease, opacity 0.1s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  button:active, .pressable:active {
    transform: scale(0.96);
    opacity: 0.9;
  }

  /* 卡片按压效果 */
  .card-pressable {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .card-pressable:active {
    transform: scale(0.98);
  }

  /* 列表项按压效果 */
  .list-item-pressable {
    transition: background-color 0.15s ease;
  }
  .list-item-pressable:active {
    background-color: rgba(128, 128, 128, 0.1);
  }

  /* 涟漪动画 */
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;

export const baseStyles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    minHeight: '100vh',
    paddingBottom: 20,
  },
  sectionHeader: {
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};
