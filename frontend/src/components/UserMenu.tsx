/**
 * UserMenu - Editorial Design
 * Minimal user avatar dropdown with logout
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const UserMenu = () => {
  const { user, sessionToken, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL.replace('/api', '')}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
      });
    } catch {
      // Silent fallback
    } finally {
      logout();
      navigate('/login');
    }
  };

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-md px-md py-sm rounded-lg hover:bg-neutral-800 transition-smooth text-neutral-400 hover:text-neutral-200"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-accent-600 text-neutral-50 text-xs font-semibold">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).innerText = initials;
              }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        {/* Name */}
        <span className="font-medium text-sm truncate flex-1 text-left">
          {user.name}
        </span>

        {/* Chevron */}
        <span className="material-symbols-outlined text-neutral-500 text-base">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-xs bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50 slide-down">
          <div className="px-md py-sm border-b border-neutral-700">
            <p className="font-medium text-sm text-neutral-50 truncate">{user.name}</p>
            <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            data-testid="user-menu-logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-md px-md py-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-50 transition-smooth text-sm font-medium"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              logout
            </span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
