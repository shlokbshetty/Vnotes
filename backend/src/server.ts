/**
 * Main Server Entry Point
 * Initializes Express app and middleware
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import recordingRoutes from './routes/recordingRoutes';
import { syncUploadsWithMetadata } from './utils/syncUploads';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Sync uploads folder with metadata on startup
logger.info('Syncing uploads with metadata...');
syncUploadsWithMetadata();

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/recordings', recordingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'VNotes Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 Not Found', { path: req.path, method: req.method });
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { environment: config.NODE_ENV });
});