// 骨架屏基础样式 - 赛博朋克风格
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

@keyframes neonPulse {
  0%, 100% {
    box-shadow: 0 0 5px rgba(0, 229, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
  }
}
`;

// 赛博朋克配色
const baseColor = 'rgba(30, 30, 50, 0.8)';
const shimmerColor = 'rgba(0, 229, 255, 0.15)';
const cardBg = 'linear-gradient(145deg, rgba(25, 25, 45, 0.95), rgba(18, 18, 38, 0.95))';
const cardBorder = '1px solid rgba(0, 229, 255, 0.15)';

// 骨架屏基础组件
export function SkeletonBase({ width, height, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
}

// 任务卡片骨架屏
export function QuestCardSkeleton() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          background: cardBg,
          borderRadius: 14,
          padding: 14,
          margin: '0 16px 12px',
          border: cardBorder,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 顶部高亮线 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.3), transparent)',
        }} />

        <div style={{ display: 'flex', gap: 12 }}>
          {/* 图标骨架 */}
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite, neonPulse 2s infinite',
              border: '1px solid rgba(0, 229, 255, 0.2)',
            }}
          />
          <div style={{ flex: 1 }}>
            {/* 标签骨架 */}
            <div
              style={{
                width: 60,
                height: 16,
                borderRadius: 6,
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
                height: 16,
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
                height: 12,
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
              width: 60,
              height: 32,
              borderRadius: 10,
              alignSelf: 'center',
              background: `linear-gradient(90deg, ${baseColor} 25%, rgba(191, 95, 255, 0.15) 50%, ${baseColor} 75%)`,
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
export function UserCardSkeleton() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          background: cardBg,
          borderRadius: 16,
          padding: '18px 16px',
          margin: '0 16px 16px',
          border: cardBorder,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 顶部高亮线 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.5), transparent)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* 头像骨架 */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(191, 95, 255, 0.2))`,
              border: '2px solid rgba(0, 229, 255, 0.3)',
              animation: 'neonPulse 2s infinite',
            }}
          />
          <div style={{ flex: 1 }}>
            {/* 名字骨架 */}
            <div
              style={{
                width: 100,
                height: 18,
                borderRadius: 4,
                marginBottom: 10,
                background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            {/* 等级条骨架 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 50,
                  height: 20,
                  borderRadius: 10,
                  background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              <div
                style={{
                  width: 60,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>
          </div>
          {/* 状态徽章骨架 */}
          <div
            style={{
              width: 80,
              height: 28,
              borderRadius: 10,
              background: `linear-gradient(90deg, ${baseColor} 25%, rgba(57, 255, 20, 0.1) 50%, ${baseColor} 75%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>
    </>
  );
}

// 签到卡片骨架屏
export function CheckInCardSkeleton() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(25, 20, 15, 0.95), rgba(20, 15, 10, 0.95))',
          borderRadius: 16,
          padding: 16,
          margin: '0 16px 12px',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 顶部高亮线 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.6), transparent)',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* 图标骨架 */}
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 150, 0, 0.15))',
                border: '1px solid rgba(255, 193, 7, 0.3)',
              }}
            />
            <div>
              {/* 标题骨架 */}
              <div
                style={{
                  width: 100,
                  height: 16,
                  borderRadius: 4,
                  marginBottom: 6,
                  background: `linear-gradient(90deg, rgba(30, 25, 15, 0.8) 25%, rgba(255, 193, 7, 0.15) 50%, rgba(30, 25, 15, 0.8) 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              {/* 副标题骨架 */}
              <div
                style={{
                  width: 70,
                  height: 12,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, rgba(30, 25, 15, 0.8) 25%, rgba(255, 193, 7, 0.1) 50%, rgba(30, 25, 15, 0.8) 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>
          </div>
          {/* 按钮骨架 */}
          <div
            style={{
              width: 80,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 150, 0, 0.2))',
            }}
          />
        </div>
      </div>
    </>
  );
}

// 钱包卡片骨架屏
export function WalletCardSkeleton() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          background: cardBg,
          borderRadius: 16,
          padding: 16,
          margin: '0 16px 16px',
          border: cardBorder,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 彩虹边框效果 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #00e5ff, #39ff14, #ffc107, #ff4da6, #bf5fff, #00e5ff)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* 图标骨架 */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(191, 95, 255, 0.2))',
                border: '1px solid rgba(0, 229, 255, 0.3)',
              }}
            />
            <div>
              {/* 标题骨架 */}
              <div
                style={{
                  width: 60,
                  height: 12,
                  borderRadius: 4,
                  marginBottom: 6,
                  background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
              {/* 地址骨架 */}
              <div
                style={{
                  width: 100,
                  height: 16,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${baseColor} 25%, ${shimmerColor} 50%, ${baseColor} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            </div>
          </div>
          {/* 按钮骨架 */}
          <div
            style={{
              width: 90,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(90deg, ${baseColor} 25%, rgba(191, 95, 255, 0.15) 50%, ${baseColor} 75%)`,
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
export function HomePageSkeleton() {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div style={{ paddingTop: 60 }}>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '0ms', opacity: 0 }}>
          <UserCardSkeleton />
        </div>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '80ms', opacity: 0 }}>
          <CheckInCardSkeleton />
        </div>
        <div style={{ animation: 'skeletonFadeIn 0.3s ease-out forwards', animationDelay: '160ms', opacity: 0 }}>
          <WalletCardSkeleton />
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
              background: 'rgba(0, 229, 255, 0.1)',
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
            <QuestCardSkeleton />
          </div>
        ))}
      </div>
    </>
  );
}

// 任务页骨架屏组合 - 带交错动画
export function QuestsPageSkeleton() {
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
            <QuestCardSkeleton />
          </div>
        ))}
      </div>
    </>
  );
}
