import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const RECORDINGS_FILE = path.join(__dirname, '../data/recordings.json');

interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  createdAt: string;
}

const readRecordings = (): Recording[] => {
  try {
    const data = fs.readFileSync(RECORDINGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeRecordings = (recordings: Recording[]): void => {
  fs.writeFileSync(RECORDINGS_FILE, JSON.stringify(recordings, null, 2));
};

export const uploadRecording = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const recordings = readRecordings();
    const newRecording: Recording = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      duration: 0, // Will be calculated on frontend
      createdAt: new Date().toISOString()
    };

    recordings.push(newRecording);
    writeRecordings(recordings);

    res.json(newRecording);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const getRecordings = (req: Request, res: Response) => {
  try {
    const recordings = readRecordings();
    res.json(recordings);
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
};

export const getRecording = (req: Request, res: Response) => {
  try {
    const recordings = readRecordings();
    const recording = recordings.find(r => r.id === req.params.id);
    
    if (!recording) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    res.json(recording);
  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({ error: 'Failed to fetch recording' });
  }
};

export const deleteRecording = (req: Request, res: Response) => {
  try {
    const recordings = readRecordings();
    const recordingIndex = recordings.findIndex(r => r.id === req.params.id);
    
    if (recordingIndex === -1) {
      return res.status(404).json({ error: 'Recording not found' });
    }

    const recording = recordings[recordingIndex];
    
    // Delete file from uploads folder
    const filePath = path.join(__dirname, '../../uploads', recording.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from recordings array
    recordings.splice(recordingIndex, 1);
    writeRecordings(recordings);

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({ error: 'Failed to delete recording' });
  }
};