const TranscriptPanel = () => {
  const transcriptData = [
    {
      speaker: "Alex Chen",
      time: "12:41:05",
      text: "I think we should double down on the mobile experience for the Q3 roadmap. The engagement metrics are showing a clear shift towards on-the-go usage.",
      isUser: true
    },
    {
      speaker: "Sarah Miller",
      time: "12:41:22",
      text: "Agreed. Especially with the new offline recording feature we just launched. We're seeing more activity during commute hours.",
      isUser: false
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest rounded-[2rem] border-outline-variant shadow-sm overflow-hidden rounded-none border-l">
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Live Transcript</h2>
        <span className="px-2 py-1 bg-primary text-background text-[10px] font-bold rounded uppercase">Real-Time</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-container-lowest">
        {transcriptData.map((item, index) => (
          <div key={index} className={`flex flex-col gap-2 ${!item.isUser ? 'items-end' : ''}`}>
            <div className={`flex items-center gap-2 ${!item.isUser ? 'flex-row-reverse' : ''}`}>
              <span className={`font-label-sm text-label-sm ${item.isUser ? 'text-primary' : 'text-primary/80'}`}>
                {item.speaker}
              </span>
              <span className="text-[10px] text-outline">{item.time}</span>
            </div>
            <div className={`p-4 rounded-2xl border border-outline-variant/30 ${
              item.isUser 
                ? 'bg-surface-container-high rounded-tl-none' 
                : 'bg-surface-container-highest rounded-tr-none'
            }`}>
              <p className="font-transcription-text text-transcription-text text-on-surface">
                {item.text}
              </p>
            </div>
          </div>
        ))}

        {/* AI Key Point Highlight */}
        <div className="bg-surface-container-high border-l-4 border-primary p-4 rounded-r-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            <span className="font-label-sm text-label-sm text-on-surface">AI Suggested Highlight</span>
          </div>
          <p className="font-transcription-text text-sm text-on-surface-variant italic">
            Potential Project Goal: "Mobile Experience Prioritization for Q3 Roadmap"
          </p>
        </div>

        {/* Live stream placeholder */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-primary">Alex Chen</span>
            <span className="text-[10px] text-outline">12:44:58</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-xs text-on-surface-variant italic ml-2">Transcribing...</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-surface-container border-t border-outline-variant">
        <button className="w-full py-3 bg-surface-container-high border border-outline-variant rounded-xl font-label-sm text-label-sm text-on-surface flex items-center justify-center gap-2 hover:bg-surface-variant transition-all">
          <span className="material-symbols-outlined">download</span>
          Export Live Snippet
        </button>
      </div>
    </div>
  );
};

export default TranscriptPanel;