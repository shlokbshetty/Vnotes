import React, { ReactNode, useState, useRef, useEffect } from 'react';
import './Workspace.css';

interface WorkspaceProps {
  sidebar?: ReactNode;
  listPanel: ReactNode;
  mainPanel: ReactNode;
  hideSidebar?: boolean;
  onPanelWidthChange?: (sidebarWidth: number, listPanelWidth: number) => void;
}

/**
 * Workspace Layout Container
 * 
 * 3-panel grid structure:
 * [Sidebar 240px | resize] [List Panel 300px | resize] [Main Panel flex]
 * 
 * Features:
 * - Resizable sidebar and list panel with drag handles
 * - Collapsible sidebar with toggle button
 * - Persist panel widths to localStorage
 * - Smooth transitions and animations
 */
const Workspace: React.FC<WorkspaceProps> = ({ 
  sidebar, 
  listPanel, 
  mainPanel,
  hideSidebar = false,
  onPanelWidthChange 
}) => {
  // State for panel widths
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [listPanelWidth, setListPanelWidth] = useState(300);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState<'sidebar' | 'listPanel' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const listPanelRef = useRef<HTMLDivElement>(null);

  // Constants for min/max widths
  const MIN_SIDEBAR_WIDTH = 100;
  const MAX_SIDEBAR_WIDTH = 400;
  const MIN_LIST_PANEL_WIDTH = 150;
  const MAX_LIST_PANEL_WIDTH = 500;

  // Load panel widths from localStorage on mount
  useEffect(() => {
    const savedSidebarWidth = localStorage.getItem('workspace-sidebar-width');
    const savedListPanelWidth = localStorage.getItem('workspace-list-panel-width');
    const savedCollapsedState = localStorage.getItem('workspace-sidebar-collapsed');

    if (savedSidebarWidth) setSidebarWidth(parseInt(savedSidebarWidth, 10));
    if (savedListPanelWidth) setListPanelWidth(parseInt(savedListPanelWidth, 10));
    if (savedCollapsedState) setIsSidebarCollapsed(JSON.parse(savedCollapsedState));
  }, []);

  // Save panel widths to localStorage when they change
  useEffect(() => {
    localStorage.setItem('workspace-sidebar-width', String(sidebarWidth));
    localStorage.setItem('workspace-list-panel-width', String(listPanelWidth));
    localStorage.setItem('workspace-sidebar-collapsed', JSON.stringify(isSidebarCollapsed));
    
    if (onPanelWidthChange) {
      onPanelWidthChange(sidebarWidth, listPanelWidth);
    }
  }, [sidebarWidth, listPanelWidth, isSidebarCollapsed, onPanelWidthChange]);

  // Handle resize of sidebar
  const handleSidebarResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing('sidebar');
  };

  // Handle resize of list panel
  const handleListPanelResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResizing('listPanel');
  };

  // Global mouse move handler for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left;

      if (isResizing === 'sidebar') {
        // Calculate new sidebar width based on mouse position
        const newWidth = Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(MAX_SIDEBAR_WIDTH, newX)
        );
        setSidebarWidth(newWidth);
      } else if (isResizing === 'listPanel') {
        // Calculate new list panel width based on mouse position
        const newX = e.clientX - containerRect.left;
        const sidebarEnd = isSidebarCollapsed ? 0 : sidebarWidth;
        const listPanelStart = sidebarEnd + 8; // Account for resize handle width
        const newWidth = Math.max(
          MIN_LIST_PANEL_WIDTH,
          Math.min(MAX_LIST_PANEL_WIDTH, newX - listPanelStart)
        );
        setListPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, sidebarWidth, isSidebarCollapsed, listPanelWidth]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const effectiveSidebarWidth = hideSidebar ? 0 : isSidebarCollapsed ? 0 : sidebarWidth;
  const showWorkspaceSidebar = !hideSidebar && sidebar != null;

  const gridTemplateColumns = showWorkspaceSidebar && !isSidebarCollapsed
    ? `${effectiveSidebarWidth}px 8px ${listPanelWidth}px 8px 1fr`
    : isSidebarCollapsed && showWorkspaceSidebar
      ? `32px ${listPanelWidth}px 8px 1fr`
      : `${listPanelWidth}px 8px 1fr`;

  return (
    <div 
      className="workspace-container"
      ref={containerRef}
      style={{ gridTemplateColumns }}
    >
      {/* Left Sidebar - Resizable and Collapsible */}
      {showWorkspaceSidebar && !isSidebarCollapsed && (
        <aside 
          className="workspace-sidebar"
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px` }}
        >
          <button
            className="sidebar-collapse-btn"
            onClick={toggleSidebarCollapse}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            ◀
          </button>
          {sidebar}
        </aside>
      )}

      {/* Sidebar Resize Handle */}
      {showWorkspaceSidebar && !isSidebarCollapsed && (
        <div
          className={`workspace-resize-handle workspace-resize-handle-sidebar ${
            isResizing === 'sidebar' ? 'active' : ''
          }`}
          onMouseDown={handleSidebarResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}

      {/* Collapsed Sidebar Toggle (when sidebar is collapsed) */}
      {showWorkspaceSidebar && isSidebarCollapsed && (
        <div className="workspace-collapsed-sidebar">
          <button
            className="sidebar-expand-btn"
            onClick={toggleSidebarCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            ▶
          </button>
        </div>
      )}

      {/* Middle List Panel - Resizable */}
      <section 
        className="workspace-list-panel"
        ref={listPanelRef}
        style={{ width: `${listPanelWidth}px` }}
      >
        {listPanel}
      </section>

      {/* List Panel Resize Handle */}
      <div
        className={`workspace-resize-handle workspace-resize-handle-list-panel ${
          isResizing === 'listPanel' ? 'active' : ''
        }`}
        onMouseDown={handleListPanelResizeStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize list panel"
      />

      {/* Main Editor Panel - flex to fill remaining space */}
      <main className="workspace-main-panel">
        {mainPanel}
      </main>
    </div>
  );
};

export default Workspace;
