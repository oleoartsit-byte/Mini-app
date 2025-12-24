/**
 * 赛博朋克主题 SVG 图标库
 * Cyberpunk-themed SVG Icon Library
 *
 * 设计特点：
 * - 线性几何风格
 * - 霓虹发光效果
 * - 科技感边角
 * - 统一的视觉语言
 */

// 基础图标包装器 - 添加发光效果
const IconWrapper = ({ children, size = 24, color = '#00e5ff', glow = true, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: glow ? `drop-shadow(0 0 4px ${color})` : 'none',
      ...style,
    }}
  >
    {children}
  </svg>
);

// ============ 导航图标 Navigation Icons ============

// 首页图标 - 六边形房屋
export const IconHome = ({ size = 24, color = '#00e5ff', active = false }) => (
  <IconWrapper size={size} color={color} glow={active}>
    <path
      d="M12 2L3 9V20C3 20.5523 3.44772 21 4 21H9V14H15V21H20C20.5523 21 21 20.5523 21 20V9L12 2Z"
      stroke={color}
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? `${color}20` : 'none'}
    />
    <path d="M9 21V14H15V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// 任务图标 - 目标靶心
export const IconQuest = ({ size = 24, color = '#00e5ff', active = false }) => (
  <IconWrapper size={size} color={color} glow={active}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={active ? 2 : 1.5} fill={active ? `${color}20` : 'none'} />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke={color} strokeWidth={1} strokeLinecap="round" />
  </IconWrapper>
);

// 教程图标 - 数据流
export const IconTutorial = ({ size = 24, color = '#00e5ff', active = false }) => (
  <IconWrapper size={size} color={color} glow={active}>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth={active ? 2 : 1.5} fill={active ? `${color}20` : 'none'} />
    <path d="M7 9H17M7 12H14M7 15H11" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <circle cx="17" cy="14" r="2" stroke={color} strokeWidth={1.5} fill="none" />
  </IconWrapper>
);

// 奖励图标 - 钻石
export const IconRewards = ({ size = 24, color = '#00e5ff', active = false }) => (
  <IconWrapper size={size} color={color} glow={active}>
    <path
      d="M12 21L3 10L6 3H18L21 10L12 21Z"
      stroke={color}
      strokeWidth={active ? 2 : 1.5}
      strokeLinejoin="round"
      fill={active ? `${color}20` : 'none'}
    />
    <path d="M3 10H21M6 3L12 10L18 3M12 10V21" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </IconWrapper>
);

// 个人中心图标 - 用户头像
export const IconProfile = ({ size = 24, color = '#00e5ff', active = false }) => (
  <IconWrapper size={size} color={color} glow={active}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth={active ? 2 : 1.5} fill={active ? `${color}20` : 'none'} />
    <path
      d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
      stroke={color}
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
    />
  </IconWrapper>
);

// ============ 金融图标 Financial Icons ============

// USDT/钱包图标
export const IconWallet = ({ size = 24, color = '#26A17B' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M2 9H22" stroke={color} strokeWidth={1.5} />
    <circle cx="17" cy="14" r="2" stroke={color} strokeWidth={1.5} fill={`${color}30`} />
    <path d="M6 14H10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 美元图标
export const IconDollar = ({ size = 24, color = '#26A17B' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M12 6V18M9 9C9 7.89543 10.3431 7 12 7C13.6569 7 15 7.89543 15 9C15 10.1046 13.6569 11 12 11C10.3431 11 9 11.8954 9 13C9 14.1046 10.3431 15 12 15C13.6569 15 15 14.1046 15 13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 提现图标
export const IconWithdraw = ({ size = 24, color = '#26A17B' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 10V16M12 16L9 13M12 16L15 13" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 6V4C7 3.44772 7.44772 3 8 3H16C16.5523 3 17 3.44772 17 4V6" stroke={color} strokeWidth={1.5} />
  </IconWrapper>
);

// ============ 成就图标 Achievement Icons ============

// 奖杯图标
export const IconTrophy = ({ size = 24, color = '#ffc107' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M8 21H16M12 17V21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M6 3H18V8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8V3Z" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M6 5H3V7C3 8.65685 4.34315 10 6 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M18 5H21V7C21 8.65685 19.6569 10 18 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 星星图标
export const IconStar = ({ size = 24, color = '#00e5ff', filled = false }) => (
  <IconWrapper size={size} color={color}>
    <path
      d="M12 2L14.4 9.2H22L16 13.8L18.4 21L12 16.4L5.6 21L8 13.8L2 9.2H9.6L12 2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill={filled ? color : `${color}20`}
    />
  </IconWrapper>
);

// 勋章图标
export const IconMedal = ({ size = 24, color = '#bf5fff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="10" r="6" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M8 15L6 22L12 19L18 22L16 15" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    <path d="M12 7V10M10 10H14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 完成/勾选图标
export const IconCheck = ({ size = 24, color = '#39ff14' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// ============ 社交图标 Social Icons ============

// 群组/用户图标
export const IconUsers = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="9" cy="7" r="3" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="17" cy="7" r="2.5" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M2 18C2 15.2386 4.68629 13 9 13C11.5 13 13.5 13.8 14.5 15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M14 18C14 16.3431 15.5 15 17.5 15C19.5 15 21 16.3431 21 18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// Twitter/X 图标
export const IconTwitter = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M4 4L10.5 12.5M20 4L13.5 12.5M10.5 12.5L4 20H8L13.5 12.5M10.5 12.5L16 20H20L13.5 12.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// Telegram 图标
export const IconTelegram = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M21 5L10 13L21 5ZM10 13L13 20L10 13ZM10 13L3 10L21 5L10 13ZM13 20L21 5L13 20Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" />
    <path d="M10 13L13 20L15 14" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </IconWrapper>
);

// 分享图标
export const IconShare = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="18" cy="5" r="3" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="6" cy="12" r="3" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="18" cy="19" r="3" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke={color} strokeWidth={1.5} />
  </IconWrapper>
);

// ============ 任务类型图标 Quest Type Icons ============

// 频道图标
export const IconChannel = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M3 8L12 3L21 8V16L12 21L3 16V8Z" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 12V21M3 8L12 12L21 8" stroke={color} strokeWidth={1.5} />
    <circle cx="12" cy="8" r="2" stroke={color} strokeWidth={1.5} fill={`${color}30`} />
  </IconWrapper>
);

// 转发图标
export const IconRetweet = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M3 8H17L14 5M21 16H7L10 19" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8V14C17 15.1046 16.1046 16 15 16H7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M7 16V10C7 8.89543 7.89543 8 9 8H17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 点赞/心形图标
export const IconHeart = ({ size = 24, color = '#ff4da6', filled = false }) => (
  <IconWrapper size={size} color={color}>
    <path
      d="M12 21C12 21 3 15 3 9C3 6.23858 5.23858 4 8 4C9.65685 4 11.1046 4.83333 12 6C12.8954 4.83333 14.3431 4 16 4C18.7614 4 21 6.23858 21 9C21 15 12 21 12 21Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
      fill={filled ? color : `${color}20`}
    />
  </IconWrapper>
);

// 评论图标
export const IconComment = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M21 12C21 16.4183 16.9706 20 12 20C10.5 20 9.1 19.7 7.85 19.15L3 20L4.3 16C3.5 14.85 3 13.5 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M8 11H16M8 14H13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 链接图标
export const IconLink = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M10 14L14 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M15 9L17 7C18.6569 5.34315 18.6569 2.65685 17 1V1C15.3431 2.65685 15.3431 5.34315 17 7L19 9C20.6569 10.6569 20.6569 13.3431 19 15L17 17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M9 15L7 17C5.34315 18.6569 5.34315 21.3431 7 23V23C8.65685 21.3431 8.65685 18.6569 7 17L5 15C3.34315 13.3431 3.34315 10.6569 5 9L7 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 链上/区块链图标
export const IconBlockchain = ({ size = 24, color = '#bf5fff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="3" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <rect x="15" y="3" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <rect x="9" y="15" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M9 6H15M6 9V12L9 15M18 9V12L15 15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// NFT 图标
export const IconNFT = ({ size = 24, color = '#bf5fff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M8 17L10 12L13 15L16 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="7" r="2" stroke={color} strokeWidth={1.5} fill={`${color}30`} />
  </IconWrapper>
);

// ============ 功能图标 Utility Icons ============

// 目标/任务图标
export const IconTarget = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 搜索图标
export const IconSearch = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M16 16L21 21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 历史记录图标
export const IconHistory = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 6V12L16 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 12H1M23 12H21" stroke={color} strokeWidth={1} strokeLinecap="round" />
  </IconWrapper>
);

// 签到/礼物图标
export const IconGift = ({ size = 24, color = '#ff4da6' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="10" width="18" height="11" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 10V21M3 14H21" stroke={color} strokeWidth={1.5} />
    <path d="M12 10C12 10 12 6 9 6C6 6 6 10 6 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M12 10C12 10 12 6 15 6C18 6 18 10 18 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 时钟/等待图标
export const IconClock = ({ size = 24, color = '#ffc107' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 6V12L15 15" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// 通知/铃铛图标
export const IconBell = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 语言/地球图标
export const IconGlobe = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M3 12H21M12 3C14.5 5.5 16 8.5 16 12C16 15.5 14.5 18.5 12 21C9.5 18.5 8 15.5 8 12C8 8.5 9.5 5.5 12 3Z" stroke={color} strokeWidth={1.5} />
  </IconWrapper>
);

// 关闭图标
export const IconClose = ({ size = 24, color = '#ff4da6' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M6 6L18 18M6 18L18 6" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </IconWrapper>
);

// 箭头右图标
export const IconArrowRight = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color} glow={false}>
    <path d="M9 6L15 12L9 18" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// 火焰/热门图标
export const IconFire = ({ size = 24, color = '#ff6b35' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9 15 5 12 2C9 5 4 9 4 14C4 18.4183 7.58172 22 12 22Z" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M12 22C14.2091 22 16 19.5 16 16.5C16 13.5 14 11 12 9C10 11 8 13.5 8 16.5C8 19.5 9.79086 22 12 22Z" stroke={color} strokeWidth={1.5} fill={`${color}40`} />
  </IconWrapper>
);

// 日历图标
export const IconCalendar = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M3 10H21M8 2V6M16 2V6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <rect x="7" y="14" width="3" height="3" rx="0.5" fill={color} />
  </IconWrapper>
);

// 复制图标
export const IconCopy = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="9" y="9" width="11" height="11" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M5 15V5C5 3.89543 5.89543 3 7 3H15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 下载图标
export const IconDownload = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 17V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 相机/截图图标
export const IconCamera = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="2" y="6" width="20" height="14" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M8 6L9 4H15L16 6" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </IconWrapper>
);

// 视频/播放图标
export const IconPlay = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M10 8L16 12L10 16V8Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={`${color}30`} />
  </IconWrapper>
);

// 文档图标
export const IconDocument = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M14 2V8H20M8 13H16M8 17H13" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </IconWrapper>
);

// 图片图标
export const IconImage = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <circle cx="8" cy="8" r="2" stroke={color} strokeWidth={1.5} fill={`${color}30`} />
    <path d="M21 15L16 10L6 21" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  </IconWrapper>
);

// 警告图标
export const IconWarning = ({ size = 24, color = '#ffc107' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M12 3L22 20H2L12 3Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={`${color}20`} />
    <path d="M12 10V14M12 17V17.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </IconWrapper>
);

// 错误图标
export const IconError = ({ size = 24, color = '#ff4444' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill={`${color}20`} />
    <path d="M8 8L16 16M16 8L8 16" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </IconWrapper>
);

// 信息图标
export const IconInfo = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M12 16V12M12 8V8.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </IconWrapper>
);

// 刷新图标
export const IconRefresh = ({ size = 24, color = '#00e5ff' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3137 3 18.1569 4.7686 19.7 7.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <path d="M21 3V8H16" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </IconWrapper>
);

// 空状态图标
export const IconEmpty = ({ size = 48, color = 'rgba(255, 255, 255, 0.3)' }) => (
  <IconWrapper size={size} color={color} glow={false}>
    <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={1.5} fill="none" />
    <path d="M8 10L11 13L16 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </IconWrapper>
);

// 导出所有图标
export const CyberpunkIcons = {
  // Navigation
  Home: IconHome,
  Quest: IconQuest,
  Tutorial: IconTutorial,
  Rewards: IconRewards,
  Profile: IconProfile,

  // Financial
  Wallet: IconWallet,
  Dollar: IconDollar,
  Withdraw: IconWithdraw,

  // Achievement
  Trophy: IconTrophy,
  Star: IconStar,
  Medal: IconMedal,
  Check: IconCheck,

  // Social
  Users: IconUsers,
  Twitter: IconTwitter,
  Telegram: IconTelegram,
  Share: IconShare,

  // Quest Types
  Channel: IconChannel,
  Retweet: IconRetweet,
  Heart: IconHeart,
  Comment: IconComment,
  Link: IconLink,
  Blockchain: IconBlockchain,
  NFT: IconNFT,

  // Utility
  Search: IconSearch,
  History: IconHistory,
  Gift: IconGift,
  Clock: IconClock,
  Bell: IconBell,
  Globe: IconGlobe,
  Close: IconClose,
  ArrowRight: IconArrowRight,
  Fire: IconFire,
  Calendar: IconCalendar,
  Copy: IconCopy,
  Download: IconDownload,
  Camera: IconCamera,
  Play: IconPlay,
  Document: IconDocument,
  Image: IconImage,
  Warning: IconWarning,
  Error: IconError,
  Info: IconInfo,
  Refresh: IconRefresh,
  Empty: IconEmpty,
};

export default CyberpunkIcons;
