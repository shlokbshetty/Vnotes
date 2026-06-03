import React from 'react';
import EditorHeader from './EditorHeader';
import RichEditor from './RichEditor';
import Timeline from '../Timeline/Timeline';
import './EditorPanel.css';

export interface Recording {
  id: string;
  title: string;
  content: string;
  date: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  isRecording: boolean;
  tags?: string[];
}

interface EditorPanelProps {
  recording: Recording;
  onUpdate: (recording: Partial<Recording>) => void;
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
}

/**
 * Editor Panel Component
 * 
 * Combines:
 * - EditorHeader (title + metadata)
 * - RichEditor (text content)
 * - Timeline (media playback + recording controls)
 * 
 * Main content area of the 3-panel workspace
 */
const EditorPanel: React.FC<EditorPanelProps> = ({
  recording,
  onUpdate,
  onPlayPause,
  onSeek,
}) => {
  const handleTitleChange = (newTitle: string) => {
    onUpdate({ title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    onUpdate({ content: newContent });
  };

  return (
    <div className="editor-panel">
      {/* Header Section */}
      <EditorHeader
        title={recording.title}
        onTitleChange={handleTitleChange}
        date={recording.date}
        duration={`${Math.floor(recording.duration / 60)}:${(recording.duration % 60).toString().padStart(2, '0')} min`}
        tags={recording.tags}
      />

      {/* Editor Section */}
      <RichEditor
        content={recording.content}
        onContentChange={handleContentChange}
        placeholder="Start typing your notes..."
      />

      {/* Timeline Section */}
      <Timeline
        duration={recording.duration}
        currentTime={recording.currentTime}
        isPlaying={recording.isPlaying}
        isRecording={recording.isRecording}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
      />
    </div>
  );
};

export default EditorPanel;
