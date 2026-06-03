import React, { useState, useMemo } from 'react';
import './ListPanel.css';

export interface ListItem {
  id: string;
  title: string;
  date: string;
  duration?: string;
  tags?: string[];
  type?: 'note' | 'recording';
}

interface ListPanelProps {
  items: ListItem[];
  activeItemId?: string;
  onSelectItem: (itemId: string) => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

/**
 * Middle List Panel - Notes/Recordings
 * 
 * Features:
 * - Flat list of items (no cards)
 * - Compact item display with metadata
 * - Optional search/filter
 * - Hover and active state animations
 * - Scrollable with subtle scrollbar
 */
const ListPanel: React.FC<ListPanelProps> = ({
  items,
  activeItemId,
  onSelectItem,
  onSearch,
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="list-panel-container">
      {/* Search Bar */}
      {showSearch && (
        <div className="list-panel-search-container">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearch}
            className="list-panel-search-input"
            aria-label="Search notes and recordings"
          />
        </div>
      )}

      {/* Items List */}
      <div className="list-panel-items" role="listbox">
        {filteredItems.length === 0 ? (
          <div className="list-panel-empty">
            <p>{searchQuery ? 'No results found' : 'No items yet'}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              className={`list-item ${activeItemId === item.id ? 'active' : ''}`}
              onClick={() => onSelectItem(item.id)}
              role="option"
              aria-selected={activeItemId === item.id}
              aria-label={`${item.title}, ${item.date}${item.duration ? `, ${item.duration}` : ''}`}
            >
              {/* Item Content */}
              <div className="list-item-content">
                <div className="list-item-header">
                  <h3 className="list-item-title">{item.title}</h3>
                  {item.type === 'recording' && (
                    <span className="list-item-type-badge">🎙️</span>
                  )}
                  {item.type === 'note' && (
                    <span className="list-item-type-badge">📝</span>
                  )}
                </div>

                {/* Metadata */}
                <div className="list-item-metadata">
                  <span className="list-item-date">{item.date}</span>
                  {item.duration && (
                    <>
                      <span className="list-item-separator">•</span>
                      <span className="list-item-duration">{item.duration}</span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="list-item-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="list-item-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ListPanel;
