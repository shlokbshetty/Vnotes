/**
 * Recording Controller
 * Handles HTTP request/response for recording endpoints
 */

import { Request, Response } from 'express';
import { recordingService } from '../services/recordingService';
import { summaryService } from '../services/summaryService';
import { transcriptionService } from '../services/transcriptionService';
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
    const searchQuery = req.query.q as string | undefined;
    logger.info('Fetching recordings', { searchQuery });
    
    const recordings = recordingService.getAllRecordings(searchQuery);
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

export const addKeyMoment = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { time, label } = req.body;

    if (!time || !label) {
      return res.status(400).json(createErrorResponse('Time and label required', 'INVALID_INPUT'));
    }

    logger.info('Adding key moment', { id, time });
    const recording = recordingService.addKeyMoment(id, time, label);

    if (!recording) {
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    res.json(createSuccessResponse(recording));
  } catch (error) {
    logger.error('Add key moment error', error);
    res.status(500).json(createErrorResponse('Failed to add key moment', 'ERROR'));
  }
};

export const removeKeyMoment = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { time } = req.body;

    if (!time) {
      return res.status(400).json(createErrorResponse('Time required', 'INVALID_INPUT'));
    }

    logger.info('Removing key moment', { id, time });
    const recording = recordingService.removeKeyMoment(id, time);

    if (!recording) {
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    res.json(createSuccessResponse(recording));
  } catch (error) {
    logger.error('Remove key moment error', error);
    res.status(500).json(createErrorResponse('Failed to remove key moment', 'ERROR'));
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Generating summary', { id });

    const recording = recordingService.getRecordingById(id);

    if (!recording) {
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    if (!recording.transcription) {
      return res.status(400).json(createErrorResponse('No transcription available', 'NO_TRANSCRIPTION'));
    }

    const summaryResult = await summaryService.generateSummary(recording.transcription);
    const updated = recordingService.updateRecordingSummary(
      id,
      summaryResult.summary,
      summaryResult.keyPoints,
      summaryResult.actionItems
    );

    logger.info('Summary generated successfully', { id });
    res.json(createSuccessResponse(updated));
  } catch (error) {
    logger.error('Generate summary error', error);
    res.status(500).json(createErrorResponse('Failed to generate summary', 'ERROR'));
  }
};


export const transcribeRecording = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info('Transcribing recording', { id });

    const recording = recordingService.getRecordingById(id);

    if (!recording) {
      return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
    }

    // Get file path
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, recording.filename);

    // Transcribe audio
    const transcriptionResult = await transcriptionService.transcribeAudio(filePath);
    
    // Update recording with transcription
    const updated = recordingService.updateRecordingTranscription(id, transcriptionResult.text);

    logger.info('Recording transcribed successfully', { id });
    res.json(createSuccessResponse(updated));
  } catch (error) {
    logger.error('Transcription error', error);
    res.status(500).json(createErrorResponse('Failed to transcribe recording', 'ERROR'));
  }
};
