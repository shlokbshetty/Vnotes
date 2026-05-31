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
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'dev-256-bit-secret-key-minimum-for-hmac-sha256-token-generation',
  JWT_EXPIRATION: parseInt(process.env.JWT_EXPIRATION || '86400', 10), // 24 hours default
  
  // Google OAuth Configuration
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  GOOGLE_OAUTH_CALLBACK_URI: process.env.GOOGLE_OAUTH_CALLBACK_URI || 'http://localhost:3001/auth/oauth/callback',
  
  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

export const isProduction = config.NODE_ENV === 'production';
export const isDevelopment = config.NODE_ENV === 'development';
