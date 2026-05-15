import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RecordingCard from '../components/RecordingCard';
import { Recording } from '../types';

const LibraryPage = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/recordings');
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      setError('Failed to load recordings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecording = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/recordings/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh the recordings list
        fetchRecordings();
      } else {
        throw new Error('Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      alert('Failed to delete recording. Please try again.');
    }
  };

  return (
    <>
      <Sidebar />
      
      <main className="flex-grow flex flex-col min-w-0">
        <div className="p-margin-desktop space-y-stack-lg max-w-container-max mx-auto w-full pb-32">
          {/* Filters & Stats Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 bg-surface p-6 rounded-xl border border-outline-variant note-card-shadow flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">Total Recordings</p>
                <h3 className="font-headline-lg text-headline-lg text-primary">
                  {recordings.length} <span className="text-body-md font-normal text-on-surface-variant">recordings</span>
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchRecordings}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface flex items-center gap-2 hover:bg-surface-container transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                  Refresh
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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-on-surface-variant">Loading recordings...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-error mb-4">{error}</p>
                <button 
                  onClick={fetchRecordings}
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">mic_off</span>
                <p className="text-on-surface-variant text-lg mb-2">No recordings yet</p>
                <p className="text-on-surface-variant">Start recording to see your audio files here</p>
              </div>
            ) : (
              recordings.map(recording => (
                <RecordingCard 
                  key={recording.id} 
                  recording={recording} 
                  onDelete={handleDeleteRecording}
                />
              ))
            )}
          </section>
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