/**
 * Transcript Panel - Editorial Design
 * Minimalist interface for transcription and AI insights
 */

import { Recording } from '../types';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface TranscriptPanelProps {
  recording?: Recording | null;
}

const TranscriptPanel = ({ recording }: TranscriptPanelProps) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(recording || null);

  useEffect(() => {
    setCurrentRecording(recording || null);
    setTranscriptionError(null);
    
    if (recording && !recording.transcription) {
      handleTranscribe();
    }
  }, [recording?.id]);

  const handleTranscribe = async () => {
    if (!currentRecording) return;

    try {
      setIsTranscribing(true);
      setTranscriptionError(null);
      const updated = await apiService.transcribeRecording(currentRecording.id);
      setCurrentRecording(updated);
    } catch (error: any) {
      setTranscriptionError(error.message || 'Failed to transcribe recording');
    } finally {
      setIsTranscribing(false);
    }
  };

  const hasTranscription = currentRecording?.transcription && currentRecording.transcription.trim().length > 0;
  const hasSummary = currentRecording?.summary && currentRecording.summary.trim().length > 0;
  const hasKeyPoints = currentRecording?.keyPoints && currentRecording.keyPoints.length > 0;
  const hasActionItems = currentRecording?.actionItems && currentRecording.actionItems.length > 0;
  const hasKeyMoments = currentRecording?.keyMoments && currentRecording.keyMoments.length > 0;

  if (!currentRecording) {
    return (
      <div className="flex-1 flex flex-col bg-neutral-900 border-l border-neutral-800 rounded-none">
        <div className="p-lg border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-2xl font-display font-bold text-neutral-50">Transcript</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-md px-lg">
            <span className="material-symbols-outlined text-neutral-600 text-5xl block">description</span>
            <p className="text-neutral-400 text-sm">Select a recording to view the transcript</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-neutral-900 border-l border-neutral-800 rounded-none">
      {/* Header */}
      <div className="p-lg border-b border-neutral-800 flex justify-between items-center">
        <h2 className="text-lg font-display font-semibold text-neutral-50">Transcript</h2>
        <span className="px-md py-xs bg-neutral-800 text-neutral-300 text-xs font-mono rounded">
          {currentRecording.originalName.slice(0, 20)}...
        </span>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-lg space-y-lg">
        {/* Error */}
        {transcriptionError && (
          <div className="p-md bg-error bg-opacity-10 border border-error border-opacity-30 rounded-lg">
            <p className="text-error text-sm">{transcriptionError}</p>
          </div>
        )}

        {/* Transcription */}
        <section>
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-semibold text-neutral-100 text-sm flex items-center gap-md">
              <span className="material-symbols-outlined text-base">transcribe</span>
              Transcription
            </h3>
            {!hasTranscription && !isTranscribing && (
              <button
                onClick={handleTranscribe}
                className="px-md py-xs bg-accent-600 text-neutral-50 rounded text-xs font-medium hover:bg-accent-700 transition-smooth"
              >
                Transcribe
              </button>
            )}
            {isTranscribing && (
              <span className="text-xs text-neutral-500 animate-pulse">Transcribing...</span>
            )}
          </div>
          
          {hasTranscription ? (
            <div className="p-md bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                {currentRecording.transcription}
              </p>
            </div>
          ) : isTranscribing ? (
            <div className="p-md bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-400 text-sm italic">Transcribing... This may take a moment.</p>
            </div>
          ) : (
            <div className="p-md bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-400 text-sm italic">No transcription available</p>
            </div>
          )}
        </section>

        {/* Summary */}
        {hasSummary && (
          <section>
            <h3 className="font-semibold text-neutral-100 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">summarize</span>
              Summary
            </h3>
            <div className="p-md bg-neutral-800 rounded-lg border border-neutral-700">
              <p className="text-neutral-200 text-sm leading-relaxed">
                {currentRecording.summary}
              </p>
            </div>
          </section>
        )}

        {/* Key Points */}
        {hasKeyPoints && (
          <section>
            <h3 className="font-semibold text-neutral-100 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              Key Points
            </h3>
            <div className="space-y-xs">
              {currentRecording.keyPoints?.map((point, index) => (
                <div key={index} className="p-md bg-neutral-800 rounded-lg border border-neutral-700 flex gap-md">
                  <span className="text-accent-400 font-semibold text-xs flex-shrink-0 flex items-center">{index + 1}</span>
                  <p className="text-neutral-300 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Items */}
        {hasActionItems && (
          <section>
            <h3 className="font-semibold text-neutral-100 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">task_alt</span>
              Action Items
            </h3>
            <div className="space-y-xs">
              {currentRecording.actionItems?.map((item, index) => (
                <div key={index} className="p-md bg-neutral-800 rounded-lg border border-neutral-700 flex gap-md items-start">
                  <input type="checkbox" className="w-4 h-4 rounded border-neutral-600 flex-shrink-0 mt-xs accent-accent-600" />
                  <p className="text-neutral-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Moments */}
        {hasKeyMoments && (
          <section>
            <h3 className="font-semibold text-neutral-100 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">bookmark</span>
              Key Moments
            </h3>
            <div className="space-y-xs">
              {currentRecording.keyMoments?.map((moment, index) => (
                <button
                  key={index}
                  className="w-full p-md bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-750 transition-smooth text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-md">
                    <span className="text-accent-400 font-mono text-xs">{moment.time}</span>
                    <p className="text-neutral-300 text-sm">{moment.label}</p>
                  </div>
                  <span className="material-symbols-outlined text-neutral-600 group-hover:text-accent-400 transition-smooth text-base">
                    play_circle
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasTranscription && !hasSummary && !hasKeyPoints && !hasActionItems && !hasKeyMoments && !isTranscribing && (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <span className="material-symbols-outlined text-neutral-700 text-5xl mb-md">info</span>
            <p className="text-neutral-400 text-sm">
              No insights available yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;
