import { useState } from 'react';
import { IconTelegram, IconTwitter, IconSearch } from './icons/CyberpunkIcons';

export function QuestFilter({ onFilterChange, onSearchChange, t }) {
  const QUEST_TYPES = [
    { key: 'all', label: t ? t('filter.all') : '全部', icon: null },
    { key: 'telegram', label: t ? t('filter.telegram') : 'TG任务', icon: <IconTelegram size={14} color="currentColor" /> },
    { key: 'twitter', label: t ? t('filter.twitter') : '推特任务', icon: <IconTwitter size={14} color="currentColor" /> },
  ];
  const [activeType, setActiveType] = useState('all');
  const [searchText, setSearchText] = useState('');

  const handleTypeChange = (type) => {
    setActiveType(type);
    onFilterChange?.(type === 'all' ? null : type);
  };

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onSearchChange?.(value);
  };

  const styles = {
    container: {
      padding: '12px 16px',
      position: 'relative',
      zIndex: 1,
      isolation: 'isolate',
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(20, 20, 45, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 12,
      padding: '10px 14px',
      marginBottom: 12,
      border: '1px solid rgba(0, 229, 255, 0.25)',
      position: 'relative',
      zIndex: 1,
    },
    searchIcon: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.4)',
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 14,
      fontFamily: "'Rajdhani', sans-serif",
      color: '#fff',
    },
    clearButton: {
      padding: '4px 8px',
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
    filterRow: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingBottom: 4,
      position: 'relative',
      zIndex: 1,
    },
    filterChip: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 18px',
      borderRadius: 24,
      fontSize: 13,
      fontWeight: '600',
      fontFamily: "'Rajdhani', sans-serif",
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      flexShrink: 0,
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
    activeChip: {
      background: 'rgba(0, 229, 255, 0.15)',
      color: '#00e5ff',
      borderColor: 'rgba(0, 229, 255, 0.5)',
      boxShadow: '0 0 12px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.1)',
    },
    inactiveChip: {
      background: 'rgba(20, 20, 45, 0.8)',
      color: 'rgba(255, 255, 255, 0.6)',
      borderColor: 'rgba(0, 229, 255, 0.25)',
      boxShadow: 'none',
    },
  };

  return (
    <div style={styles.container}>
      {/* 搜索框 */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}><IconSearch size={16} color="rgba(255, 255, 255, 0.4)" /></span>
        <input
          type="text"
          placeholder={t ? t('filter.searchPlaceholder') : '搜索任务...'}
          value={searchText}
          onChange={handleSearchInput}
          style={styles.searchInput}
        />
        {searchText && (
          <button
            style={styles.clearButton}
            onClick={() => {
              setSearchText('');
              onSearchChange?.('');
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 类型筛选 */}
      <div style={styles.filterRow}>
        {QUEST_TYPES.map(type => {
          const isActive = activeType === type.key;
          return (
            <button
              key={type.key}
              onClick={() => handleTypeChange(type.key)}
              style={{
                ...styles.filterChip,
                ...(isActive ? styles.activeChip : styles.inactiveChip),
              }}
            >
              {type.key === 'telegram' && <span style={{ display: 'flex', alignItems: 'center' }}><IconTelegram size={14} color="#00e5ff" /></span>}
              {type.key === 'twitter' && <span style={{ display: 'flex', alignItems: 'center' }}><IconTwitter size={14} color="#00e5ff" /></span>}
              {type.label}
            </button>
          );
        })}
      </div>

      <style>{`
        .filter-row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
