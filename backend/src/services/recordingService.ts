/**
 * Recording Service
 * Business logic for recording operations
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { isVideoFile } from '../utils/fileUtils';

const RECORDINGS_FILE = path.join(__dirname, '../data/recordings.json');

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

class RecordingService {
  private readRecordings(): Recording[] {
    try {
      if (!fs.existsSync(RECORDINGS_FILE)) {
        return [];
      }
      const data = fs.readFileSync(RECORDINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to read recordings', error);
      return [];
    }
  }

  private writeRecordings(recordings: Recording[]): void {
    try {
      fs.writeFileSync(RECORDINGS_FILE, JSON.stringify(recordings, null, 2));
    } catch (error) {
      logger.error('Failed to write recordings', error);
      throw error;
    }
  }

  createRecording(
    filename: string,
    originalName: string,
    size: number,
    mimeType: string
  ): Recording {
    const recording: Recording = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      filename,
      originalName,
      duration: 0,
      size,
      type: mimeType,
      isVideo: isVideoFile(mimeType),
      createdAt: new Date().toISOString()
    };

    logger.info('Recording created', { id: recording.id, filename });
    return recording;
  }

  addRecording(recording: Recording): Recording {
    try {
      const recordings = this.readRecordings();
      recordings.push(recording);
      this.writeRecordings(recordings);
      logger.info('Recording added to metadata', { id: recording.id });
      return recording;
    } catch (error) {
      logger.error('Failed to add recording', error);
      throw error;
    }
  }

  getAllRecordings(): Recording[] {
    try {
      return this.readRecordings();
    } catch (error) {
      logger.error('Failed to get all recordings', error);
      return [];
    }
  }

  getRecordingById(id: string): Recording | null {
    try {
      const recordings = this.readRecordings();
      const recording = recordings.find(r => r.id === id);
      return recording || null;
    } catch (error) {
      logger.error('Failed to get recording by id', { id, error });
      return null;
    }
  }

  deleteRecording(id: string, uploadsDir: string): boolean {
    try {
      const recordings = this.readRecordings();
      const recordingIndex = recordings.findIndex(r => r.id === id);

      if (recordingIndex === -1) {
        logger.warn('Recording not found for deletion', { id });
        return false;
      }

      const recording = recordings[recordingIndex];
      const filePath = path.join(uploadsDir, recording.filename);

      // Delete file from disk
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Recording file deleted', { filename: recording.filename });
      }

      // Remove from metadata
      recordings.splice(recordingIndex, 1);
      this.writeRecordings(recordings);
      logger.info('Recording deleted from metadata', { id });

      return true;
    } catch (error) {
      logger.error('Failed to delete recording', { id, error });
      throw error;
    }
  }

  updateRecordingTranscription(id: string, transcription: string): Recording | null {
    try {
      const recordings = this.readRecordings();
      const recording = recordings.find(r => r.id === id);

      if (!recording) {
        logger.warn('Recording not found for transcription update', { id });
        return null;
      }

      recording.transcription = transcription;
      this.writeRecordings(recordings);
      logger.info('Recording transcription updated', { id });

      return recording;
    } catch (error) {
      logger.error('Failed to update recording transcription', { id, error });
      throw error;
    }
  }
}

export const recordingService = new RecordingService();
