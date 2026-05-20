import express from 'express';
import cors from 'cors';
import path from 'path';
import recordingRoutes from './routes/recordingRoutes';
import { syncUploadsWithMetadata } from './utils/syncUploads';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Sync uploads folder with metadata on startup
syncUploadsWithMetadata();

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/recordings', recordingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'VNotes Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});