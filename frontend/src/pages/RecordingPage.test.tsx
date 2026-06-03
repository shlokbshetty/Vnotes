import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RecordingPage from './RecordingPage';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthContextType } from '../types';

vi.mock('../hooks/useRecording', () => ({
  useRecording: () => ({
    isRecording: false,
    time: 0,
    isUploading: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    uploadRecording: vi.fn(),
    resetRecording: vi.fn(),
    setError: vi.fn(),
  }),
}));

const mockRecordings = [
  {
    id: 'r1',
    filename: 'a.wav',
    originalName: 'Alpha.wav',
    duration: 60,
    size: 1024,
    type: 'audio/wav',
    isVideo: false,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'r2',
    filename: 'b.wav',
    originalName: 'Beta.wav',
    duration: 90,
    size: 2048,
    type: 'audio/wav',
    isVideo: false,
    createdAt: '2024-01-16T10:00:00Z',
  },
];

const mockFetch = vi.fn();
vi.mock('../hooks/useRecordings', () => ({
  useRecordings: () => ({
    recordings: mockRecordings,
    loading: false,
    error: null,
    fetchRecordings: mockFetch,
    addRecording: vi.fn(),
    deleteRecording: vi.fn(),
    setError: vi.fn(),
  }),
}));

const authContext: AuthContextType = {
  user: {
    user_id: 'u1',
    email: 'u@test.com',
    name: 'User',
  },
  sessionToken: 'tok',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
};

function renderPage() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthContext.Provider value={authContext}>
          <RecordingPage />
        </AuthContext.Provider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('RecordingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders RecordingListItems for fetched recordings', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('recording-list-item-r1')).toBeInTheDocument();
      expect(screen.getByTestId('recording-list-item-r2')).toBeInTheDocument();
    });
  });

  it('shows WaveformPlayer when a recording is selected', async () => {
    renderPage();
    fireEvent.click(screen.getByTestId('recording-list-item-r1'));
    await waitFor(() => {
      expect(screen.getByTestId('waveform-player')).toBeInTheDocument();
    });
  });
});
