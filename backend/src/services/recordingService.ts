/**
 * Recording Service
 * Business logic for recording operations including AI features
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { isVideoFile } from '../utils/fileUtils';

const RECORDINGS_FILE = path.join(__dirname, '../data/recordings.json');

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

  getAllRecordings(searchQuery?: string): Recording[] {
    try {
      let recordings = this.readRecordings();
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        recordings = recordings.filter(r => 
          r.originalName.toLowerCase().includes(query) ||
          r.transcription?.toLowerCase().includes(query) ||
          r.summary?.toLowerCase().includes(query)
        );
      }
      
      return recordings;
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

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Recording file deleted', { filename: recording.filename });
      }

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

  updateRecordingSummary(
    id: string,
    summary: string,
    keyPoints: string[] = [],
    actionItems: string[] = []
  ): Recording | null {
    try {
      const recordings = this.readRecordings();
      const recording = recordings.find(r => r.id === id);

      if (!recording) {
        logger.warn('Recording not found for summary update', { id });
        return null;
      }

      recording.summary = summary;
      recording.keyPoints = keyPoints;
      recording.actionItems = actionItems;
      this.writeRecordings(recordings);
      logger.info('Recording summary updated', { id });

      return recording;
    } catch (error) {
      logger.error('Failed to update recording summary', { id, error });
      throw error;
    }
  }

  addKeyMoment(id: string, time: string, label: string): Recording | null {
    try {
      const recordings = this.readRecordings();
      const recording = recordings.find(r => r.id === id);

      if (!recording) {
        logger.warn('Recording not found for key moment', { id });
        return null;
      }

      if (!recording.keyMoments) {
        recording.keyMoments = [];
      }

      recording.keyMoments.push({ time, label });
      this.writeRecordings(recordings);
      logger.info('Key moment added', { id, time });

      return recording;
    } catch (error) {
      logger.error('Failed to add key moment', { id, error });
      throw error;
    }
  }

  removeKeyMoment(id: string, time: string): Recording | null {
    try {
      const recordings = this.readRecordings();
      const recording = recordings.find(r => r.id === id);

      if (!recording || !recording.keyMoments) {
        return null;
      }

      recording.keyMoments = recording.keyMoments.filter(km => km.time !== time);
      this.writeRecordings(recordings);
      logger.info('Key moment removed', { id, time });

      return recording;
    } catch (error) {
      logger.error('Failed to remove key moment', { id, error });
      throw error;
    }
  }
}

export const recordingService = new RecordingService();
