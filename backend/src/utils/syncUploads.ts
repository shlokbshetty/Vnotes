import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const RECORDINGS_FILE = path.join(__dirname, '../data/recordings.json');

interface Recording {
  id: string;
  filename: string;
  originalName: string;
  duration: number;
  size: number;
  type: string;
  isVideo: boolean;
  createdAt: string;
}

export const syncUploadsWithMetadata = () => {
  try {
    // Read existing recordings
    let recordings: Recording[] = [];
    if (fs.existsSync(RECORDINGS_FILE)) {
      const data = fs.readFileSync(RECORDINGS_FILE, 'utf8');
      recordings = JSON.parse(data);
    }

    // Get all files in uploads folder
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const existingFilenames = recordings.map(r => r.filename);

    // Add missing files to recordings
    files.forEach(filename => {
      if (!existingFilenames.includes(filename)) {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);
        
        // Determine MIME type from extension
        const ext = path.extname(filename).toLowerCase();
        let mimeType = 'application/octet-stream';
        let isVideo = false;

        if (['.mp4', '.mkv', '.webm', '.avi', '.mov'].includes(ext)) {
          isVideo = true;
          mimeType = `video/${ext.slice(1)}`;
        } else if (['.wav', '.mp3', '.m4a', '.aac', '.flac'].includes(ext)) {
          mimeType = `audio/${ext.slice(1)}`;
        }

        const newRecording: Recording = {
          id: Date.now().toString() + Math.random(),
          filename: filename,
          originalName: filename,
          duration: 0,
          size: stats.size,
          type: mimeType,
          isVideo: isVideo,
          createdAt: new Date(stats.birthtime).toISOString()
        };

        recordings.push(newRecording);
        console.log(`Added missing file to metadata: ${filename}`);
      }
    });

    // Write updated recordings
    fs.writeFileSync(RECORDINGS_FILE, JSON.stringify(recordings, null, 2));
    console.log('Uploads synced with metadata');
  } catch (error) {
    console.error('Error syncing uploads:', error);
  }
};
