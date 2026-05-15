import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex flex-col h-full p-4 border-r border-outline-variant bg-surface-container-lowest shadow-md w-64 sticky left-0 top-0">
      <div className="mb-8 px-4">
        <h1 className="font-headline-lg text-headline-lg font-bold text-primary">VNotes</h1>
        <div className="mt-4 p-3 rounded-xl bg-surface-container-high flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">workspaces</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm font-bold text-on-surface">Pro Workspace</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Premium Plan</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        <Link 
          to="/" 
          className={`px-4 py-3 flex items-center gap-3 rounded-xl transition-all ${
            location.pathname === '/' 
              ? 'bg-primary text-background scale-95 duration-200' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">mic</span>
          <span className="font-body-md">Recordings</span>
        </Link>
        
        <Link 
          to="/library" 
          className={`px-4 py-3 flex items-center gap-3 rounded-xl transition-all ${
            location.pathname === '/library' 
              ? 'bg-primary text-background scale-95 duration-200' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined">history</span>
          <span className="font-body-md">History</span>
        </Link>
        
        <a className="text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high rounded-xl transition-all" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-body-md">Settings</span>
        </a>
        
        <button className="mt-4 mx-4 bg-primary text-background font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Note
        </button>
      </nav>

      <div className="border-t border-outline-variant pt-4 flex flex-col gap-1">
        <a className="text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high rounded-xl transition-all" href="#">
          <span className="material-symbols-outlined">help</span>
          <span className="font-body-md">Help</span>
        </a>
        <a className="text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:bg-surface-container-high rounded-xl transition-all" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md">Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;