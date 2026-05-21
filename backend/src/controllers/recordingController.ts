/**
 * Recording Controller
 * Handles HTTP request/response for recording endpoints
 */

import { Request, Response } from 'express';
import { recordingService } from '../services/recordingService';
import { logger } from '../utils/logger';
import { createErrorResponse, createSuccessResponse } from '../utils/errorHandler';
import path from 'path';

export const uploadRecording = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      logger.warn('Upload attempted without file');
      return res.status(400).json(createErrorResponse('No file uploaded', 'NO_FILE'));
    }

    logger.info('Recording upload started', { filename: req.file.filename, size: req.file.size });

    const recording = recordingService.createRecording(
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype
    );

    const savedRecording = recordingService.addRecording(recording);
    logger.info('Recording uploaded successfully', { id: savedRecording.id });

    res.status(201).json(createSuccessResponse(savedRecording));
  } catch (error) {
    logger.error('Upload error', error);
    res.status(500).json(createErrorResponse('Upload failed', 'UPLOAD_ERROR'));
  }
};

export const getRecordings = (req: Request, res: Response) => {
  try {
    logger.info('Fetching all recordings');
    const recordings = recordingService.getAllRecordings();
    res.json(createSuccessResponse(recordings));
  } catch (error) {
    logger.error('Get recordings error', error);
    res.status(500).json(createErrorResponse('Failed to fetch recordings', 'FETCH_ERROR'));
  }
};

export const getRecording = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Fetching recording', { id });

    const recording = recordingService.getRecordingById(id);

    if (!recording) {
      logger.warn('Recording not found', { id });
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    res.json(createSuccessResponse(recording));
  } catch (error) {
    logger.error('Get recording error', error);
    res.status(500).json(createErrorResponse('Failed to fetch recording', 'FETCH_ERROR'));
  }
};

export const deleteRecording = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Deleting recording', { id });

    const uploadsDir = path.join(__dirname, '../../uploads');
    const deleted = recordingService.deleteRecording(id, uploadsDir);

    if (!deleted) {
      logger.warn('Recording not found for deletion', { id });
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    logger.info('Recording deleted successfully', { id });
    res.json(createSuccessResponse({ message: 'Recording deleted successfully' }));
  } catch (error) {
    logger.error('Delete recording error', error);
    res.status(500).json(createErrorResponse('Failed to delete recording', 'DELETE_ERROR'));
  }
};