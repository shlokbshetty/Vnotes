import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecordingCard from './RecordingCard';
import { Recording } from '../types';

describe('RecordingCard', () => {
  const mockRecording: Recording = {
    id: '1',
    filename: 'test.wav',
    originalName: 'Test Recording',
    duration: 125,
    size: 2621440, // 2.5 MB
    type: 'audio/wav',
    createdAt: '2024-01-15T10:30:00Z'
  };

  it('renders recording name', () => {
    render(<RecordingCard recording={mockRecording} />);
    expect(screen.getByText('Test Recording')).toBeInTheDocument();
  });

  it('formats file size correctly', () => {
    render(<RecordingCard recording={mockRecording} />);
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
  });

  it('extracts file type from MIME type', () => {
    render(<RecordingCard recording={mockRecording} />);
    expect(screen.getByText('WAV')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    render(<RecordingCard recording={mockRecording} />);
    expect(screen.getByText('2:05')).toBeInTheDocument();
  });

  it('renders audio player', () => {
    render(<RecordingCard recording={mockRecording} />);
    const audioElement = screen.getByRole('img', { hidden: true });
    expect(audioElement).toBeInTheDocument();
  });

  it('handles different file sizes', () => {
    const smallFile: Recording = { ...mockRecording, size: 512 };
    const { rerender } = render(<RecordingCard recording={smallFile} />);
    expect(screen.getByText('512 B')).toBeInTheDocument();

    const largeFile: Recording = { ...mockRecording, size: 1073741824 }; // 1 GB
    rerender(<RecordingCard recording={largeFile} />);
    expect(screen.getByText('1 GB')).toBeInTheDocument();
  });

  it('handles different MIME types', () => {
    const mp3Recording: Recording = { ...mockRecording, type: 'audio/mpeg' };
    const { rerender } = render(<RecordingCard recording={mp3Recording} />);
    expect(screen.getByText('MPEG')).toBeInTheDocument();

    const m4aRecording: Recording = { ...mockRecording, type: 'audio/mp4' };
    rerender(<RecordingCard recording={m4aRecording} />);
    expect(screen.getByText('MP4')).toBeInTheDocument();
  });
});
