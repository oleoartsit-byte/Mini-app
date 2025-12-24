import { useState, useEffect } from 'react';
import { IconDocument, IconPlay, IconImage, IconSearch, IconTelegram, IconTwitter, IconWallet, IconUsers, IconGift, IconInfo } from './icons/CyberpunkIcons';

export function TutorialPage({ api, t }) {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 获取当前语言
  const getLang = () => t?.('locale') === 'en' ? 'en' : 'zh';

  // 从后端获取教程列表
  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);
      try {
        const lang = getLang();
        if (api?.getTutorials) {
          const data = await api.getTutorials(lang, selectedCategory);
          setTutorials(data.items || []);
        } else {
          // 默认示例数据（后端API未实现时显示）
          setTutorials(getDefaultTutorials());
        }
      } catch (error) {
        console.error('获取教程列表失败:', error);
        setTutorials(getDefaultTutorials());
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, [api, selectedCategory]);

  // 获取分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const lang = getLang();
        if (api?.getTutorialCategories) {
          const data = await api.getTutorialCategories(lang);
          setCategories(data || []);
        } else {
          setCategories(getDefaultCategories());
        }
      } catch (error) {
        setCategories(getDefaultCategories());
      }
    };
    fetchCategories();
  }, [api]);

  // 默认示例数据
  const getDefaultTutorials = () => [
    {
      id: '1',
      type: 'ARTICLE',
      title: '如何完成 Telegram 频道任务',
      description: '学习如何关注频道并完成验证',
      content: '1. 点击任务卡片上的"开始"按钮\n2. 点击"前往关注"跳转到频道\n3. 关注频道后返回\n4. 点击"验证"按钮完成任务',
      category: 'telegram',
      iconType: 'telegram',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'VIDEO',
      title: '视频教程：Twitter 任务完整流程',
      description: '观看视频学习如何绑定 Twitter 并完成任务',
      content: '本视频详细讲解了 Twitter 任务的完整操作流程。',
      videoUrl: 'https://www.youtube.com/watch?v=example',
      category: 'twitter',
      iconType: 'twitter',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'IMAGE_TEXT',
      title: '图文教程：如何提现奖励',
      description: '一步步教你将 USDT 奖励提现到钱包',
      content: '按照下方图片步骤操作即可完成提现。',
      images: [
        'https://via.placeholder.com/400x300?text=Step+1',
        'https://via.placeholder.com/400x300?text=Step+2',
        'https://via.placeholder.com/400x300?text=Step+3',
      ],
      category: 'wallet',
      iconType: 'wallet',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      type: 'ARTICLE',
      title: '邀请好友赚取奖励',
      description: '了解邀请机制和返佣规则',
      content: '1. 在首页找到邀请卡片\n2. 点击"复制链接"或"分享"\n3. 将邀请链接发送给好友\n4. 好友通过链接注册后，你将获得邀请奖励\n5. 好友完成任务后，你还能获得返佣',
      category: 'invite',
      iconType: 'invite',
      createdAt: new Date().toISOString(),
    },
  ];

  // 默认分类
  const getDefaultCategories = () => [
    { value: 'telegram', label: t ? t('tutorials.category.telegram') : 'Telegram', iconType: 'telegram', count: 1 },
    { value: 'twitter', label: t ? t('tutorials.category.twitter') : 'Twitter', iconType: 'twitter', count: 1 },
    { value: 'wallet', label: t ? t('tutorials.category.wallet') : '钱包', iconType: 'wallet', count: 1 },
    { value: 'invite', label: t ? t('tutorials.category.invite') : '邀请', iconType: 'invite', count: 1 },
    { value: 'other', label: t ? t('tutorials.category.other') : '其他', iconType: 'other', count: 0 },
  ];

  // 获取分类信息
  const getCategoryInfo = (category) => {
    const defaultCategories = {
      telegram: { label: t ? t('tutorials.category.telegram') : 'Telegram', color: '#0088cc' },
      twitter: { label: t ? t('tutorials.category.twitter') : 'Twitter', color: '#1da1f2' },
      wallet: { label: t ? t('tutorials.category.wallet') : '钱包', color: '#26a17b' },
      invite: { label: t ? t('tutorials.category.invite') : '邀请', color: '#ff9500' },
      other: { label: t ? t('tutorials.category.other') : '其他', color: '#bf5fff' },
    };
    return defaultCategories[category] || defaultCategories.other;
  };

  // 获取分类图标 - 将 emoji 或分类值转换为 SVG 图标
  const getCategoryIcon = (categoryValue) => {
    const iconMap = {
      telegram: <IconTelegram size={14} color="#0088cc" />,
      twitter: <IconTwitter size={14} color="#1da1f2" />,
      wallet: <IconWallet size={14} color="#26a17b" />,
      invite: <IconUsers size={14} color="#ff9500" />,
      other: <IconDocument size={14} color="#bf5fff" />,
    };
    return iconMap[categoryValue] || iconMap.other;
  };

  // 获取类型图标和标签
  const getTypeInfo = (type) => {
    const types = {
      ARTICLE: { icon: <IconDocument size={16} color="#00e5ff" />, label: t ? t('tutorials.type.article') : '文章', color: '#00e5ff' },
      VIDEO: { icon: <IconPlay size={16} color="#ff4da6" />, label: t ? t('tutorials.type.video') : '视频', color: '#ff4da6' },
      IMAGE_TEXT: { icon: <IconImage size={16} color="#39ff14" />, label: t ? t('tutorials.type.imageText') : '图文', color: '#39ff14' },
    };
    return types[type] || types.ARTICLE;
  };

  // 获取教程卡片主图标 - 根据类型返回大尺寸 SVG 图标
  const getTutorialMainIcon = (type) => {
    const iconMap = {
      ARTICLE: <IconDocument size={28} color="#00e5ff" />,
      VIDEO: <IconPlay size={28} color="#ff4da6" />,
      IMAGE_TEXT: <IconImage size={28} color="#39ff14" />,
    };
    return iconMap[type] || iconMap.ARTICLE;
  };

  // 解析视频链接
  const parseVideoUrl = (url) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      return { type: 'youtube', id: ytMatch[1], embed: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Bilibili
    const biliMatch = url.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
    if (biliMatch) {
      return { type: 'bilibili', id: biliMatch[1], embed: `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}` };
    }

    // 其他视频链接
    return { type: 'external', url };
  };

  // 搜索过滤后的教程列表
  const filteredTutorials = tutorials.filter(tutorial => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tutorial.title?.toLowerCase().includes(query) ||
      tutorial.description?.toLowerCase().includes(query) ||
      tutorial.content?.toLowerCase().includes(query)
    );
  });

  const styles = {
    container: {
      padding: '0 16px 20px',
    },
    // 搜索框
    searchContainer: {
      marginBottom: 12,
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      paddingLeft: 42,
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderRadius: 12,
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      color: '#fff',
      outline: 'none',
      boxSizing: 'border-box',
    },
    searchWrapper: {
      position: 'relative',
    },
    searchIcon: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.4)',
      pointerEvents: 'none',
    },
    clearButton: {
      position: 'absolute',
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'pointer',
      padding: 4,
    },
    // 分类筛选器
    categoryFilter: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 12,
      marginBottom: 8,
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      position: 'relative',
      zIndex: 1,
      isolation: 'isolate',
    },
    categoryChip: {
      flexShrink: 0,
      padding: '10px 18px',
      borderRadius: 24,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      // 默认使用 inactive 样式，避免闪烁
      background: 'rgba(20, 20, 45, 0.8)',
      color: 'rgba(255, 255, 255, 0.6)',
      border: '1px solid rgba(0, 229, 255, 0.25)',
      boxShadow: 'none',
      transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
      position: 'relative',
      zIndex: 1,
      isolation: 'isolate',
    },
    categoryChipActive: {
      background: 'rgba(0, 229, 255, 0.15)',
      color: '#00e5ff',
      borderColor: 'rgba(0, 229, 255, 0.5)',
      boxShadow: '0 0 12px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.1)',
    },
    categoryChipInactive: {
      background: 'rgba(20, 20, 45, 0.8)',
      color: 'rgba(255, 255, 255, 0.6)',
      borderColor: 'rgba(0, 229, 255, 0.25)',
      boxShadow: 'none',
    },
    skeleton: {
      padding: '16px',
      margin: '0 0 12px',
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    card: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: '16px',
      marginBottom: 12,
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(191, 95, 255, 0.2))',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      flexShrink: 0,
      position: 'relative',
    },
    coverImage: {
      width: 48,
      height: 48,
      borderRadius: 12,
      objectFit: 'cover',
      flexShrink: 0,
    },
    typeBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10,
      border: '2px solid rgba(18, 18, 38, 1)',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    tagsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    categoryTag: {
      display: 'inline-block',
      fontSize: 10,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      padding: '3px 8px',
      borderRadius: 6,
    },
    typeTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 10,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      padding: '3px 8px',
      borderRadius: 6,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
      marginBottom: 4,
      lineHeight: 1.3,
    },
    cardDesc: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.75)',
      margin: 0,
      lineHeight: 1.5,
    },
    arrow: {
      color: 'rgba(255, 255, 255, 0.3)',
      fontSize: 18,
      marginLeft: 8,
    },
    // 详情弹窗
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    modal: {
      background: 'linear-gradient(180deg, rgba(25, 25, 45, 0.98), rgba(18, 18, 38, 0.98))',
      borderRadius: '20px 20px 0 0',
      padding: '24px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderBottom: 'none',
    },
    modalHandle: {
      width: 40,
      height: 4,
      background: 'linear-gradient(90deg, #00e5ff, #bf5fff)',
      borderRadius: 2,
      margin: '-8px auto 16px',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    modalIcon: {
      width: 56,
      height: 56,
      borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(191, 95, 255, 0.2))',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
    },
    modalCoverImage: {
      width: 56,
      height: 56,
      borderRadius: 14,
      objectFit: 'cover',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#fff',
      margin: 0,
      textShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
    },
    modalDesc: {
      fontSize: 13,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginTop: 4,
    },
    // 视频播放器
    videoContainer: {
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: '#000',
      border: '1px solid rgba(0, 229, 255, 0.2)',
    },
    videoIframe: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
    videoLink: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '16px',
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(191, 95, 255, 0.1))',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      borderRadius: 12,
      marginBottom: 16,
      color: '#00e5ff',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
    },
    // 图片画廊
    imageGallery: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      marginBottom: 16,
    },
    galleryImage: {
      width: '100%',
      borderRadius: 12,
      objectFit: 'cover',
      border: '1px solid rgba(0, 229, 255, 0.15)',
    },
    imageCounter: {
      textAlign: 'center',
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      marginTop: 8,
    },
    modalContent: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap',
      marginBottom: 20,
    },
    closeButton: {
      width: '100%',
      padding: '14px',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      filter: 'drop-shadow(0 0 15px rgba(0, 229, 255, 0.3))',
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
    },
    clearSearchButton: {
      marginTop: '12px',
      padding: '10px 20px',
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      textTransform: 'uppercase',
    },
    skeletonBlock: {
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
      borderRadius: 4,
      animation: 'shimmer 1.5s ease-in-out infinite',
    },
  };

  // 渲染视频内容
  const renderVideoContent = (tutorial) => {
    const videoInfo = parseVideoUrl(tutorial.videoUrl);
    if (!videoInfo) return null;

    // YouTube 视频 - 直接嵌入播放器
    if (videoInfo.type === 'youtube') {
      return (
        <div style={styles.videoContainer}>
          <iframe
            src={`https://www.youtube.com/embed/${videoInfo.id}?rel=0&modestbranding=1&playsinline=1`}
            style={styles.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={tutorial.title}
          />
        </div>
      );
    }

    // Bilibili 视频
    if (videoInfo.type === 'bilibili') {
      return (
        <div style={styles.videoContainer}>
          <iframe
            src={`//player.bilibili.com/player.html?bvid=${videoInfo.id}&high_quality=1`}
            style={styles.videoIframe}
            allowFullScreen
            title={tutorial.title}
          />
        </div>
      );
    }

    // 其他视频链接 - 显示跳转按钮
    return (
      <a
        href={tutorial.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.videoLink}
      >
        <span style={{ fontSize: 24 }}>▶️</span>
        {t ? t('tutorials.watchVideo') : '观看视频'}
      </a>
    );
  };

  // 渲染图片内容
  const renderImageContent = (tutorial) => {
    const images = tutorial.images || [];
    if (images.length === 0) return null;

    return (
      <div style={styles.imageGallery}>
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${tutorial.title} - ${index + 1}`}
            style={styles.galleryImage}
            loading="lazy"
          />
        ))}
        <div style={styles.imageCounter}>
          {images.length} {t ? t('tutorials.images') : '张图片'}
        </div>
      </div>
    );
  };

  // 加载骨架屏
  if (loading) {
    return (
      <div style={styles.container}>
        {[1, 2, 3].map(i => (
          <div key={i} style={styles.skeleton}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ ...styles.skeletonBlock, width: 48, height: 48, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...styles.skeletonBlock, width: '30%', height: 14, marginBottom: 8 }} />
                <div style={{ ...styles.skeletonBlock, width: '80%', height: 18, marginBottom: 6 }} />
                <div style={{ ...styles.skeletonBlock, width: '60%', height: 14 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 搜索框 */}
      <div style={styles.searchContainer}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}><IconSearch size={16} color="rgba(255, 255, 255, 0.4)" /></span>
          <input
            type="text"
            style={styles.searchInput}
            placeholder={t ? t('tutorials.searchPlaceholder') : '搜索教程...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              style={styles.clearButton}
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 分类筛选器 */}
      {categories.length > 0 && (
        <div style={styles.categoryFilter}>
          <button
            style={{
              ...styles.categoryChip,
              ...(selectedCategory === 'all' ? styles.categoryChipActive : styles.categoryChipInactive),
            }}
            onClick={() => setSelectedCategory('all')}
          >
            {t ? t('tutorials.category.all') : '全部'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              style={{
                ...styles.categoryChip,
                ...(selectedCategory === cat.value ? styles.categoryChipActive : styles.categoryChipInactive),
              }}
              onClick={() => setSelectedCategory(cat.value)}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{getCategoryIcon(cat.value)}</span>
              {cat.label}
              {cat.count > 0 && <span style={{ opacity: 0.7 }}>({cat.count})</span>}
            </button>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredTutorials.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>{searchQuery ? <IconSearch size={48} color="rgba(255, 255, 255, 0.3)" /> : <IconDocument size={48} color="rgba(255, 255, 255, 0.3)" />}</div>
            <p style={styles.emptyText}>
              {searchQuery
                ? (t ? t('tutorials.noSearchResults') : '未找到相关教程')
                : (t ? t('tutorials.empty') : '暂无教程')
              }
            </p>
            {searchQuery && (
              <button
                style={styles.clearSearchButton}
                onClick={() => setSearchQuery('')}
              >
                {t ? t('tutorials.clearSearch') : '清除搜索'}
              </button>
            )}
          </div>
        )}

        {/* 教程列表 */}
        {filteredTutorials.map(tutorial => {
        const categoryInfo = getCategoryInfo(tutorial.category);
        const typeInfo = getTypeInfo(tutorial.type);
        return (
          <div
            key={tutorial.id}
            style={styles.card}
            onClick={() => setSelectedTutorial(tutorial)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 229, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.15)';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.iconWrapper}>
                {getTutorialMainIcon(tutorial.type)}
                <div style={{ ...styles.typeBadge, backgroundColor: typeInfo.color }}>
                  {typeInfo.icon}
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.tagsRow}>
                  <span style={{
                    ...styles.categoryTag,
                    color: categoryInfo.color,
                    backgroundColor: `${categoryInfo.color}20`,
                  }}>
                    {categoryInfo.label}
                  </span>
                  <span style={{
                    ...styles.typeTag,
                    color: typeInfo.color,
                    backgroundColor: `${typeInfo.color}20`,
                  }}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                </div>
                <h3 style={styles.cardTitle}>{tutorial.title}</h3>
                <p style={styles.cardDesc}>{tutorial.description}</p>
              </div>
              <span style={styles.arrow}>›</span>
            </div>
          </div>
        );
      })}

      {/* 详情弹窗 */}
      {selectedTutorial && (
        <div style={styles.modalOverlay} onClick={() => setSelectedTutorial(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHandle} />
            <div style={styles.modalHeader}>
              <div style={styles.modalIcon}>
                {getTutorialMainIcon(selectedTutorial.type)}
              </div>
              <div>
                <h2 style={styles.modalTitle}>{selectedTutorial.title}</h2>
                {selectedTutorial.description && (
                  <p style={styles.modalDesc}>{selectedTutorial.description}</p>
                )}
              </div>
            </div>

            {/* 视频内容 */}
            {selectedTutorial.type === 'VIDEO' && renderVideoContent(selectedTutorial)}

            {/* 图文内容 */}
            {selectedTutorial.type === 'IMAGE_TEXT' && renderImageContent(selectedTutorial)}

            {/* 文字内容 */}
            {selectedTutorial.content && (
              <div style={styles.modalContent}>
                {selectedTutorial.content}
              </div>
            )}

            <button style={styles.closeButton} onClick={() => setSelectedTutorial(null)}>
              {t ? t('common.close') : '关闭'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
