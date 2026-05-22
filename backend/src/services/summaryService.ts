/**
 * Summary Service
 * AI-powered summary generation from transcriptions
 */

import { logger } from '../utils/logger';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

class SummaryService {
  /**
   * Generate summary from transcription using ElevenLabs or fallback
   */
  async generateSummary(transcription: string): Promise<SummaryResult> {
    try {
      if (!transcription || transcription.trim().length === 0) {
        logger.warn('Empty transcription provided for summary');
        return {
          summary: '',
          keyPoints: [],
          actionItems: []
        };
      }

      // Try ElevenLabs API first
      const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
      if (elevenLabsKey) {
        try {
          return await this.generateWithElevenLabs(transcription, elevenLabsKey);
        } catch (error) {
          logger.warn('ElevenLabs summary failed, using fallback', error);
        }
      }

      // Fallback: Simple extraction-based summary
      return this.generateFallbackSummary(transcription);
    } catch (error) {
      logger.error('Summary generation failed', error);
      return {
        summary: '',
        keyPoints: [],
        actionItems: []
      };
    }
  }

  private async generateWithElevenLabs(
    transcription: string,
    apiKey: string
  ): Promise<SummaryResult> {
    // Placeholder for ElevenLabs integration
    // In production, call ElevenLabs API
    logger.info('Attempting ElevenLabs summary generation');
    
    // For now, use fallback
    return this.generateFallbackSummary(transcription);
  }

  private generateFallbackSummary(transcription: string): SummaryResult {
    try {
      const sentences = transcription.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length === 0) {
        return {
          summary: '',
          keyPoints: [],
          actionItems: []
        };
      }

      // Create summary from first few sentences
      const summaryLength = Math.min(3, Math.ceil(sentences.length / 3));
      const summary = sentences
        .slice(0, summaryLength)
        .map(s => s.trim())
        .join('. ') + '.';

      // Extract key points (sentences with important keywords)
      const keywordPatterns = [
        /important|key|critical|essential|significant/i,
        /found|discovered|identified|determined/i,
        /recommend|suggest|propose|advise/i
      ];

      const keyPoints = sentences
        .filter(s => keywordPatterns.some(pattern => pattern.test(s)))
        .slice(0, 3)
        .map(s => s.trim());

      // Extract action items (sentences with action verbs)
      const actionPatterns = [
        /need to|should|must|will|going to|plan to/i,
        /action|task|todo|follow up|next step/i
      ];

      const actionItems = sentences
        .filter(s => actionPatterns.some(pattern => pattern.test(s)))
        .slice(0, 3)
        .map(s => s.trim());

      logger.info('Fallback summary generated', {
        summaryLength: summary.length,
        keyPointsCount: keyPoints.length,
        actionItemsCount: actionItems.length
      });

      return {
        summary,
        keyPoints,
        actionItems
      };
    } catch (error) {
      logger.error('Fallback summary generation failed', error);
      return {
        summary: '',
        keyPoints: [],
        actionItems: []
      };
    }
  }
}

export const summaryService = new SummaryService();
