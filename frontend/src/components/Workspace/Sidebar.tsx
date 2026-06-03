import React, { useState } from 'react';
import UserMenu from '../UserMenu';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  children?: NavItem[];
  onClick: (id: string) => void;
}

interface SidebarProps {
  items: NavItem[];
  activeItemId: string;
  onNavigate: (itemId: string) => void;
}

/**
 * Obsidian-Inspired Sidebar Navigation
 * 
 * Features:
 * - Hierarchical navigation with fold/unfold
 * - Active state with left border accent
 * - Smooth hover interactions
 * - Section headers with item counts
 * - User menu at bottom
 */
const Sidebar: React.FC<SidebarProps> = ({ items, activeItemId, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['all-notes', 'recordings']));

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderNavItems = (navItems: NavItem[], depth: number = 0) => {
    return navItems.map((item) => {
      const isActive = activeItemId === item.id;
      const isExpanded = expandedItems.has(item.id);
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.id}>
          <button
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => {
              onNavigate(item.id);
              if (hasChildren) {
                toggleExpand(item.id);
              }
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="sidebar-nav-label">
              {item.icon && <span className="sidebar-icon">{item.icon}</span>}
              {item.label}
            </span>
            {item.count !== undefined && (
              <span className="sidebar-count">{item.count}</span>
            )}
            {hasChildren && (
              <span className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`}>
                ▶
              </span>
            )}
          </button>
          {hasChildren && isExpanded && (
            <div className="sidebar-children">
              {renderNavItems(item.children || [], depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <nav className="sidebar-container">
      {/* Workspace Title */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">VNotes</h1>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {renderNavItems(items)}
      </div>

      {/* User Menu at Bottom */}
      <div className="sidebar-footer">
        <UserMenu />
      </div>
    </nav>
  );
};

export default Sidebar;
