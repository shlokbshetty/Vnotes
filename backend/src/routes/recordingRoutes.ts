/**
 * Recording Routes
 * Defines all recording-related endpoints
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadRecording, getRecordings, getRecording, deleteRecording, addKeyMoment, removeKeyMoment, generateSummary } from '../controllers/recordingController';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const originalName = file.originalname;
    cb(null, `${timestamp}-${randomStr}-${originalName}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [...config.ALLOWED_AUDIO_TYPES, ...config.ALLOWED_VIDEO_TYPES];
  
  if (allowedTypes.includes(file.mimetype) || 
      file.mimetype.startsWith('audio/') || 
      file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    logger.warn('Invalid file type attempted', { mimetype: file.mimetype });
    cb(new Error('Only audio and video files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadRecording);
router.get('/', getRecordings);
router.get('/:id', getRecording);
router.delete('/:id', deleteRecording);

// AI Features
router.post('/:id/key-moments', addKeyMoment);
router.delete('/:id/key-moments', removeKeyMoment);
router.post('/:id/summary', generateSummary);

export default router;