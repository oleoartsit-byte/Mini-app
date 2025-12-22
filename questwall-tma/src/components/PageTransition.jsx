import React, { useState, useEffect } from 'react';

// 页面切换动画样式 - 优化版
const transitionStyles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-40px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.85);
    opacity: 0;
  }
  60% {
    transform: scale(1.03);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideUpBounce {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  70% {
    transform: translateY(-5px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.page-transition-fade {
  animation: fadeIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-slide-right {
  animation: slideInRight 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-slide-left {
  animation: slideInLeft 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-slide-up {
  animation: slideInUp 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-scale {
  animation: scaleIn 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-bounce {
  animation: bounceIn 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.page-transition-slide-up-bounce {
  animation: slideUpBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
`;

// 页面切换容器组件
export function PageTransition({
  children,
  pageKey,
  type = 'fade',
  duration = 300
}) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');

  useEffect(() => {
    setTransitionStage('enter');
    setDisplayChildren(children);
  }, [pageKey, children]);

  const getAnimationClass = () => {
    switch (type) {
      case 'slide-right':
        return 'page-transition-slide-right';
      case 'slide-left':
        return 'page-transition-slide-left';
      case 'slide-up':
        return 'page-transition-slide-up';
      case 'scale':
        return 'page-transition-scale';
      case 'bounce':
        return 'page-transition-bounce';
      default:
        return 'page-transition-fade';
    }
  };

  return (
    <>
      <style>{transitionStyles}</style>
      <div
        key={pageKey}
        className={getAnimationClass()}
        style={{
          minHeight: '100%',
        }}
      >
        {displayChildren}
      </div>
    </>
  );
}

// Tab 切换方向判断 Hook
export function useTabDirection(currentTab, previousTab) {
  const tabOrder = ['home', 'quests', 'rewards', 'profile'];
  const currentIndex = tabOrder.indexOf(currentTab);
  const previousIndex = tabOrder.indexOf(previousTab);

  if (currentIndex > previousIndex) {
    return 'slide-right';
  } else if (currentIndex < previousIndex) {
    return 'slide-left';
  }
  return 'fade';
}

// 列表项动画 - 交错进入
export function StaggeredList({ children, delay = 50 }) {
  return (
    <>
      <style>{`
        @keyframes staggerFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            animation: `staggerFadeIn 0.3s ease-out forwards`,
            animationDelay: `${index * delay}ms`,
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}

// 按钮点击反馈动画
export function AnimatedButton({
  children,
  onClick,
  style = {},
  activeScale = 0.95,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      {...props}
      style={{
        ...style,
        transform: isPressed ? `scale(${activeScale})` : 'scale(1)',
        transition: 'transform 0.1s ease',
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 数字滚动动画
export function AnimatedNumber({ value, duration = 500 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // 使用 easeOutCubic 缓动
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
}

// 脉冲动画（用于提示）
export function PulseAnimation({ children, active = true }) {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .pulse-active {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className={active ? 'pulse-active' : ''}>
        {children}
      </div>
    </>
  );
}

// 成功动画（打勾）
export function SuccessAnimation({ show, size = 60 }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes checkmark {
          0% {
            stroke-dashoffset: 50;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes circleScale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .success-circle {
          animation: circleScale 0.4s ease-out forwards;
        }
        .success-check {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: checkmark 0.4s ease-out 0.2s forwards;
        }
      `}</style>
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={size} height={size} viewBox="0 0 60 60">
          <circle
            className="success-circle"
            cx="30"
            cy="30"
            r="28"
            fill="#34c759"
          />
          <path
            className="success-check"
            d="M18 30 L26 38 L42 22"
            fill="none"
            stroke="#fff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
}
