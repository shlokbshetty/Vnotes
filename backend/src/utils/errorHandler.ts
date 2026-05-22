/**
 * Error handling utilities
 * Consistent error response formatting
 */

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any
): ErrorResponse => {
  return {
    success: false,
    message,
    ...(code && { code }),
    ...(details && { details })
  };
};

export const createSuccessResponse = <T>(data: T): SuccessResponse<T> => {
  return {
    success: true,
    data
  };
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
