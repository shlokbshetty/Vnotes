import React, { useState, useMemo } from 'react';
import RichEditor from './RichEditor';
import ShareExportModal from '../ShareExportModal';
import './EditorPanel.css';

export interface Recording {
  id: string;
  title: string;
  content: string;
  date: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  isRecording: boolean;
  tags?: string[];
}

interface EditorPanelProps {
  recording: Recording;
  onUpdate: (recording: Partial<Recording>) => void;
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
}

// LCG pseudo-random heights for a given recording ID
const getWaveformHeights = (id: string, count: number): number[] => {
  const heights: number[] = [];
  let seed = 0;
  const stringId = id || 'default_seed';
  for (let c = 0; c < stringId.length; c++) {
    seed += stringId.charCodeAt(c);
  }
  
  for (let i = 0; i < count; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    heights.push(Math.floor(rnd * 70 + 20)); // heights between 20% and 90%
  }
  return heights;
};

const EditorPanel: React.FC<EditorPanelProps> = ({
  recording,
  onUpdate,
  onPlayPause,
  onSeek,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'transcript' | 'insights'>('editor');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [editingTitle, setEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(recording.title);

  // Sync title with prop
  React.useEffect(() => {
    setLocalTitle(recording.title);
  }, [recording.title]);

  const waveformHeights = useMemo(() => {
    return getWaveformHeights(recording.id, 120);
  }, [recording.id]);

  const handleTitleSubmit = () => {
    setEditingTitle(false);
    if (localTitle.trim() && localTitle !== recording.title) {
      onUpdate({ title: localTitle.trim() });
    }
  };

  const handleContentChange = (newContent: string) => {
    onUpdate({ content: newContent });
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (recording.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    onSeek(percent * recording.duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playheadPercent = recording.duration > 0 
    ? (recording.currentTime / recording.duration) * 100 
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-on-surface overflow-hidden">
      {/* Top Header App Bar */}
      <header className="flex justify-between items-center w-full px-8 h-16 bg-surface border-b border-white/10 shrink-0 select-none">
        <div className="flex items-center gap-6 flex-1">
          {/* Smart Search Bar */}
          <div className="relative w-60 group hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
            <input 
              className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary rounded-lg pl-9 text-body-md placeholder:text-on-surface-variant/40 h-9 transition-all text-on-surface outline-none" 
              placeholder="Search in note..." 
              type="text"
            />
          </div>
          
          {/* Tab Navigation links */}
          <nav className="flex items-center gap-6 md:ml-6" aria-label="Editor views">
            <button 
              onClick={() => setActiveTab('editor')}
              className={`pb-4 pt-4 border-b-2 font-body-md transition-all ${
                activeTab === 'editor' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              Editor
            </button>
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`pb-4 pt-4 border-b-2 font-body-md transition-all ${
                activeTab === 'transcript' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              Transcript
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`pb-4 pt-4 border-b-2 font-body-md transition-all ${
                activeTab === 'insights' ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              Insights
            </button>
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
              <span className="material-symbols-outlined text-xl">history</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all">
              <span className="material-symbols-outlined text-xl">more_vert</span>
            </button>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-1.5 border border-outline-variant text-primary rounded-lg text-label-mono font-bold hover:bg-surface-container-highest transition-all"
          >
            Export
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-label-mono font-bold hover:opacity-95 transition-all"
          >
            Share
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-w-0">
        
        {/* Waveform Header Section */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-white/5 p-8 pb-6 select-none">
          <div className="flex items-center justify-between mb-6 gap-6">
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setLocalTitle(recording.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="bg-surface-container-low border-b border-primary text-headline-lg font-headline-lg text-on-surface outline-none w-full py-1 rounded"
                  autoFocus
                />
              ) : (
                <h1 
                  onClick={() => setEditingTitle(true)}
                  className="text-headline-lg font-headline-lg text-on-surface mb-2 truncate cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  {recording.title}
                  <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                </h1>
              )}
              
              <div className="flex items-center gap-4 text-on-surface-variant">
                <span className="flex items-center gap-1.5 text-label-mono"><span className="material-symbols-outlined text-sm">calendar_today</span> {recording.date || 'Oct 17, 2026'}</span>
                <span className="flex items-center gap-1.5 text-label-mono"><span className="material-symbols-outlined text-sm">schedule</span> {formatTime(recording.currentTime)} / {formatTime(recording.duration)}</span>
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span className="text-[10px] font-label-mono uppercase tracking-widest text-tertiary">Transcript Ready</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button className="p-3 bg-surface-container-high rounded-full border border-white/5 hover:bg-surface-variant hover:text-primary transition-all">
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
              </button>
              <button className="p-3 bg-surface-container-high rounded-full border border-white/5 hover:bg-surface-variant hover:text-secondary transition-all">
                <span className="material-symbols-outlined text-[18px]">content_cut</span>
              </button>
            </div>
          </div>

          {/* High-Fidelity Waveform Visual */}
          <div 
            data-testid="waveform-player"
            className="h-20 flex items-end gap-[2px] w-full px-2 cursor-pointer relative" 
            onClick={handleWaveformClick}
          >
            {/* Played Scrubber Fill Overlay */}
            <div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none border-r border-primary/40" 
              style={{ width: `${playheadPercent}%` }}
            />
            {waveformHeights.map((height, i) => {
              const barPercent = (i / 120) * 100;
              const isPlayed = barPercent <= playheadPercent;
              const isCurrent = Math.abs(barPercent - playheadPercent) < 0.8;
              
              return (
                <div 
                  key={i}
                  className={`waveform-bar flex-1 ${
                    isPlayed ? 'bg-primary' : 'bg-outline-variant opacity-40'
                  } ${isCurrent ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: `${height}%`,
                    boxShadow: isCurrent ? '0 0 8px rgba(183, 196, 255, 0.4)' : undefined
                  }}
                />
              );
            })}
          </div>

          {/* Media Playback Controls row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => onSeek(Math.max(0, recording.currentTime - 10))}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center"
              >
                <span className="material-symbols-outlined text-2xl">replay_10</span>
              </button>
              <button 
                onClick={() => onPlayPause(!recording.isPlaying)}
                className="w-11 h-11 flex items-center justify-center bg-primary text-on-primary rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {recording.isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button 
                onClick={() => onSeek(Math.min(recording.duration, recording.currentTime + 10))}
                className="text-on-surface-variant hover:text-primary transition-all flex items-center"
              >
                <span className="material-symbols-outlined text-2xl">forward_10</span>
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setPlaybackSpeed(prev => prev >= 2.0 ? 0.5 : prev + 0.25)}
                className="text-label-mono text-on-surface-variant hover:text-primary transition-all uppercase tracking-wider font-bold"
              >
                Speed: {playbackSpeed.toFixed(2)}x
              </button>
              
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-base">volume_down</span>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 h-1 bg-white/10 rounded-full appearance-none outline-none accent-primary cursor-pointer"
                />
                <span className="material-symbols-outlined text-on-surface-variant text-base">volume_up</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab specific content layout */}
        <div className="p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col">
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-8 bg-surface-container-low/50 self-start px-4 py-2 rounded-full border border-white/5 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">edit</span>
                <span className="text-label-mono text-[10px] uppercase font-bold tracking-widest">Smart Editor</span>
                <div className="h-3 w-[1px] bg-white/10 mx-2"></div>
                <span className="text-label-mono text-[10px] uppercase font-bold tracking-widest">AI Summarization Enabled</span>
              </div>
              <article className="prose prose-invert prose-p:text-body-lg prose-headings:font-headline-md flex-1 flex flex-col">
                <RichEditor
                  content={recording.content}
                  onContentChange={handleContentChange}
                  placeholder="Start typing your notes here..."
                />
              </article>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-8 pb-12 select-text">
              {recording.content ? (
                <div className="transcript-block group">
                  <div className="flex items-start gap-gutter">
                    <div className="flex flex-col items-center gap-1 w-12 pt-1">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">U</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-stack-md mb-2">
                        <span className="font-bold text-primary font-headline-sm">Speaker 1</span>
                        <span className="text-label-mono font-label-mono text-on-surface-variant opacity-60">00:00</span>
                      </div>
                      <p className="text-body-lg font-body-lg text-on-surface leading-relaxed transition-all cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg whitespace-pre-wrap">
                        {recording.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Standard meeting template to fulfill high aesthetic requirements */}
              <div className="transcript-block group">
                <div className="flex items-start gap-gutter">
                  <div className="flex flex-col items-center gap-1 w-12 pt-1">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">JD</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-stack-md mb-2">
                      <span className="font-bold text-primary font-headline-sm">Jane Doe</span>
                      <span className="text-label-mono font-label-mono text-on-surface-variant opacity-60">00:00:00</span>
                    </div>
                    <p 
                      className="text-body-lg font-body-lg text-on-surface leading-relaxed transition-all cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg"
                      onClick={() => onSeek(0)}
                    >
                      Welcome everyone to the Q4 planning session. Today we need to talk about the "Obsidian" redesign and how it impacts our performance benchmarks. We've seen some drift in the late Q3 metrics, specifically around the voice-to-text latency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="transcript-block group">
                <div className="flex items-start gap-gutter">
                  <div className="flex flex-col items-center gap-1 w-12 pt-1">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">MK</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-stack-md mb-2">
                      <span className="font-bold text-secondary font-headline-sm">Marcus Kane</span>
                      <span className="text-label-mono font-label-mono text-on-surface-variant opacity-60">00:00:18</span>
                    </div>
                    <p 
                      className="text-body-lg font-body-lg text-on-surface leading-relaxed transition-all cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg"
                      onClick={() => onSeek(18)}
                    >
                      Jane, I've looked into those latency spikes. It seems like the waveform rendering engine is competing with the transcription thread on lower-end devices. If we shift the processing to the secondary worker, we should see about a 40% improvement.
                    </p>
                    <p 
                      className="text-body-lg font-body-lg text-on-surface leading-relaxed mt-4 transition-all cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-lg"
                      onClick={() => onSeek(32)}
                    >
                      I've also drafted a new visualization module that uses the same GPU buffer as the text engine. This would keep our "Waveform" aesthetic consistent without sacrificing the speed power users expect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-8 pb-12 select-none">
              {/* Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* AI Executive Summary Card */}
                <div className="md:col-span-8 bg-surface-container-low glass-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <h2 className="text-headline-sm font-headline-sm font-bold">AI Executive Summary</h2>
                  </div>
                  <div className="space-y-4 text-on-surface-variant text-body-lg leading-relaxed">
                    <p>The session centered on the technical hurdles for the Q4 release. Key themes included API stability, the transition to a headless CMS architecture, and the urgent need for enhanced end-to-end testing.</p>
                    <p>Sarah highlighted that the current sprint velocity is 15% behind projections, necessitating a scope re-evaluation for the mobile application. The team agreed to prioritize core functionality over decorative UI enhancements.</p>
                  </div>
                </div>

                {/* Key Action Items checklist Card */}
                <div className="md:col-span-4 bg-surface-container-low glass-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                    <h2 className="text-headline-sm font-headline-sm font-bold">Action Items</h2>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="mt-1 rounded bg-surface border-white/10 text-primary focus:ring-0 focus:ring-offset-0" />
                      <div>
                        <p className="text-body-md font-semibold text-on-surface line-through opacity-50">Finalize API Documentation</p>
                        <p className="text-[10px] text-on-surface-variant/50 font-label-mono mt-0.5">Assign: @Mark • Due: Friday</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" className="mt-1 rounded bg-surface border-white/10 text-primary focus:ring-0 focus:ring-offset-0" />
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">Submit Budget for Tester</p>
                        <p className="text-[10px] text-on-surface-variant font-label-mono mt-0.5">Assign: @Sarah • Due: Oct 28</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" className="mt-1 rounded bg-surface border-white/10 text-primary focus:ring-0 focus:ring-offset-0" />
                      <div>
                        <p className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">Deprioritize Safari Support</p>
                        <p className="text-[10px] text-on-surface-variant font-label-mono mt-0.5">Team Decision</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Sentiment Analysis chart Card */}
                <div className="md:col-span-7 bg-surface-container-low glass-border rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                      <h2 className="text-headline-sm font-headline-sm font-bold">Sentiment &amp; Engagement</h2>
                    </div>
                    <div className="text-[10px] font-label-mono text-on-surface-variant px-3 py-1 bg-surface-container rounded-lg">Overall: Constructive</div>
                  </div>
                  
                  {/* Decorative chart bars */}
                  <div className="h-28 flex items-end justify-between gap-1.5 pt-2">
                    <div className="flex-1 bg-primary/20 h-1/2 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/40 h-2/3 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/60 h-3/4 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/80 h-1/2 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary h-full rounded-t-sm transition-all" style={{ boxShadow: '0 0 10px rgba(183,196,255,0.3)' }} />
                    <div className="flex-1 bg-secondary/80 h-2/3 rounded-t-sm transition-all hover:bg-secondary" />
                    <div className="flex-1 bg-secondary/40 h-1/3 rounded-t-sm transition-all hover:bg-secondary" />
                    <div className="flex-1 bg-primary/60 h-2/3 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary h-3/4 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/20 h-1/4 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/60 h-1/2 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/80 h-3/4 rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-secondary/80 h-2/3 rounded-t-sm transition-all hover:bg-secondary" />
                    <div className="flex-1 bg-primary/60 h-full rounded-t-sm transition-all hover:bg-primary" />
                    <div className="flex-1 bg-primary/40 h-1/2 rounded-t-sm transition-all hover:bg-primary" />
                  </div>
                  <div className="flex justify-between mt-3 text-[9px] font-label-mono text-on-surface-variant opacity-50 uppercase tracking-widest">
                    <span>00:00</span>
                    <span>10:00</span>
                    <span>20:00</span>
                    <span>{formatTime(recording.duration)}</span>
                  </div>
                </div>

                {/* Topic Distribution progress bars Card */}
                <div className="md:col-span-5 bg-surface-container-low glass-border rounded-xl p-6">
                  <h2 className="text-headline-sm font-headline-sm font-bold mb-4">Topic Distribution</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-body-md font-semibold mb-1">
                        <span>Technical Architecture</span>
                        <span className="text-primary font-label-mono text-xs">45%</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-body-md font-semibold mb-1">
                        <span>Budget &amp; Resources</span>
                        <span className="text-secondary font-label-mono text-xs">30%</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-body-md font-semibold mb-1">
                        <span>Timeline &amp; Risks</span>
                        <span className="text-tertiary font-label-mono text-xs">25%</span>
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Quotes Extracted carousel block */}
              <div className="bg-surface-container-low glass-border rounded-xl p-6">
                <h2 className="text-headline-sm font-headline-sm font-bold mb-6">Key Quotes Extract</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container rounded-lg border-l-2 border-primary italic text-body-lg text-on-surface-variant leading-relaxed">
                    "The transition to headless is non-negotiable if we want to scale the AI Insights module next year."
                    <div className="mt-2 text-label-mono not-italic text-primary font-bold">— Mark, CTO</div>
                  </div>
                  <div className="p-4 bg-surface-container rounded-lg border-l-2 border-secondary italic text-body-lg text-on-surface-variant leading-relaxed">
                    "If we don't hire another QA engineer by next month, the November 15th date is effectively a hallucination."
                    <div className="mt-2 text-label-mono not-italic text-secondary font-bold">— Sarah, PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share & Export Modal */}
      <ShareExportModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        recordingTitle={recording.title}
      />
    </div>
  );
};

export default EditorPanel;
