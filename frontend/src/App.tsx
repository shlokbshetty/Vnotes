import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import RecordingPage from './pages/RecordingPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import PricingPage from './pages/PricingPage';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import './index.css';
import './styles/theme.css';
import './styles/motion.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        {/* Phase 1: Premium Dark Theme - Matte pitch-black background */}
        <div className="flex h-screen overflow-hidden bg-surface font-sans text-neutral-100">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<GoogleAuthCallback />} />
            <Route path="/pricing" element={<PricingPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RecordingPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
