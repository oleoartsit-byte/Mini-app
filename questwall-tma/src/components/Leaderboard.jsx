import { useState, useEffect } from 'react';
import { IconTrophy, IconUsers } from './icons/CyberpunkIcons';

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#fff', glow: 'rgba(255, 215, 0, 0.5)' };
    case 2:
      return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', color: '#fff', glow: 'rgba(192, 192, 192, 0.4)' };
    case 3:
      return { bg: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)', color: '#fff', glow: 'rgba(205, 127, 50, 0.4)' };
    default:
      return null;
  }
};

export function Leaderboard({ currentUser, wallet, api, t }) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'invites'
  const [leaderboard, setLeaderboard] = useState([]);
  const [inviteLeaderboard, setInviteLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState({ rank: 0, points: 0, quests: 0 });
  const [myInviteStatus, setMyInviteStatus] = useState({ inviteCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!api) return;
      setLoading(true);
      try {
        if (activeTab === 'tasks') {
          const [leaderboardData, rankData] = await Promise.all([
            api.getLeaderboard(10),
            api.getMyRank()
          ]);
          setLeaderboard(leaderboardData || []);
          setMyRank(rankData || { rank: 0, points: 0, quests: 0 });
        } else {
          const [inviteData, inviteStatus] = await Promise.all([
            api.getInviteLeaderboard(10),
            api.getInviteStatus()
          ]);
          setInviteLeaderboard(inviteData || []);
          setMyInviteStatus(inviteStatus || { inviteCount: 0 });
        }
      } catch (error) {
        console.error('获取排行榜数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api, activeTab]);

  const userRank = myRank.rank || 1;
  const userPoints = myRank.points || 0;

  const styles = {
    container: {
      padding: '0 16px',
    },
    // Tab 切换 - 赛博朋克风格
    tabContainer: {
      display: 'flex',
      gap: 8,
      marginBottom: 16,
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: 4,
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      fontSize: 13,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    activeTab: {
      background: 'linear-gradient(135deg, #00e5ff, #bf5fff)',
      color: '#000',
      boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)',
    },
    inactiveTab: {
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.5)',
    },
    // 用户排名卡片
    userRankCard: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      border: '1px solid rgba(0, 229, 255, 0.35)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    userRankGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 229, 255, 0.1) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
    userRankBadge: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: 'linear-gradient(135deg, #00e5ff 0%, #bf5fff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#000',
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      boxShadow: '0 4px 15px rgba(0, 229, 255, 0.4)',
      position: 'relative',
      zIndex: 1,
    },
    userRankInfo: {
      flex: 1,
      position: 'relative',
      zIndex: 1,
    },
    userRankLabel: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    userRankValue: {
      fontSize: 18,
      fontWeight: '700',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
      marginTop: 2,
    },
    userPoints: {
      textAlign: 'right',
      position: 'relative',
      zIndex: 1,
    },
    pointsValue: {
      fontSize: 20,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#ffc107',
      margin: 0,
      textShadow: '0 0 15px rgba(255, 193, 7, 0.5)',
    },
    pointsLabel: {
      fontSize: 11,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.6)',
      margin: 0,
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    // 排行榜列表
    listCard: {
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid rgba(0, 229, 255, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
    },
    rank: {
      width: 36,
      height: 36,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      marginRight: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(191, 95, 255, 0.2))',
      border: '1px solid rgba(0, 229, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      marginRight: 12,
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    avatarLetter: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#00e5ff',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
      margin: 0,
    },
    quests: {
      fontSize: 12,
      fontFamily: "'Rajdhani', sans-serif",
      color: 'rgba(255, 255, 255, 0.4)',
      margin: 0,
      marginTop: 2,
    },
    points: {
      fontSize: 16,
      fontWeight: '700',
      fontFamily: "'Orbitron', sans-serif",
      color: '#ffc107',
      textShadow: '0 0 10px rgba(255, 193, 7, 0.4)',
    },
    emptyText: {
      padding: 30,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.6)',
      fontFamily: "'Rajdhani', sans-serif",
      fontSize: 14,
    },
  };

  // 计算用户在邀请排行榜中的排名
  const getMyInviteRank = () => {
    const myIndex = inviteLeaderboard.findIndex(
      item => item.username === (currentUser?.username || currentUser?.first_name)
    );
    return myIndex >= 0 ? myIndex + 1 : inviteLeaderboard.length + 1;
  };

  return (
    <div style={styles.container}>
      {/* Tab 切换 */}
      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'tasks' ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setActiveTab('tasks')}
        >
          <IconTrophy size={16} color={activeTab === 'tasks' ? '#000' : 'rgba(255, 255, 255, 0.5)'} />
          <span>{t ? t('leaderboard.tasksTab') : '任务榜'}</span>
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'invites' ? styles.activeTab : styles.inactiveTab),
          }}
          onClick={() => setActiveTab('invites')}
        >
          <IconUsers size={16} color={activeTab === 'invites' ? '#000' : 'rgba(255, 255, 255, 0.5)'} />
          <span>{t ? t('leaderboard.invitesTab') : '邀请榜'}</span>
        </button>
      </div>

      {/* 当前用户排名卡片 */}
      {activeTab === 'tasks' ? (
        <div style={styles.userRankCard}>
          <div style={styles.userRankGlow} />
          <div style={styles.userRankBadge}>#{userRank}</div>
          <div style={styles.userRankInfo}>
            <p style={styles.userRankLabel}>{t ? t('leaderboard.myRank') : '我的排名'}</p>
            <p style={styles.userRankValue}>
              {currentUser?.first_name || (t ? t('user.guest') : '游客')}
            </p>
          </div>
          <div style={styles.userPoints}>
            <p style={styles.pointsValue}>{userPoints.toLocaleString()}</p>
            <p style={styles.pointsLabel}>{t ? t('leaderboard.points') : '积分'}</p>
          </div>
        </div>
      ) : (
        <div style={styles.userRankCard}>
          <div style={styles.userRankGlow} />
          <div style={styles.userRankBadge}>#{getMyInviteRank()}</div>
          <div style={styles.userRankInfo}>
            <p style={styles.userRankLabel}>{t ? t('leaderboard.myRank') : '我的排名'}</p>
            <p style={styles.userRankValue}>
              {currentUser?.first_name || (t ? t('user.guest') : '游客')}
            </p>
          </div>
          <div style={styles.userPoints}>
            <p style={styles.pointsValue}>{myInviteStatus.inviteCount || 0}</p>
            <p style={styles.pointsLabel}>{t ? t('leaderboard.invites') : '邀请人数'}</p>
          </div>
        </div>
      )}

      {/* 排行榜列表 */}
      <div style={styles.listCard}>
        {loading ? (
          <div style={styles.emptyText}>
            {t ? t('common.loading') : '加载中...'}
          </div>
        ) : activeTab === 'tasks' ? (
          leaderboard.length === 0 ? (
            <div style={styles.emptyText}>
              {t ? t('empty.noResults') : '暂无排行数据'}
            </div>
          ) : (
            leaderboard.map((user, index) => {
              const rankStyle = getRankStyle(user.rank || index + 1);
              return (
                <div
                  key={user.id}
                  style={{
                    ...styles.listItem,
                    borderBottom: index === leaderboard.length - 1 ? 'none' : styles.listItem.borderBottom,
                  }}
                >
                  <div
                    style={{
                      ...styles.rank,
                      ...(rankStyle
                        ? { background: rankStyle.bg, color: rankStyle.color, boxShadow: `0 2px 10px ${rankStyle.glow}` }
                        : { backgroundColor: 'rgba(0, 229, 255, 0.1)', color: 'rgba(255, 255, 255, 0.5)' }
                      ),
                    }}
                  >
                    {user.rank || index + 1}
                  </div>
                  <div style={styles.avatar}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" style={styles.avatarImg} />
                    ) : (
                      <span style={styles.avatarLetter}>
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={styles.info}>
                    <p style={styles.name}>{user.username}</p>
                    <p style={styles.quests}>{t ? t('leaderboard.questsCompleted', { count: user.quests }) : `${user.quests} 任务完成`}</p>
                  </div>
                  <span style={styles.points}>{user.points.toLocaleString()}</span>
                </div>
              );
            })
          )
        ) : (
          inviteLeaderboard.length === 0 ? (
            <div style={styles.emptyText}>
              {t ? t('empty.noInvites') : '暂无邀请数据'}
            </div>
          ) : (
            inviteLeaderboard.map((user, index) => {
              const rankStyle = getRankStyle(user.rank || index + 1);
              return (
                <div
                  key={user.userId}
                  style={{
                    ...styles.listItem,
                    borderBottom: index === inviteLeaderboard.length - 1 ? 'none' : styles.listItem.borderBottom,
                  }}
                >
                  <div
                    style={{
                      ...styles.rank,
                      ...(rankStyle
                        ? { background: rankStyle.bg, color: rankStyle.color, boxShadow: `0 2px 10px ${rankStyle.glow}` }
                        : { backgroundColor: 'rgba(0, 229, 255, 0.1)', color: 'rgba(255, 255, 255, 0.5)' }
                      ),
                    }}
                  >
                    {user.rank || index + 1}
                  </div>
                  <div style={styles.avatar}>
                    <span style={styles.avatarLetter}>
                      {(user.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div style={styles.info}>
                    <p style={styles.name}>{user.username}</p>
                    <p style={styles.quests}>{t ? t('leaderboard.inviteCount', { count: user.inviteCount }) : `${user.inviteCount} 人邀请`}</p>
                  </div>
                  <span style={styles.points}>{user.inviteCount}</span>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
}
