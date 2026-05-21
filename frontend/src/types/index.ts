/**
 * Type Definitions
 * Shared types across the application
 */

export interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  isVideo: boolean;
  transcription?: string;
  createdAt: string;
}

export interface Settings {
  userName: string;
  email: string;
  enableTranscription?: boolean;
}
