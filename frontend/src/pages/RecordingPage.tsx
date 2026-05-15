import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import RecordingControls from '../components/RecordingControls';
import TranscriptPanel from '../components/TranscriptPanel';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [time, setTime] = useState(765); // 12:45 in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTime(0);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex overflow-hidden bg-background h-full">
          <RecordingControls 
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            time={time}
          />
          <TranscriptPanel />
        </div>
      </main>

      {/* Background Decoration Elements */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none z-[-1]"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none z-[-1]"></div>
    </>
  );
};

export default RecordingPage;