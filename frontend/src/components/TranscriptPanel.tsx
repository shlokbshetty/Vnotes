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

  // Auto-transcribe when recording changes
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
      console.error('Transcription error:', error);
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
      <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-[2rem] border-outline-variant shadow-sm overflow-hidden rounded-none border-l">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
          <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Transcript & Insights</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-surface-container-lowest">
          <div className="text-center space-y-3">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl block">description</span>
            <p className="text-body-md text-on-surface-variant">Select or record an audio file to view transcription</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-[2rem] border-outline-variant shadow-sm overflow-hidden rounded-none border-l">
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Transcript & Insights</h2>
        <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded uppercase">
          {currentRecording.originalName}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
        {/* Error Message */}
        {transcriptionError && (
          <div className="p-4 rounded-xl border border-error bg-error-container">
            <p className="text-body-sm text-on-error-container">
              {transcriptionError}
            </p>
          </div>
        )}

        {/* Transcription Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">transcribe</span>
              Transcription
            </h3>
            {!hasTranscription && !isTranscribing && (
              <button
                onClick={handleTranscribe}
                className="px-3 py-1 bg-primary text-on-primary rounded-lg text-[12px] font-bold hover:opacity-90 transition-all"
              >
                Transcribe
              </button>
            )}
            {isTranscribing && (
              <span className="text-[12px] text-on-surface-variant animate-pulse">Transcribing...</span>
            )}
          </div>
          
          {hasTranscription ? (
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-high">
              <p className="font-transcription-text text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {currentRecording.transcription}
              </p>
            </div>
          ) : isTranscribing ? (
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-high">
              <p className="text-body-md text-on-surface-variant italic">
                Transcribing audio... This may take a moment.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-high">
              <p className="text-body-md text-on-surface-variant italic">
                No transcription available for this recording
              </p>
            </div>
          )}
        </section>

        {/* Summary Section */}
        {hasSummary && (
          <section className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">summarize</span>
              Summary
            </h3>
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-high">
              <p className="font-transcription-text text-body-md text-on-surface leading-relaxed">
                {currentRecording.summary}
              </p>
            </div>
          </section>
        )}

        {/* Key Points Section */}
        {hasKeyPoints && (
          <section className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">lightbulb</span>
              Key Points
            </h3>
            <div className="space-y-2">
              {currentRecording.keyPoints.map((point, index) => (
                <div key={index} className="p-3 rounded-lg border border-outline-variant bg-surface-container-high flex gap-3">
                  <span className="text-primary font-bold text-sm flex-shrink-0">{index + 1}</span>
                  <p className="text-body-sm text-on-surface">{point}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Items Section */}
        {hasActionItems && (
          <section className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">task_alt</span>
              Action Items
            </h3>
            <div className="space-y-2">
              {currentRecording.actionItems.map((item, index) => (
                <div key={index} className="p-3 rounded-lg border border-outline-variant bg-surface-container-high flex gap-3">
                  <input type="checkbox" className="w-5 h-5 rounded border-outline-variant flex-shrink-0" />
                  <p className="text-body-sm text-on-surface">{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Moments Section */}
        {hasKeyMoments && (
          <section className="space-y-3">
            <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined">bookmark</span>
              Key Moments
            </h3>
            <div className="space-y-2">
              {currentRecording.keyMoments.map((moment, index) => (
                <button
                  key={index}
                  className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-high hover:bg-surface-container-highest transition-all text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary font-mono text-sm">{moment.time}</span>
                    <p className="text-body-sm text-on-surface">{moment.label}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    play_circle
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!hasTranscription && !hasSummary && !hasKeyPoints && !hasActionItems && !hasKeyMoments && !isTranscribing && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-3">info</span>
            <p className="text-body-md text-on-surface-variant">
              No insights available yet. Transcription and AI analysis will appear here.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-surface-container border-t border-outline-variant">
        <button className="w-full py-3 bg-surface-container-high border border-outline-variant rounded-xl font-label-sm text-label-sm text-on-surface flex items-center justify-center gap-2 hover:bg-surface-variant transition-all disabled:opacity-50"
          disabled={!hasTranscription}>
          <span className="material-symbols-outlined">download</span>
          Export Transcript
        </button>
      </div>
    </div>
  );
};

export default TranscriptPanel;