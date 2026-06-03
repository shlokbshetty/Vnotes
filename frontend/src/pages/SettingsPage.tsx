/**
 * Settings Page - Editorial Design
 * User preferences and account management
 */

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
    <div className="flex w-full h-full">
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto bg-neutral-950">
        <div className="p-xl max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-2xl">
            <h1 className="text-4xl font-display font-bold text-neutral-50">Settings</h1>
            <p className="text-neutral-400 mt-sm text-base">Manage your profile and preferences</p>
          </div>

          {/* Settings Form */}
          <div className="card card-elevated p-lg space-y-lg mb-xl">
            {/* User Name */}
            <div>
              <label htmlFor="userName" className="block font-semibold text-sm text-neutral-200 mb-sm">
                User Name
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                value={settings.userName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="w-full px-md py-sm border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-smooth"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-semibold text-sm text-neutral-200 mb-sm">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-md py-sm border border-neutral-700 rounded-lg bg-neutral-800 text-neutral-50 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-smooth"
              />
            </div>

            {/* Save Message */}
            {isSaved && (
              <div className="p-md bg-accent-600 bg-opacity-10 border border-accent-600 border-opacity-30 text-accent-400 rounded-lg text-sm font-medium flex items-center gap-md slide-down">
                <span className="material-symbols-outlined">check_circle</span>
                Settings saved successfully
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-md pt-md border-t border-neutral-700">
              <button
                onClick={handleSave}
                className="flex-1 px-lg py-md bg-accent-600 text-neutral-50 rounded-lg font-semibold text-sm hover-lift hover:bg-accent-700 transition-smooth flex items-center justify-center gap-md"
              >
                <span className="material-symbols-outlined text-base">save</span>
                Save Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-lg py-md border border-neutral-700 text-neutral-300 rounded-lg font-semibold text-sm hover:bg-neutral-800 hover-lift transition-smooth flex items-center justify-center gap-md"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Logout
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="card p-lg border border-neutral-700">
            <h2 className="font-semibold text-neutral-100 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">info</span>
              About Your Settings
            </h2>
            <ul className="space-y-sm text-neutral-400 text-sm">
              <li className="flex gap-md">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Your settings are saved locally in your browser</span>
              </li>
              <li className="flex gap-md">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Logging out will clear all your data from this device</span>
              </li>
              <li className="flex gap-md">
                <span className="text-accent-400 flex-shrink-0">•</span>
                <span>Settings are not synced across devices</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
