import { Recording } from '../types';

interface TranscriptPanelProps {
  recording?: Recording | null;
}

const TranscriptPanel = ({ recording }: TranscriptPanelProps) => {
  const hasTranscription = recording?.transcription && recording.transcription.trim().length > 0;
  const hasSummary = recording?.summary && recording.summary.trim().length > 0;
  const hasKeyPoints = recording?.keyPoints && recording.keyPoints.length > 0;
  const hasActionItems = recording?.actionItems && recording.actionItems.length > 0;
  const hasKeyMoments = recording?.keyMoments && recording.keyMoments.length > 0;

  if (!recording) {
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
          {recording.originalName}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
        {/* Transcription Section */}
        <section className="space-y-3">
          <h3 className="font-label-lg text-label-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined">transcribe</span>
            Transcription
          </h3>
          
          {hasTranscription ? (
            <div className="p-4 rounded-xl border border-outline-variant bg-surface-container-high">
              <p className="font-transcription-text text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
                {recording.transcription}
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
                {recording.summary}
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
              {recording.keyPoints.map((point, index) => (
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
              {recording.actionItems.map((item, index) => (
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
              {recording.keyMoments.map((moment, index) => (
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
        {!hasTranscription && !hasSummary && !hasKeyPoints && !hasActionItems && !hasKeyMoments && (
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