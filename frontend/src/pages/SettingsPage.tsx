import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

interface Settings {
  userName: string;
  email: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>({
    userName: '',
    email: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('vnotes_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('vnotes_settings', JSON.stringify(settings));
      setIsSaved(true);
      // Reset the saved indicator after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0">
        <div className="p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full pb-32">
          {/* Page Header */}
          <section className="space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
            <p className="text-body-md text-on-surface-variant">Manage your profile and preferences</p>
          </section>

          {/* Settings Card */}
          <section className="bg-surface p-8 rounded-xl border border-outline-variant note-card-shadow space-y-6">
            {/* User Name Field */}
            <div className="space-y-2">
              <label htmlFor="userName" className="block font-label-md text-label-md text-on-surface">
                User Name
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={settings.userName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block font-label-md text-label-md text-on-surface">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Save Status Message */}
            {isSaved && (
              <div className="p-3 bg-primary-container text-on-primary-container rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span className="font-body-sm">Settings saved successfully</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-primary text-on-primary rounded-lg font-label-lg text-label-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">save</span>
                Save Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 border border-outline-variant text-on-surface rounded-lg font-label-lg text-label-lg hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          </section>

          {/* Info Section */}
          <section className="bg-surface-container-high p-6 rounded-xl border border-outline-variant space-y-3">
            <h2 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              About Your Settings
            </h2>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Your settings are saved locally in your browser</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Logging out will clear all your data from this device</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span>Settings are not synced across devices</span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
