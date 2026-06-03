/**
 * SideNavBar — Obsidian Echo navigation sidebar
 * Fixed 264px on desktop; collapses to drawer below 1440px.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { path: '/library', label: 'Library', icon: 'description' },
  { path: '/', label: 'Recordings', icon: 'mic' },
  { path: '#favorites', label: 'Favorites', icon: 'grade' },
  { path: '#folders', label: 'Folders', icon: 'folder' },
  { path: '#archive', label: 'Archive', icon: 'archive' },
] as const;

const DESKTOP_BREAKPOINT = '(min-width: 1440px)';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function SideNavBar() {
  const location = useLocation();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_BREAKPOINT).matches : true
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_BREAKPOINT);
    const onChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
      if (event.matches) {
        setDrawerOpen(false);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const sidebar = (
    <aside
      data-testid="side-nav-bar"
      className={`
        flex flex-col h-screen shrink-0 w-64 overflow-y-auto
        bg-surface-container-low text-on-surface
        border-r border-white/10
        px-4 py-6
        ${isDesktop ? 'relative' : 'fixed left-0 top-0 z-50 shadow-xl'}
        ${!isDesktop ? (drawerOpen ? 'translate-x-0' : '-translate-x-full') : ''}
        transition-transform duration-200 ease-out
      `}
    >
      {/* Brand */}
      <div className="mb-10 px-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-[20px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>graphic_eq</span>
        </div>
        <span className="text-headline-md font-headline-md font-bold text-primary">VNotes</span>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-label-mono">PRO</span>
      </div>

      {/* New Recording Button */}
      <Link
        to="/"
        className="mb-8 flex items-center justify-center gap-3 py-3 bg-primary-container text-on-primary-container rounded-lg font-bold transition-transform active:scale-95 text-center text-body-md hover:brightness-110"
      >
        <span className="material-symbols-outlined">mic</span>
        <span className="text-label-mono font-label-mono">New Recording</span>
      </Link>

      {/* Primary navigation */}
      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        <div className="px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Library</span>
        </div>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = isActive(path);
          const isHash = path.startsWith('#');
          
          const linkContent = (
            <>
              <span className={`material-symbols-outlined ${active ? 'text-on-primary-container' : 'group-hover:text-on-surface'}`}>{icon}</span>
              <span className="text-label-mono font-label-mono">{label}</span>
            </>
          );

          if (isHash) {
            return (
              <a
                key={label}
                href={path}
                className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors duration-200 rounded-lg group"
              >
                {linkContent}
              </a>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              data-testid={`nav-link-${label.toLowerCase().replace(' ', '-')}`}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 group
                ${
                  active
                    ? 'bg-primary-container text-on-primary-container font-bold bg-primary-accent'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }
              `}
            >
              {linkContent}
            </Link>
          );
        })}
      </nav>

      {/* Footer navigation & User Info */}
      <div className="mt-auto pt-6 space-y-1 border-t border-black/15 dark:border-white/10" data-testid="side-nav-footer">
        <Link
          to="/pricing"
          data-testid="nav-link-pricing"
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 group
            ${isActive('/pricing') ? 'bg-primary-container text-on-primary-container font-bold bg-primary-accent' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}
          `}
        >
          <span className="material-symbols-outlined group-hover:text-on-surface">payments</span>
          <span className="text-label-mono font-label-mono">Pricing</span>
        </Link>

        <Link
          to="/settings"
          data-testid="nav-link-settings"
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 group
            ${isActive('/settings') ? 'bg-primary-container text-on-primary-container font-bold bg-primary-accent' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}
          `}
        >
          <span className="material-symbols-outlined group-hover:text-on-surface">settings</span>
          <span className="text-label-mono font-label-mono">Settings</span>
        </Link>

        <Link
          to="/help"
          data-testid="nav-link-help"
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 group
            ${isActive('/help') ? 'bg-primary-container text-on-primary-container font-bold bg-primary-accent' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'}
          `}
        >
          <span className="material-symbols-outlined group-hover:text-on-surface">help</span>
          <span className="text-label-mono font-label-mono">Help</span>
        </Link>

        <div data-testid="theme-toggle-row" className="px-3 py-2 flex items-center justify-between text-on-surface-variant hover:text-on-surface">
          <span className="text-label-mono font-label-mono uppercase tracking-widest text-[10px]">Appearance</span>
          <ThemeToggle />
        </div>

        {/* User Card */}
        {user && (
          <div
            className="mt-4 px-3 py-3 flex items-center gap-3 rounded-lg bg-surface-container hover:bg-surface-container-highest transition-all cursor-pointer border border-black/15 dark:border-white/10"
            data-testid="user-profile-section"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-primary-container text-xs font-semibold text-on-primary-container">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md font-bold text-on-surface leading-normal">{user.name}</p>
              <p className="truncate text-[10px] text-on-surface-variant font-label-mono leading-none mb-1">{user.email}</p>
              <p className="truncate text-[10px] text-primary/70 font-label-mono uppercase tracking-tighter">Pro Plan</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  if (isDesktop) {
    return sidebar;
  }

  return (
    <>
      <button
        type="button"
        data-testid="side-nav-menu-button"
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-surface-container-low text-on-surface"
        aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={drawerOpen}
        onClick={() => setDrawerOpen((open) => !open)}
      >
        <span className="material-symbols-outlined">{drawerOpen ? 'close' : 'menu'}</span>
      </button>

      {drawerOpen && (
        <button
          type="button"
          data-testid="side-nav-backdrop"
          className="fixed inset-0 z-40 bg-black/50"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {sidebar}
    </>
  );
}
