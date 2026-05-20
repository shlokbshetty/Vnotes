import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecordingPage from './pages/RecordingPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

function App() {
  return (
    <Router>
      <div className="bg-background text-on-surface font-body-md overflow-hidden flex h-screen">
        <Routes>
          <Route path="/" element={<RecordingPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;