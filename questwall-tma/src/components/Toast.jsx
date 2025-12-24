import { useEffect } from 'react';
import { IconCheck, IconStar, IconDollar, IconGift } from './icons/CyberpunkIcons';

export function Toast({ message, visible, onClose, type = 'success', position = 'center' }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const getIcon = (size = 16) => {
    switch (type) {
      case 'success': return <IconCheck size={size} color="#fff" />;
      case 'error': return <span style={{ fontSize: size, fontWeight: '700' }}>✕</span>;
      case 'warning': return <span style={{ fontSize: size, fontWeight: '700' }}>!</span>;
      case 'stars': return <IconStar size={size} color="#fff" />;
      case 'ton': return <IconDollar size={size} color="#fff" />;
      case 'usdt': return <IconDollar size={size} color="#fff" />;
      case 'points': return <IconGift size={size} color="#fff" />;
      case 'refresh': return <span style={{ fontSize: size }}>↻</span>;
      default: return <IconCheck size={size} color="#fff" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
      case 'refresh':
        return { bg: 'rgba(52, 199, 89, 0.95)', icon: '#fff' };
      case 'error':
        return { bg: 'rgba(255, 59, 48, 0.95)', icon: '#fff' };
      case 'warning':
        return { bg: 'rgba(255, 149, 0, 0.95)', icon: '#fff' };
      case 'stars':
        return { bg: 'rgba(102, 126, 234, 0.95)', icon: '#fff' };
      case 'ton':
        return { bg: 'rgba(0, 136, 204, 0.95)', icon: '#fff' };
      case 'usdt':
        return { bg: 'rgba(38, 161, 123, 0.95)', icon: '#fff' };
      case 'points':
        return { bg: 'rgba(255, 149, 0, 0.95)', icon: '#fff' };
      default:
        return { bg: 'rgba(52, 199, 89, 0.95)', icon: '#fff' };
    }
  };

  const colors = getColors();
  const isTop = position === 'top';
  const isSimple = type === 'success' || type === 'refresh';

  const styles = {
    overlay: {
      position: 'fixed',
      top: isTop ? 'calc(env(safe-area-inset-top, 0px) + 60px)' : 0,
      left: 0,
      right: 0,
      bottom: isTop ? 'auto' : 0,
      display: 'flex',
      alignItems: isTop ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 10000,
      pointerEvents: 'none',
      padding: isTop ? '0 20px' : 0,
    },
    toast: {
      background: isSimple ? colors.bg : `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg} 100%)`,
      borderRadius: isSimple ? 50 : 16,
      padding: isSimple ? '10px 20px' : '16px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: isSimple ? 8 : 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      animation: isTop ? 'slideDown 0.3s ease' : 'popIn 0.25s ease',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    iconWrapper: {
      width: isSimple ? 20 : 32,
      height: isSimple ? 20 : 32,
      borderRadius: '50%',
      background: isSimple ? 'transparent' : 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    icon: {
      fontSize: isSimple ? 16 : 18,
      color: colors.icon,
      fontWeight: '700',
    },
    message: {
      fontSize: isSimple ? 14 : 15,
      fontWeight: '600',
      color: '#fff',
      margin: 0,
      lineHeight: 1.3,
      letterSpacing: '-0.2px',
    },
    keyframes: `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes popIn {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          transform: scale(1.02);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  };

  return (
    <>
      <style>{styles.keyframes}</style>
      <div style={styles.overlay}>
        <div style={styles.toast}>
          <div style={styles.iconWrapper}>
            {getIcon(isSimple ? 16 : 18)}
          </div>
          <p style={styles.message}>{message}</p>
        </div>
      </div>
    </>
  );
}
