import React, { useState } from 'react';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordingTitle?: string;
}

export default function ShareExportModal({ isOpen, onClose, recordingTitle = 'Active Recording' }: ShareExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'txt' | 'json'>('pdf');
  const [includeSpeakerLabels, setIncludeSpeakerLabels] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSuccess(true);
    setInviteEmail('');
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" 
      id="modal-backdrop"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'modal-backdrop') {
          onClose();
        }
      }}
    >
      <div 
        className="bg-surface-container-low border border-white/10 w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col text-on-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
            </div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">Share &amp; Export</h2>
          </div>
          <button 
            className="text-on-surface-variant hover:text-on-surface transition-colors" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Section: Collaboration */}
          <div className="p-6 border-r border-white/10 bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <label className="text-label-mono font-label-mono text-primary mb-4 block font-bold tracking-widest">COLLABORATE</label>
              
              <form onSubmit={handleInvite} className="relative mb-6">
                <input 
                  className="w-full bg-surface-container border-b border-outline-variant focus:border-primary transition-all px-3 py-2 text-body-md outline-none rounded-t-lg text-on-surface placeholder:text-outline/50" 
                  placeholder="Invite by email..." 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 bg-primary text-on-primary text-label-mono font-label-mono rounded-lg hover:opacity-90 transition-opacity"
                >
                  Invite
                </button>
              </form>

              {inviteSuccess && (
                <p className="text-xs text-tertiary mb-3 animate-pulse">✓ Invitation sent successfully!</p>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-on-surface">Alex Rivera</p>
                      <p className="text-[10px] text-on-surface-variant font-label-mono uppercase tracking-widest">Owner</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant border border-white/10 flex items-center justify-center text-primary font-bold text-xs">
                      SC
                    </div>
                    <div>
                      <p className="text-body-md text-on-surface">Sarah Chen</p>
                      <p className="text-[10px] text-on-surface-variant font-label-mono uppercase">Can edit</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm cursor-pointer hover:text-on-surface">expand_more</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6">
              <button 
                type="button"
                onClick={() => alert('Link copied to clipboard!')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:border-primary transition-all text-on-surface group bg-surface-container-high/50"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">link</span>
                  <div className="text-left">
                    <p className="text-label-mono font-label-mono text-primary leading-none font-bold">Get shareable link</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">Anyone with the link can view</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Right Section: Export Formats */}
          <div className="p-6 flex flex-col bg-surface-container-low justify-between">
            <div>
              <label className="text-label-mono font-label-mono text-primary mb-4 block font-bold tracking-widest">EXPORT DOCUMENT</label>
              <div className="grid grid-cols-1 gap-3">
                {/* PDF Option */}
                <button 
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all group relative overflow-hidden text-left ${
                    selectedFormat === 'pdf' ? 'bg-surface-container-high border-primary/40' : 'bg-surface-container border-white/5 hover:border-primary/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                  <div>
                    <h4 className="font-headline-sm text-body-lg text-on-surface font-semibold">PDF Document</h4>
                    <p className="text-on-surface-variant text-xs">Formatted with waveform visual</p>
                  </div>
                </button>

                {/* TXT Option */}
                <button 
                  type="button"
                  onClick={() => setSelectedFormat('txt')}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all group relative overflow-hidden text-left ${
                    selectedFormat === 'txt' ? 'bg-surface-container-high border-primary/40' : 'bg-surface-container border-white/5 hover:border-primary/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-tertiary text-3xl">description</span>
                  <div>
                    <h4 className="font-headline-sm text-body-lg text-on-surface font-semibold">Plain Text</h4>
                    <p className="text-on-surface-variant text-xs">Clean transcript only (.txt)</p>
                  </div>
                </button>

                {/* JSON Option */}
                <button 
                  type="button"
                  onClick={() => setSelectedFormat('json')}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all group relative overflow-hidden text-left ${
                    selectedFormat === 'json' ? 'bg-surface-container-high border-primary/40' : 'bg-surface-container border-white/5 hover:border-primary/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="material-symbols-outlined text-primary text-3xl">data_object</span>
                  <div>
                    <h4 className="font-headline-sm text-body-lg text-on-surface font-semibold">Developer JSON</h4>
                    <p className="text-on-surface-variant text-xs">Metadata &amp; raw audio markers</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div 
                  onClick={() => setIncludeSpeakerLabels(!includeSpeakerLabels)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors relative flex items-center ${
                    includeSpeakerLabels ? 'bg-primary' : 'bg-surface-container-highest'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${includeSpeakerLabels ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className="text-body-md text-on-surface-variant">Include Speaker Labels</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-surface-container-highest flex items-center justify-between border-t border-white/10">
          <p className="text-[11px] text-on-surface-variant font-label-mono uppercase tracking-wider">Ready to Download</p>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-label-mono font-label-mono border border-outline-variant rounded-lg hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                alert(`Downloading ${recordingTitle}.${selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'txt' ? 'txt' : 'json'} (Speaker Labels: ${includeSpeakerLabels ? 'ON' : 'OFF'})`);
                onClose();
              }}
              className="px-6 py-2 bg-primary text-on-primary font-headline-sm text-body-md rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95 font-bold"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
