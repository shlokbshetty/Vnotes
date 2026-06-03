/**
 * Help Page - Editorial Design
 * Usage guide and frequently asked questions
 */

import { useState } from 'react';
import AppPageShell from '../components/AppPageShell';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const HelpPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Where are my files stored?',
      answer: 'Your audio files are stored on the backend server in the uploads directory. Each file is saved with a timestamp to ensure uniqueness.'
    },
    {
      id: 2,
      question: 'Why is there no transcription feature yet?',
      answer: 'Transcription is coming soon! We\'re working on integrating speech-to-text capabilities to convert your audio to text automatically.'
    },
    {
      id: 3,
      question: 'Can I delete recordings?',
      answer: 'Yes! You can delete any recording from the Library page by clicking the delete button. The file will be permanently removed.'
    },
    {
      id: 4,
      question: 'What audio formats are supported?',
      answer: 'VNotes currently supports WAV format for recording. Audio is captured from your microphone in high quality.'
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <AppPageShell>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface-0">
        <div className="p-xl max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-2xl">
            <h1 className="text-4xl font-display font-bold text-neutral-50">How to use VNotes</h1>
            <p className="text-neutral-400 mt-sm text-base">Learn how to record, save, and manage your audio notes</p>
          </div>

          {/* Getting Started Section */}
          <section className="mb-2xl">
            <h2 className="text-2xl font-display font-semibold text-neutral-50 mb-lg">Getting Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* Step 1 */}
              <div className="card p-lg border border-neutral-700 hover:border-neutral-600 transition-smooth">
                <div className="flex items-center gap-md mb-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-accent text-sm font-bold text-slate-900">
                    1
                  </div>
                  <h3 className="font-semibold text-neutral-100">Start Recording</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Click the microphone icon in the sidebar. Press the record button to start capturing. Make sure your microphone is connected.
                </p>
              </div>

              {/* Step 2 */}
              <div className="card p-lg border border-neutral-700 hover:border-neutral-600 transition-smooth">
                <div className="flex items-center gap-md mb-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-accent text-sm font-bold text-slate-900">
                    2
                  </div>
                  <h3 className="font-semibold text-neutral-100">Stop to Save</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  When done, click the stop button. Your audio uploads automatically. You'll see a confirmation when complete.
                </p>
              </div>

              {/* Step 3 */}
              <div className="card p-lg border border-neutral-700 hover:border-neutral-600 transition-smooth">
                <div className="flex items-center gap-md mb-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-accent text-sm font-bold text-slate-900">
                    3
                  </div>
                  <h3 className="font-semibold text-neutral-100">Go to Library</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Navigate to the Library to see all your recordings with metadata like file size, type, and date.
                </p>
              </div>

              {/* Step 4 */}
              <div className="card p-lg border border-neutral-700 hover:border-neutral-600 transition-smooth">
                <div className="flex items-center gap-md mb-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-accent text-sm font-bold text-slate-900">
                    4
                  </div>
                  <h3 className="font-semibold text-neutral-100">Play & Manage</h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Select a recording to play it. Use the built-in player to play, pause, and seek through your audio.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-2xl">
            <h2 className="text-2xl font-display font-semibold text-neutral-50 mb-lg">Frequently Asked Questions</h2>
            
            <div className="space-y-sm">
              {faqItems.map((item) => (
                <div 
                  key={item.id}
                  className="card border border-neutral-700 overflow-hidden hover:border-neutral-600 transition-smooth"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-lg py-md flex items-center justify-between hover:bg-neutral-800 transition-smooth"
                  >
                    <h3 className="font-semibold text-neutral-100 text-left text-sm">
                      {item.question}
                    </h3>
                    <span className={`material-symbols-outlined text-neutral-500 transition-transform duration-200 ${
                      expandedFAQ === item.id ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  
                  {expandedFAQ === item.id && (
                    <div className="px-lg py-md border-t border-neutral-700 bg-neutral-800 bg-opacity-50 slide-down">
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pro Tips */}
          <section className="card p-lg bg-accent-600 bg-opacity-10 border border-accent-600 border-opacity-30">
            <h2 className="font-semibold text-accent-400 text-sm mb-md flex items-center gap-md">
              <span className="material-symbols-outlined text-base">lightbulb</span>
              Pro Tips
            </h2>
            <ul className="space-y-sm text-accent-200 text-sm">
              <li className="flex gap-md">
                <span className="flex-shrink-0">•</span>
                <span>Use descriptive names for easy searching later</span>
              </li>
              <li className="flex gap-md">
                <span className="flex-shrink-0">•</span>
                <span>Check microphone permissions if recording won't start</span>
              </li>
              <li className="flex gap-md">
                <span className="flex-shrink-0">•</span>
                <span>Recordings are stored locally for privacy</span>
              </li>
              <li className="flex gap-md">
                <span className="flex-shrink-0">•</span>
                <span>Delete recordings anytime from the Library</span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </AppPageShell>
  );
};

export default HelpPage;
