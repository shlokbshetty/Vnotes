import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RecordingListItem from './RecordingListItem';

const baseProps = {
  id: 'rec-1',
  filename: 'file.wav',
  originalName: 'Meeting Notes.wav',
  duration: 150,
  size: 1258291,
  type: 'audio/wav',
  userId: 'user-1',
  createdAt: '2024-01-15T10:30:00Z',
  tags: [{ label: 'work', color: 'blue' as const }],
  onSelect: vi.fn(),
};

describe('RecordingListItem', () => {
  it('renders metadata in label-mono styling', () => {
    render(<RecordingListItem {...baseProps} />);
    const meta = screen.getByTestId('recording-metadata');
    expect(meta.className).toContain('font-mono');
    expect(meta).toHaveTextContent('Jan 15, 2024');
    expect(meta).toHaveTextContent('2:30');
    expect(meta).toHaveTextContent('1.2 MB');
  });

  it('renders tags as colored pills', () => {
    render(<RecordingListItem {...baseProps} />);
    const tag = screen.getByTestId('recording-tags').querySelector('span');
    expect(tag?.className).toContain('bg-blue-400/10');
    expect(tag).toHaveTextContent('work');
  });

  it('shows transcribing indicator when status is transcribing', () => {
    render(<RecordingListItem {...baseProps} status="transcribing" />);
    expect(screen.getByTestId('transcribing-badge')).toBeInTheDocument();
    expect(screen.getByTestId('recording-list-item-rec-1').className).toContain('opacity-50');
  });

  it('shows completed state at full opacity', () => {
    render(<RecordingListItem {...baseProps} status="completed" />);
    expect(screen.getByTestId('completed-badge')).toBeInTheDocument();
    expect(screen.getByTestId('recording-list-item-rec-1').className).toContain('opacity-100');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<RecordingListItem {...baseProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('recording-list-item-rec-1'));
    expect(onSelect).toHaveBeenCalledWith('rec-1');
  });
});
