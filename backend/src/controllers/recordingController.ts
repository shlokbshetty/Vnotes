/**
 * Recording Controller
 * Handles HTTP request/response for recording endpoints
 * 
 * Error Handling:
 * - 400: Bad request (missing file, invalid input)
 * - 403: Forbidden (ownership verification failed)
 * - 404: Not found (recording doesn't exist)
 * - 500: Server errors (database failures, processing errors) - generic messages without internal details
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

import { Request, Response } from 'express';
import { recordingService } from '../services/recordingService';
import { summaryService } from '../services/summaryService';
import { transcriptionService } from '../services/transcriptionService';
import { logger } from '../utils/logger';
import { createErrorResponse, createSuccessResponse, categorizeDatabaseError } from '../utils/errorHandler';
import path from 'path';

export const uploadRecording = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      logger.warn('Upload attempted without file');
      return res.status(400).json(createErrorResponse('No file uploaded', 'NO_FILE'));
    }

    const userId = req.userId;
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }

    logger.info('Recording upload started', { filename: req.file.filename, size: req.file.size, userId });

    const recording = recordingService.createRecording(
      req.file.filename,
      req.file.originalname,
      req.file.size,
      req.file.mimetype,
      userId
    );

    const savedRecording = recordingService.addRecording(recording);
    logger.info('Recording uploaded successfully', { id: savedRecording.id, userId });

    res.status(201).json(createSuccessResponse(savedRecording));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Recording upload error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to upload recording', 'UPLOAD_ERROR'));
  }
};

export const getRecordings = (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q as string | undefined;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }
    
    logger.info('Fetching recordings', { searchQuery, userId });
    
    try {
      const recordings = recordingService.getAllRecordings(searchQuery, userId);
      res.json(createSuccessResponse(recordings));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to query recordings', {
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to fetch recordings', 'FETCH_ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Get recordings error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to fetch recordings', 'FETCH_ERROR'));
  }
};

export const getRecording = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }
    
    logger.info('Fetching recording', { id, userId });

    try {
      const recording = recordingService.getRecordingById(id);

      if (!recording) {
        logger.warn('Recording not found', { id, userId });
        return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
      }

      // Ownership check: if the recording has an owner, verify it matches the requester
      if (recording.user_id && recording.user_id !== userId) {
        logger.warn('Ownership verification failed for recording retrieval', {
          recordingId: id,
          recordingUserId: recording.user_id,
          requestingUserId: userId,
        });
        return res.status(403).json(createErrorResponse('Recording belongs to different user', 'FORBIDDEN'));
      }

      res.json(createSuccessResponse(recording));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to query recording', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to fetch recording', 'FETCH_ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Get recording error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to fetch recording', 'FETCH_ERROR'));
  }
};

export const deleteRecording = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }
    
    logger.info('Deleting recording', { id, userId });

    try {
      // Get the recording first to check ownership
      const recording = recordingService.getRecordingById(id);

      if (!recording) {
        logger.warn('Recording not found for deletion', { id, userId });
        return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
      }

      // Verify ownership: only block if recording has an owner AND it doesn't match the requester
      // Legacy recordings without user_id are accessible to any authenticated user
      if (recording.user_id && recording.user_id !== userId) {
        logger.warn('Unauthorized deletion attempt', {
          recordingId: id,
          recordingUserId: recording.user_id,
          requestingUserId: userId,
        });
        return res.status(403).json(createErrorResponse('Recording belongs to different user', 'FORBIDDEN'));
      }

      // Delete recording file and metadata
      const uploadsDir = path.join(__dirname, '../../uploads');
      const deleted = recordingService.deleteRecording(id, uploadsDir);

      if (!deleted) {
        logger.warn('Recording deletion failed', { id, userId });
        return res.status(500).json(createErrorResponse('Failed to delete recording', 'DELETE_ERROR'));
      }

      logger.info('Recording deleted successfully', { id, userId });
      res.json(createSuccessResponse({ message: 'Recording deleted successfully' }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Recording deletion error', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to delete recording', 'DELETE_ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Delete recording error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to delete recording', 'DELETE_ERROR'));
  }
};

export const addKeyMoment = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { time, label } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }

    if (!time || !label) {
      return res.status(400).json(createErrorResponse('Time and label required', 'INVALID_INPUT'));
    }

    logger.info('Adding key moment', { id, time, userId });
    
    try {
      const recording = recordingService.addKeyMoment(id, time, label);

      if (!recording) {
        return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
      }

      res.json(createSuccessResponse(recording));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to add key moment', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to add key moment', 'ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Add key moment error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to add key moment', 'ERROR'));
  }
};

export const removeKeyMoment = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { time } = req.body;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }

    if (!time) {
      return res.status(400).json(createErrorResponse('Time required', 'INVALID_INPUT'));
    }

    logger.info('Removing key moment', { id, time, userId });
    
    try {
      const recording = recordingService.removeKeyMoment(id, time);

      if (!recording) {
        return res.status(404).json(createErrorResponse('Recording not found', 'NOT_FOUND'));
      }

      res.json(createSuccessResponse(recording));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to remove key moment', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to remove key moment', 'ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Remove key moment error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to remove key moment', 'ERROR'));
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }
    
    logger.info('Generating summary', { id, userId });

    try {
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

      logger.info('Summary generated successfully', { id, userId });
      res.json(createSuccessResponse(updated));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to generate summary', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to generate summary', 'ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Generate summary error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to generate summary', 'ERROR'));
  }
};


export const transcribeRecording = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!userId) {
      logger.error('UserId missing from authenticated request');
      return res.status(401).json(createErrorResponse('Authentication context missing', 'MISSING_AUTH_CONTEXT'));
    }
    
    logger.info('Transcribing recording', { id, userId });

    try {
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

      logger.info('Recording transcribed successfully', { id, userId });
      res.json(createSuccessResponse(updated));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to transcribe recording', {
        recordingId: id,
        userId,
        internalMessage: errorMessage,
      });
      res.status(500).json(createErrorResponse('Failed to transcribe recording', 'ERROR'));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Transcription error', {
      internalMessage: errorMessage,
      userId: req.userId,
    });
    res.status(500).json(createErrorResponse('Failed to transcribe recording', 'ERROR'));
  }
};
