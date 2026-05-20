import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadRecording, getRecordings, getRecording, deleteRecording } from '../controllers/recordingController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    // Accept audio and video files
    const allowedMimes = [
      'audio/wav', 'audio/mpeg', 'audio/mp3',
      'video/mp4', 'video/x-matroska', 'video/mkv'
    ];
    
    if (allowedMimes.includes(file.mimetype) || 
        file.mimetype.startsWith('audio/') || 
        file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio and video files are allowed'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

// Routes
router.post('/upload', upload.single('file'), uploadRecording);
router.get('/', getRecordings);
router.get('/:id', getRecording);
router.delete('/:id', deleteRecording);

export default router;