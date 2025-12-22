import { useState, useEffect } from 'react';

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: '#fff' };
    case 2:
      return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', color: '#fff' };
    case 3:
      return { bg: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)', color: '#fff' };
    default:
      return null;
  }
};

export function Leaderboard({ currentUser, wallet, theme, api, t }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState({ rank: 0, points: 0, quests: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!api) return;
      setLoading(true);
      try {
        const [leaderboardData, rankData] = await Promise.all([
          api.getLeaderboard(10),
          api.getMyRank()
        ]);
        setLeaderboard(leaderboardData || []);
        setMyRank(rankData || { rank: 0, points: 0, quests: 0 });
      } catch (error) {
        console.error('获取排行榜数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const userRank = myRank.rank || 1;
  const userPoints = myRank.points || 0;

  const styles = {
    container: {
      padding: '0 16px',
    },
    header: {
      textAlign: 'center',
      padding: '20px 0',
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
      margin: 0,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.hint,
      margin: 0,
    },
    userRankCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      border: `2px solid ${theme.link || '#007aff'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    userRankBadge: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    userRankInfo: {
      flex: 1,
    },
    userRankLabel: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
    },
    userRankValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      margin: 0,
    },
    userPoints: {
      textAlign: 'right',
    },
    pointsValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.warning || '#ff9500',
      margin: 0,
    },
    pointsLabel: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
    },
    listCard: {
      backgroundColor: theme.bg,
      borderRadius: 16,
      overflow: 'hidden',
      border: `1px solid ${theme.secondaryBg}`,
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: `1px solid ${theme.secondaryBg}`,
    },
    rank: {
      width: 32,
      height: 32,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: '700',
      marginRight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.secondaryBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
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
      color: theme.text,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      margin: 0,
    },
    quests: {
      fontSize: 12,
      color: theme.hint,
      margin: 0,
    },
    points: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.warning || '#ff9500',
    },
  };

  return (
    <div style={styles.container}>
      {/* 当前用户排名卡片 */}
      <div style={styles.userRankCard}>
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

      {/* 排行榜列表 */}
      <div style={styles.listCard}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.hint }}>
            {t ? t('common.loading') : '加载中...'}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: theme.hint }}>
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
                      ? { background: rankStyle.bg, color: rankStyle.color }
                      : { backgroundColor: theme.secondaryBg, color: theme.hint }
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
        )}
      </div>
    </div>
  );
}
