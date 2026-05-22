/**
 * Environment configuration
 * Centralized configuration management for backend
 */

export const config = {
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  UPLOADS_DIR: process.env.UPLOADS_DIR || 'uploads',
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_AUDIO_TYPES: ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/aac', 'audio/flac'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/x-matroska', 'video/mkv', 'video/webm', 'video/avi', 'video/quicktime'],
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
