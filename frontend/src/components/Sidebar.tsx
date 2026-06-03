import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="flex flex-col h-full p-lg border-r border-neutral-800 bg-neutral-950 w-64 sticky left-0 top-0">
      {/* Header */}
      <div className="mb-xl px-md">
        <h1 className="text-3xl font-bold text-accent-500 font-display">VNotes</h1>
        <p className="text-xs text-neutral-500 mt-sm uppercase tracking-widest">Pro Workspace</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-xs">
        {[
          { path: '/', label: 'Recording', icon: 'mic' },
          { path: '/library', label: 'Library', icon: 'history' },
          { path: '/settings', label: 'Settings', icon: 'settings' },
        ].map(({ path, label, icon }) => (
          <Link
            key={path}
            to={path}
            className={`px-md py-sm flex items-center gap-md rounded-lg transition-smooth ${
              isActive(path)
                ? 'bg-accent-600 text-neutral-50 shadow-md'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-800 pt-md flex flex-col gap-xs">
        <Link
          to="/help"
          className={`px-md py-sm flex items-center gap-md rounded-lg transition-smooth ${
            isActive('/help')
              ? 'bg-accent-600 text-neutral-50 shadow-md'
              : 'text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          <span className="material-symbols-outlined text-xl">help</span>
          <span className="font-medium text-sm">Help</span>
        </Link>
        <UserMenu />
      </div>
    </aside>
  );
};

export default Sidebar;