import React, { ReactNode } from 'react';
import './Workspace.css';

interface WorkspaceProps {
  sidebar: ReactNode;
  listPanel: ReactNode;
  mainPanel: ReactNode;
}

/**
 * Workspace Layout Container
 * 
 * 3-panel grid structure:
 * [Sidebar 240px] [List Panel 300px] [Main Panel flex]
 * 
 * Provides the foundation for all workspace components.
 */
const Workspace: React.FC<WorkspaceProps> = ({ sidebar, listPanel, mainPanel }) => {
  return (
    <div className="workspace-container">
      {/* Left Sidebar - 240px fixed width */}
      <aside className="workspace-sidebar">
        {sidebar}
      </aside>

      {/* Middle List Panel - 300px fixed width */}
      <section className="workspace-list-panel">
        {listPanel}
      </section>

      {/* Main Editor Panel - flex to fill remaining space */}
      <main className="workspace-main-panel">
        {mainPanel}
      </main>
    </div>
  );
};

export default Workspace;
