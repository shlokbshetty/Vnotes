import Sidebar from '../components/Sidebar';
import RecordingCard from '../components/RecordingCard';
import { Recording } from '../types';

const LibraryPage = () => {
  const recordings: Recording[] = [
    {
      id: '1',
      title: 'Weekly Sync - Product & Engineering',
      date: 'Oct 24, 2023',
      duration: '45:12',
      category: 'Sync',
      transcript: '...the primary focus for this sprint will be the refactoring of the notification service to improve latency issues observed last week...',
      icon: 'audio_file'
    },
    {
      id: '2',
      title: 'Product Design Review: Q4 Roadmap',
      date: 'Oct 23, 2023',
      duration: '28:05',
      category: 'Design',
      transcript: '...user feedback suggests we need more emphasis on the accessibility of the dashboard widgets, particularly the color contrast for dark mode...',
      icon: 'brush'
    },
    {
      id: '3',
      title: 'Marketing Strategy Brainstorm',
      date: 'Oct 22, 2023',
      duration: '52:40',
      category: 'Marketing',
      transcript: '...exploring influencer partnerships for the holiday season to target the Gen Z demographic through short-form video content...',
      icon: 'campaign'
    },
    {
      id: '4',
      title: '1-on-1: Alex & Sarah',
      date: 'Oct 21, 2023',
      duration: '15:00',
      category: 'Personal',
      transcript: '...discussion regarding professional development goals for the upcoming quarter and potential internal certification programs...',
      icon: 'person'
    }
  ];

  return (
    <>
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0">
        <div className="p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full pb-32">
          {/* Filters & Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Total Storage</p>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  12.4 GB <span className="text-body-md font-normal text-on-surface-variant">/ 50 GB</span>
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-2 hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  Filter
                </button>
                <button className="px-4 py-2 border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-2 hover:bg-surface-container transition-all">
                  <span className="material-symbols-outlined text-[20px]">sort</span>
                  Newest First
                </button>
              </div>
            </div>
            
            <div className="md:col-span-4 bg-primary text-on-primary p-6 rounded-xl border border-outline-variant note-card-shadow flex flex-col justify-center">
              <p className="font-label-sm text-label-sm opacity-80 mb-1 uppercase">Active Recording</p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile font-bold">None currently</h3>
              </div>
            </div>
          </section>

          {/* Recordings Grid */}
          <section className="grid grid-cols-1 gap-8">
            {recordings.map(recording => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </section>

          {/* Pagination */}
          <footer className="flex items-center justify-between pt-stack-lg">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Showing 4 of 42 recordings</p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all disabled:opacity-20 text-on-surface" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 bg-primary text-on-primary rounded-lg font-bold flex items-center justify-center">1</button>
              <button className="w-10 h-10 border border-outline-variant rounded-lg font-bold flex items-center justify-center hover:bg-surface-container transition-all text-on-surface">2</button>
              <button className="w-10 h-10 border border-outline-variant rounded-lg font-bold flex items-center justify-center hover:bg-surface-container transition-all text-on-surface">3</button>
              <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container transition-all text-on-surface">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </footer>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[60] hover:bg-primary-container">
        <span className="material-symbols-outlined">add</span>
      </button>
    </>
  );
};

export default LibraryPage;