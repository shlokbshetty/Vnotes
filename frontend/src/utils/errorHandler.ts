/**
 * Error Handler Utilities
 * Consistent error handling and user-friendly messages
 */

export class ApiError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const getUserFriendlyMessage = (error: any): string => {
  const message = getErrorMessage(error);

  // Map common errors to user-friendly messages
  const errorMap: { [key: string]: string } = {
    'Upload failed': 'Failed to save recording. Please try again.',
    'Failed to fetch recordings': 'Could not load recordings. Please check your connection.',
    'Recording not found': 'This recording no longer exists.',
    'Failed to delete recording': 'Could not delete recording. Please try again.',
    'No file uploaded': 'Please select a file to upload.',
    'Only audio and video files are allowed': 'Only audio and video files are supported.',
    'File size exceeds limit': 'File is too large. Maximum size is 500MB.',
    'Network error': 'Network connection failed. Please check your internet.',
    'Server not reachable': 'Backend server is not running. Please start it first.'
  };

  return errorMap[message] || message;
};

export const logError = (context: string, error: any): void => {
  const timestamp = new Date().toISOString();
  const message = getErrorMessage(error);
  console.error(`[${timestamp}] [${context}] ${message}`, error);
};
