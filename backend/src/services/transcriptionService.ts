/**
 * Transcription Service
 * Handles speech-to-text conversion using ElevenLabs API
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { logger } from '../utils/logger';
import { config } from '../config/env';

interface TranscriptionResult {
  text: string;
  confidence?: number;
}

class TranscriptionService {
  private readonly ELEVENLABS_API_KEY = config.ELEVENLABS_API_KEY;
  private readonly ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

  /**
   * Transcribe audio file using ElevenLabs API
   */
  async transcribeAudio(filePath: string): Promise<TranscriptionResult> {
    try {
      if (!this.ELEVENLABS_API_KEY) {
        logger.warn('ElevenLabs API key not configured, using fallback');
        return this.fallbackTranscription(filePath);
      }

      logger.info('Starting transcription with ElevenLabs', { filePath });

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
      }

      // Create form data with audio file
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      formData.append('audio', fileStream);

      // Call ElevenLabs speech-to-text API
      const response = await axios.post(
        `${this.ELEVENLABS_BASE_URL}/speech-to-text`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'xi-api-key': this.ELEVENLABS_API_KEY
          },
          timeout: 120000 // 2 minute timeout for large files
        }
      );

      logger.info('Transcription completed successfully', {
        textLength: response.data.text?.length || 0
      });

      return {
        text: response.data.text || '',
        confidence: response.data.confidence
      };
    } catch (error: any) {
      logger.error('ElevenLabs transcription failed', {
        error: error.message,
        status: error.response?.status
      });

      // Fallback to simple transcription
      logger.info('Falling back to placeholder transcription');
      return this.fallbackTranscription(filePath);
    }
  }

  /**
   * Fallback transcription when API fails
   * Returns a placeholder message
   */
  private fallbackTranscription(filePath: string): TranscriptionResult {
    try {
      const fileName = filePath.split('/').pop() || 'recording';
      const fileSize = fs.statSync(filePath).size;
      const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

      const placeholderText = `[Transcription pending for ${fileName} (${fileSizeMB}MB)]\n\nNote: To enable automatic transcription, please configure your ElevenLabs API key in the .env file:\nELEVENLABS_API_KEY=your_api_key_here\n\nOnce configured, re-upload the audio file to generate a full transcription.`;

      logger.info('Using fallback transcription', { fileName });

      return {
        text: placeholderText,
        confidence: 0
      };
    } catch (error) {
      logger.error('Fallback transcription failed', error);
      return {
        text: '[Transcription unavailable]',
        confidence: 0
      };
    }
  }

  /**
   * Test API connectivity
   */
  async testAPIConnectivity(): Promise<boolean> {
    try {
      if (!this.ELEVENLABS_API_KEY) {
        logger.warn('ElevenLabs API key not configured');
        return false;
      }

      const response = await axios.get(`${this.ELEVENLABS_BASE_URL}/user`, {
        headers: {
          'xi-api-key': this.ELEVENLABS_API_KEY
        },
        timeout: 10000
      });

      logger.info('ElevenLabs API connectivity test passed');
      return response.status === 200;
    } catch (error: any) {
      logger.error('ElevenLabs API connectivity test failed', {
        error: error.message,
        status: error.response?.status
      });
      return false;
    }
  }
}

export const transcriptionService = new TranscriptionService();
