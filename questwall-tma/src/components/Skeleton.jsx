import React from 'react';

// 骨架屏基础样式 - 优化版
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes skeletonFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// 骨架屏基础组件
export function SkeletonBase({ width, height, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #2c2c2e 25%, #3a3a3c 50%, #2c2c2e 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

// 任务卡片骨架屏
export function QuestCardSkeleton({ theme }) {
  const isDark = theme.bg !== '#ffffff';
  const baseColor = isDark ? '#2c2c2e' : '#e5e5ea';
  const shimmerColor = isDark ? '#3a3a3c' : '#f2f2f7';

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: 16,
          padding: 16,
          margin: '0 16px 12px',
          border: `1px solid ${theme.secondaryBg}`,
        }}
      >
        <div style={{ display: 'flex', gap: 14 }}>
          {/* 图标骨架 */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            {/* 标签骨架 */}
            <div
              style={{
                width: 60,
                height: 18,
                borderRadius: 9,
                marginBottom: 8,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            {/* 标题骨架 */}
            <div
              style={{
                width: '80%',
                height: 18,
                borderRadius: 4,
                marginBottom: 6,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            {/* 描述骨架 */}
            <div
              style={{
                width: '60%',
                height: 14,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
          {/* 按钮骨架 */}
          <div
            style={{
              width: 64,
              height: 36,
              borderRadius: 18,
              alignSelf: 'center',
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}

// 用户卡片骨架屏
export function UserCardSkeleton({ theme }) {
  const isDark = theme.bg !== '#ffffff';
  const baseColor = isDark ? '#2c2c2e' : '#e5e5ea';
  const shimmerColor = isDark ? '#3a3a3c' : '#f2f2f7';

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          borderRadius: 20,
          padding: 20,
          margin: '0 16px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* 头像骨架 */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            {/* 名字骨架 */}
            <div
              style={{
                width: 100,
                height: 18,
                borderRadius: 4,
                marginBottom: 8,
                background: 'rgba(255,255,255,0.2)',
              }}
            />
            {/* 状态骨架 */}
            <div
              style={{
                width: 60,
                height: 14,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.15)',
              }}
            />
          </div>
        </div>
        {/* 统计数据骨架 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginTop: 16,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 20,
                  borderRadius: 4,
                  margin: '0 auto 4px',
                  background: 'rgba(255,255,255,0.2)',
                }}
              />
              <div
                style={{
                  width: 50,
                  height: 12,
                  borderRadius: 4,
                  margin: '0 auto',
                  background: 'rgba(255,255,255,0.15)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// 签到卡片骨架屏
export function CheckInCardSkeleton({ theme }) {
  const isDark = theme.bg !== '#ffffff';
  const baseColor = isDark ? '#2c2c2e' : '#e5e5ea';
  const shimmerColor = isDark ? '#3a3a3c' : '#f2f2f7';

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: 16,
          padding: 16,
          margin: '0 16px 16px',
          border: `1px solid ${theme.secondaryBg}`,
        }}
      >
        {/* 标题骨架 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 20,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <div
            style={{
              width: 60,
              height: 20,
              borderRadius: 4,
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
        {/* 日期格子骨架 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 8,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// 钱包卡片骨架屏
export function WalletCardSkeleton({ theme }) {
  const isDark = theme.bg !== '#ffffff';
  const baseColor = isDark ? '#2c2c2e' : '#e5e5ea';
  const shimmerColor = isDark ? '#3a3a3c' : '#f2f2f7';

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          backgroundColor: theme.bg,
          borderRadius: 16,
          padding: 16,
          margin: '0 16px 16px',
          border: `1px solid ${theme.secondaryBg}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {/* 标题骨架 */}
            <div
              style={{
                width: 60,
                height: 14,
                borderRadius: 4,
                marginBottom: 8,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            {/* 地址骨架 */}
            <div
              style={{
                width: 120,
                height: 18,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
          {/* 按钮骨架 */}
          <div
            style={{
              width: 80,
              height: 36,
              borderRadius: 18,
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}

// 首页骨架屏组合 - 带交错动画
export function HomePageSkeleton({ theme }) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={{ paddingTop: 60 }}>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '0ms', opacity: 0 }}>
          <UserCardSkeleton theme={theme} />
        </div>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '80ms', opacity: 0 }}>
          <CheckInCardSkeleton theme={theme} />
        </div>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '160ms', opacity: 0 }}>
          <WalletCardSkeleton theme={theme} />
        </div>
        <div style={{
          padding: '8px 20px 12px',
          animation: 'skeletonFadeIn 0.3s ease-out forwards',
          animationDelay: '240ms',
          opacity: 0,
        }}>
          <div
            style={{
              width: 80,
              height: 14,
              borderRadius: 4,
              background: theme.secondaryBg,
            }}
          />
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              animation: 'skeletonFadeIn 0.3s ease-out forwards',
              animationDelay: `${300 + i * 60}ms`,
              opacity: 0,
            }}
          >
            <QuestCardSkeleton theme={theme} />
          </div>
        ))}
      </div>
    </>
  );
}

// 任务页骨架屏组合 - 带交错动画
export function QuestsPageSkeleton({ theme }) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              animation: 'skeletonFadeIn 0.3s ease-out forwards',
              animationDelay: `${i * 60}ms`,
              opacity: 0,
            }}
          >
            <QuestCardSkeleton theme={theme} />
          </div>
        ))}
      </div>
    </>
  );
}
