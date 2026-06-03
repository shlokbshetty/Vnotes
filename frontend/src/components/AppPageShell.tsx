/**
 * AppPageShell — SideNavBar + main content area for authenticated pages
 */

import { ReactNode } from 'react';
import SideNavBar from './SideNavBar';

interface AppPageShellProps {
  children: ReactNode;
}

export default function AppPageShell({ children }: AppPageShellProps) {
  return (
    <div className="flex h-full min-h-0 w-full bg-surface" data-testid="app-page-shell">
      <SideNavBar />
      <div className="flex min-w-0 flex-1 flex-col" data-testid="app-page-content">
        {children}
      </div>
    </div>
  );
}
