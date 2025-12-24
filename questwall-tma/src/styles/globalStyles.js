export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* 全局按钮重置 */
  button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    -webkit-tap-highlight-color: transparent;
  }

  html {
    height: 100%;
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
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Rajdhani', sans-serif;
    background: linear-gradient(165deg,
      #0a0a18 0%,
      #0f0f25 15%,
      #151535 30%,
      #1a1a40 50%,
      #12122a 70%,
      #0d0d1f 85%,
      #080815 100%
    );
    color: #fff;
    padding-bottom: env(safe-area-inset-bottom);
    min-height: 100vh;
    position: relative;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'kern' 1;
  }

  /* 网格背景 - 更明显 */
  .bg-grid {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      linear-gradient(90deg, rgba(100, 150, 255, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(150, 100, 255, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    pointer-events: none;
    z-index: 0;
  }

  /* 动态光球容器 */
  .bg-orbs {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  /* 大面积背景光晕 - 丰富多彩效果 */
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 1;
  }

  /* 顶部左侧 - 亮青色 */
  .orb-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, rgba(0, 200, 255, 0.5) 40%, transparent 70%);
    top: -5%;
    left: -10%;
    animation: float1 18s ease-in-out infinite;
  }

  /* 顶部右侧 - 亮紫粉色 */
  .orb-2 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(255, 0, 255, 0.75) 0%, rgba(200, 50, 255, 0.5) 40%, transparent 70%);
    top: 5%;
    right: -15%;
    animation: float2 22s ease-in-out infinite;
  }

  /* 中部左侧 - 蓝紫色 */
  .orb-3 {
    width: 500px;
    height: 350px;
    background: radial-gradient(ellipse, rgba(100, 50, 255, 0.7) 0%, rgba(80, 80, 200, 0.45) 40%, transparent 70%);
    top: 25%;
    left: -20%;
    animation: float3 25s ease-in-out infinite;
  }

  /* 中部右侧 - 橙粉色 */
  .orb-4 {
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(255, 100, 150, 0.7) 0%, rgba(255, 80, 120, 0.45) 40%, transparent 70%);
    top: 35%;
    right: -10%;
    animation: float4 20s ease-in-out infinite;
  }

  /* 底部左侧 - 深蓝色 */
  .orb-5 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, rgba(50, 100, 255, 0.7) 0%, rgba(80, 80, 200, 0.45) 40%, transparent 70%);
    bottom: 15%;
    left: -15%;
    animation: float5 28s ease-in-out infinite;
  }

  /* 底部右侧 - 品红/粉紫色 */
  .orb-6 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255, 50, 200, 0.75) 0%, rgba(200, 50, 180, 0.5) 40%, transparent 70%);
    bottom: -5%;
    right: -20%;
    animation: float1 30s ease-in-out infinite reverse;
  }

  /* 额外光球 - 中间黄橙色点缀 */
  .orb-7 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255, 180, 50, 0.5) 0%, rgba(255, 150, 0, 0.3) 40%, transparent 70%);
    top: 50%;
    left: 30%;
    animation: float2 24s ease-in-out infinite;
  }

  /* 额外光球 - 顶部中间绿青色 */
  .orb-8 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(0, 255, 180, 0.55) 0%, rgba(0, 200, 150, 0.35) 40%, transparent 70%);
    top: 10%;
    left: 40%;
    animation: float3 26s ease-in-out infinite reverse;
  }

  @keyframes float1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -20px) scale(1.05); }
    50% { transform: translate(-20px, 30px) scale(0.95); }
    75% { transform: translate(20px, 10px) scale(1.02); }
  }

  @keyframes float2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-40px, 20px) scale(1.08); }
    66% { transform: translate(20px, -30px) scale(0.92); }
  }

  @keyframes float3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(25px, 25px) scale(1.1); }
    50% { transform: translate(-30px, -10px) scale(0.9); }
    75% { transform: translate(-10px, 35px) scale(1.05); }
  }

  @keyframes float4 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-35px, -25px) scale(1.15); }
  }

  @keyframes float5 {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    33% { transform: translate(-45%, -55%) scale(1.1); }
    66% { transform: translate(-55%, -45%) scale(0.9); }
  }

  /* 星星闪烁 - 12颗星星 */
  .stars {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 4px 1px rgba(255,255,255,0.3);
    animation: twinkle 3s ease-in-out infinite;
  }

  .star:nth-child(1) { top: 5%; left: 10%; animation-delay: 0s; }
  .star:nth-child(2) { top: 12%; left: 80%; animation-delay: 0.5s; background: #00e5ff; box-shadow: 0 0 6px 2px rgba(0,229,255,0.6); }
  .star:nth-child(3) { top: 20%; left: 25%; animation-delay: 1s; }
  .star:nth-child(4) { top: 35%; left: 60%; animation-delay: 1.5s; background: #ff4da6; box-shadow: 0 0 6px 2px rgba(255,77,166,0.6); }
  .star:nth-child(5) { top: 45%; left: 15%; animation-delay: 0.3s; }
  .star:nth-child(6) { top: 55%; left: 85%; animation-delay: 0.8s; background: #ffe135; box-shadow: 0 0 6px 2px rgba(255,225,53,0.6); }
  .star:nth-child(7) { top: 65%; left: 40%; animation-delay: 1.2s; }
  .star:nth-child(8) { top: 75%; left: 70%; animation-delay: 0.6s; background: #39ff14; box-shadow: 0 0 6px 2px rgba(57,255,20,0.6); }
  .star:nth-child(9) { top: 82%; left: 5%; animation-delay: 1.8s; }
  .star:nth-child(10) { top: 88%; left: 55%; animation-delay: 0.2s; background: #bf5fff; box-shadow: 0 0 6px 2px rgba(191,95,255,0.6); }
  .star:nth-child(11) { top: 28%; left: 92%; animation-delay: 1.4s; }
  .star:nth-child(12) { top: 95%; left: 30%; animation-delay: 0.9s; }

  @keyframes twinkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
  }

  /* 流星效果 */
  .meteors {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .meteor {
    position: absolute;
    width: 2px;
    height: 80px;
    background: linear-gradient(to bottom, rgba(255,255,255,0.8), transparent);
    transform: rotate(45deg);
    animation: meteor 3s linear infinite;
    opacity: 0;
  }

  .meteor:nth-child(1) {
    top: 10%;
    left: 20%;
    animation-delay: 0s;
  }

  .meteor:nth-child(2) {
    top: 5%;
    left: 50%;
    animation-delay: 1.5s;
  }

  .meteor:nth-child(3) {
    top: 15%;
    left: 75%;
    animation-delay: 3s;
  }

  .meteor:nth-child(4) {
    top: 8%;
    left: 35%;
    animation-delay: 4.5s;
  }

  @keyframes meteor {
    0% {
      opacity: 0;
      transform: rotate(45deg) translate(0, 0);
    }
    10% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translate(300px, 300px);
    }
  }

  /* 通用动画 */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.02); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
    50% { box-shadow: 0 0 30px rgba(0, 229, 255, 0.5); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  /* 彩虹边框动画 */
  @keyframes rainbowBorder {
    0% { background-position: 0% 50%; }
    100% { background-position: 400% 50%; }
  }

  /* 卡片扫描光效果 */
  @keyframes cardShine {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  /* 图标浮动效果 */
  @keyframes iconFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* 弹跳效果 */
  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* 金色脉冲效果 */
  @keyframes goldPulse {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.3);
    }
    50% {
      box-shadow: 0 0 35px rgba(255, 193, 7, 0.5);
    }
  }

  /* 按钮按压效果 */
  button, .pressable {
    transition: transform 0.1s ease, opacity 0.1s ease, box-shadow 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  button:active, .pressable:active {
    transform: scale(0.96);
    opacity: 0.9;
  }

  /* 卡片按压效果 */
  .card-pressable {
    transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.2s ease;
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

  /* 霓虹按钮 */
  .neon-btn {
    background: linear-gradient(135deg, #00e5ff, #bf5fff);
    border: none;
    border-radius: 12px;
    color: #000;
    font-family: 'Orbitron', sans-serif;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .neon-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
  }

  .neon-btn:hover::before {
    left: 100%;
  }

  /* 发光边框卡片 - 更亮 */
  .glow-card {
    position: relative;
    border: 1px solid rgba(0, 229, 255, 0.3);
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(35, 35, 60, 0.95), rgba(25, 25, 50, 0.95));
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .glow-card:hover {
    border-color: rgba(0, 229, 255, 0.5);
    box-shadow: 0 0 25px rgba(0, 229, 255, 0.2);
  }

  /* 任务卡片扫描效果 */
  .task-card {
    position: relative;
    overflow: hidden;
  }

  .task-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0,229,255,0.1), transparent);
    transition: left 0.5s ease;
    pointer-events: none;
  }

  .task-card:hover::after,
  .task-card:active::after {
    left: 100%;
  }

  /* 科技感字体 */
  .font-orbitron {
    font-family: 'Orbitron', sans-serif;
  }

  .font-mono {
    font-family: 'Roboto Mono', monospace;
  }

  /* 霓虹文字发光 */
  .text-glow-cyan {
    color: #00e5ff;
    text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
  }

  .text-glow-pink {
    color: #ff4da6;
    text-shadow: 0 0 10px rgba(255, 77, 166, 0.5);
  }

  .text-glow-gold {
    color: #ffc107;
    text-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
  }

  .text-glow-green {
    color: #39ff14;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  }

  /* 隐藏滚动条但保留滚动功能 */
  .hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
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
    fontFamily: "'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    minHeight: '100vh',
    paddingBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  sectionHeader: {
    padding: '12px 16px',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: 0.5,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
};
