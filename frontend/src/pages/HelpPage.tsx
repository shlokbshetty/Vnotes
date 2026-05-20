import { useState } from 'react';
import Sidebar from '../components/Sidebar';

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
      answer: 'Your audio files are stored locally on the server in the backend/uploads directory. Each file is saved with a timestamp-prefixed filename to ensure uniqueness and easy organization.'
    },
    {
      id: 2,
      question: 'Why is there no transcription feature yet?',
      answer: 'Transcription is coming soon! We\'re working on integrating speech-to-text capabilities to automatically convert your audio recordings into text. Stay tuned for updates.'
    },
    {
      id: 3,
      question: 'Can I delete recordings?',
      answer: 'Yes! You can delete any recording from the History page by clicking the delete button on the recording card. The audio file will be permanently removed from the server.'
    },
    {
      id: 4,
      question: 'What audio formats are supported?',
      answer: 'VNotes currently supports WAV format for recording. The audio is captured directly from your microphone and saved in high quality.'
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <>
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        <div className="p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full pb-32">
          {/* Page Header */}
          <section className="space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">How to use VNotes</h1>
            <p className="text-body-md text-on-surface-variant">Learn how to record, save, and manage your audio notes</p>
          </section>

          {/* Usage Guide Section */}
          <section className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">Getting Started</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface">Start Recording</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Click the microphone icon in the sidebar to go to the Recordings page. Press the red record button to start capturing your audio. Make sure your microphone is connected and permissions are granted.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">mic</span>
                  <span className="text-body-sm font-medium">Recording Page</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface">Stop to Save</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  When you're done recording, click the stop button. Your audio will be automatically uploaded and saved to the server. You'll see a confirmation message when the save is complete.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">stop_circle</span>
                  <span className="text-body-sm font-medium">Auto-Save</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface">Go to History</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Navigate to the History page by clicking the history icon in the sidebar. Here you'll see all your saved recordings with their metadata including file size, type, and creation date.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">history</span>
                  <span className="text-body-sm font-medium">History Page</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <h3 className="font-label-lg text-label-lg text-on-surface">Click to Play</h3>
                </div>
                <p className="text-body-md text-on-surface-variant">
                  Select any recording from the History page to play it. Use the built-in audio player controls to play, pause, adjust volume, and seek through your recording.
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">play_circle</span>
                  <span className="text-body-sm font-medium">Audio Player</span>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface">Frequently Asked Questions</h2>
            
            <div className="space-y-3">
              {faqItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-surface border border-outline-variant rounded-xl overflow-hidden note-card-shadow"
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container-high transition-all"
                  >
                    <h3 className="font-label-lg text-label-lg text-on-surface text-left">
                      {item.question}
                    </h3>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${
                      expandedFAQ === item.id ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  </button>
                  
                  {expandedFAQ === item.id && (
                    <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low">
                      <p className="text-body-md text-on-surface-variant">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-primary-container border border-primary rounded-xl p-6 space-y-3">
            <h2 className="font-label-lg text-label-lg text-on-primary-container flex items-center gap-2">
              <span className="material-symbols-outlined">lightbulb</span>
              Pro Tips
            </h2>
            <ul className="space-y-2 text-body-sm text-on-primary-container">
              <li className="flex gap-3">
                <span className="text-on-primary-container">•</span>
                <span>Use descriptive names for your recordings to easily find them later</span>
              </li>
              <li className="flex gap-3">
                <span className="text-on-primary-container">•</span>
                <span>Check your microphone permissions if you can't start recording</span>
              </li>
              <li className="flex gap-3">
                <span className="text-on-primary-container">•</span>
                <span>Recordings are stored locally on your server for privacy and quick access</span>
              </li>
              <li className="flex gap-3">
                <span className="text-on-primary-container">•</span>
                <span>You can delete recordings anytime from the History page</span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
};

export default HelpPage;
