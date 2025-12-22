import React, { useState } from 'react';

export function QuestFilter({ onFilterChange, onSearchChange, theme, t }) {
  const QUEST_TYPES = [
    { key: 'all', label: t ? t('filter.all') : '全部', icon: '📋' },
    { key: 'telegram', label: t ? t('filter.telegram') : 'TG任务', icon: '📱' },
    { key: 'twitter', label: t ? t('filter.twitter') : '推特任务', icon: '🐦' },
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
      backgroundColor: theme.secondaryBg,
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.bg,
      borderRadius: 12,
      padding: '10px 14px',
      marginBottom: 12,
      border: `1px solid ${theme.hint}20`,
    },
    searchIcon: {
      fontSize: 16,
      color: theme.hint,
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 15,
      color: theme.text,
    },
    clearButton: {
      padding: '4px 8px',
      fontSize: 14,
      color: theme.hint,
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
    },
    filterChip: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '8px 14px',
      borderRadius: 20,
      fontSize: 13,
      fontWeight: '500',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
    },
    activeChip: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
    },
    inactiveChip: {
      backgroundColor: theme.bg,
      color: theme.text,
      border: `1px solid ${theme.hint}20`,
    },
  };

  return (
    <div style={styles.container}>
      {/* 搜索框 */}
      <div style={styles.searchBox}>
        <span style={styles.searchIcon}>🔍</span>
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
        {QUEST_TYPES.map(type => (
          <button
            key={type.key}
            onClick={() => handleTypeChange(type.key)}
            style={{
              ...styles.filterChip,
              ...(activeType === type.key ? styles.activeChip : styles.inactiveChip),
            }}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .filter-row::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
