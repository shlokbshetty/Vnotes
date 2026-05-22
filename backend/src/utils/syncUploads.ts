/**
 * Sync Uploads with Metadata
 * Ensures all files in uploads folder are tracked in recordings.json
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { getMimeType, isVideoFile } from './fileUtils';
import { recordingService, Recording } from '../services/recordingService';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const RECORDINGS_FILE = path.join(__dirname, '../data/recordings.json');

export const syncUploadsWithMetadata = () => {
  try {
    logger.info('Starting uploads sync...');

    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      logger.info('Created uploads directory');
      return;
    }

    // Ensure recordings.json exists
    if (!fs.existsSync(RECORDINGS_FILE)) {
      fs.writeFileSync(RECORDINGS_FILE, JSON.stringify([], null, 2));
      logger.info('Created recordings.json');
    }

    const recordings = recordingService.getAllRecordings();
    const existingFilenames = recordings.map(r => r.filename);
    const files = fs.readdirSync(UPLOADS_DIR);

    let addedCount = 0;

    // Add missing files to recordings
    files.forEach(filename => {
      // Skip .gitkeep and hidden files
      if (filename === '.gitkeep' || filename.startsWith('.')) {
        return;
      }

      if (!existingFilenames.includes(filename)) {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);
        const mimeType = getMimeType(filename);

        const newRecording: Recording = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: filename,
          originalName: filename,
          duration: 0,
          size: stats.size,
          type: mimeType,
          isVideo: isVideoFile(mimeType),
          createdAt: new Date(stats.birthtime).toISOString()
        };

        recordingService.addRecording(newRecording);
        addedCount++;
        logger.info('Added missing file to metadata', { filename });
      }
    });

    logger.info('Uploads sync completed', { addedCount, totalFiles: files.length });
  } catch (error) {
    logger.error('Error syncing uploads', error);
  }
};
