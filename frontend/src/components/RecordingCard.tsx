import { Recording } from '../types';

interface RecordingCardProps {
  recording: Recording;
}

const RecordingCard = ({ recording }: RecordingCardProps) => {
  return (
    <div className="bg-surface border border-outline-variant p-6 rounded-xl flex flex-col md:flex-row gap-6 note-card-shadow transition-all hover:border-primary cursor-pointer group">
      <div className="flex-shrink-0 w-full md:w-48 h-32 bg-surface-container-high rounded-lg flex items-center justify-center border border-outline-variant overflow-hidden">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">
          {recording.icon}
        </span>
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline-lg-mobile text-on-surface truncate">{recording.title}</h3>
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold">
            {recording.category}
          </span>
        </div>
        
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {recording.date}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[18px]">timer</span>
            {recording.duration}
          </div>
        </div>
        
        <p className="text-on-surface-variant font-body-md line-clamp-2 italic">
          "{recording.transcript}"
        </p>
      </div>
    </div>
  );
};

export default RecordingCard;