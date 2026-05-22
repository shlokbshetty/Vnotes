export interface KeyMoment {
  time: string;
  label: string;
}

export interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  isVideo: boolean;
  transcription?: string;
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  keyMoments?: KeyMoment[];
  createdAt: string;
}

export interface Settings {
  userName: string;
  email: string;
  enableTranscription?: boolean;
}