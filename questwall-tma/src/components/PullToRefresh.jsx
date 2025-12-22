import { useState, useRef, useEffect } from 'react';

export function PullToRefresh({ onRefresh, children, theme }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const THRESHOLD = 60; // 触发刷新的阈值

  // 使用 useEffect 添加非 passive 的 touchmove 监听器
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 0 && container.scrollTop === 0) {
        e.preventDefault();
        // 阻尼效果
        setPullDistance(Math.min(diff * 0.5, THRESHOLD * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;

      const currentPullDistance = pullDistance;

      if (currentPullDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullDistance(THRESHOLD);

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    // 添加事件监听器，touchmove 设置 passive: false
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, onRefresh, pullDistance]);

  const spinnerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: pullDistance,
    overflow: 'hidden',
    transition: isPulling.current ? 'none' : 'height 0.3s ease',
  };

  const iconStyle = {
    fontSize: 20,
    color: theme?.hint || '#8e8e93',
    transform: `rotate(${pullDistance * 3}deg)`,
    transition: isPulling.current ? 'none' : 'transform 0.3s ease',
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflowY: 'auto',
        height: '100%',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div style={spinnerStyle}>
        {isRefreshing ? (
          <div style={{
            width: 24,
            height: 24,
            border: `2px solid ${theme?.hint || '#8e8e93'}30`,
            borderTopColor: theme?.link || '#007aff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
        ) : (
          <span style={iconStyle}>
            {pullDistance >= THRESHOLD ? '↻' : '↓'}
          </span>
        )}
      </div>
      <div style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling.current ? 'none' : 'transform 0.3s ease',
      }}>
        {children}
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
