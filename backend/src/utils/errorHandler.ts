/**
 * Error handling utilities
 * Consistent error response formatting
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  timestamp?: string;
  details?: any;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Create a standardized error response
 * Never includes sensitive details in the response
 * 
 * @param message - User-facing error message (no sensitive details)
 * @param code - Error code for client-side handling
 * @param details - Internal details (for logging only, not sent to client)
 * @returns Formatted error response
 */
export const createErrorResponse = (
  message: string,
  code?: string,
  details?: any
): ErrorResponse => {
  return {
    success: false,
    message,
    ...(code && { code }),
    timestamp: new Date().toISOString(),
    ...(details && { details }) // Only include if explicitly provided
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
    public code?: string,
    public internalMessage?: string // For logging only
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Categorize OAuth errors and return appropriate HTTP status and message
 * 
 * Requirements: 9.1, 9.2
 */
export function categorizeOAuthError(error: any): {
  statusCode: number;
  message: string;
  code: string;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // OAuth token exchange failures (400 Bad Request)
  if (errorMessage.includes('invalid_grant') || errorMessage.includes('invalid or expired')) {
    return {
      statusCode: 400,
      message: 'Authorization code is invalid or expired',
      code: 'INVALID_AUTH_CODE',
    };
  }

  if (errorMessage.includes('invalid_client')) {
    return {
      statusCode: 500,
      message: 'Authentication service configuration error',
      code: 'CONFIG_ERROR',
    };
  }

  if (errorMessage.includes('redirect_uri_mismatch')) {
    return {
      statusCode: 500,
      message: 'Authentication service configuration error',
      code: 'CONFIG_ERROR',
    };
  }

  if (errorMessage.includes('network_error') || errorMessage.includes('Network')) {
    return {
      statusCode: 500,
      message: 'Failed to communicate with authentication service',
      code: 'NETWORK_ERROR',
    };
  }

  // ID token verification failures (401 Unauthorized)
  if (errorMessage.includes('invalid_signature') || errorMessage.includes('signature verification failed')) {
    return {
      statusCode: 401,
      message: 'ID token verification failed',
      code: 'INVALID_ID_TOKEN',
    };
  }

  if (errorMessage.includes('token_expired') || errorMessage.includes('Token expired')) {
    return {
      statusCode: 401,
      message: 'ID token has expired',
      code: 'EXPIRED_ID_TOKEN',
    };
  }

  if (errorMessage.includes('invalid_audience') || errorMessage.includes('audience')) {
    return {
      statusCode: 401,
      message: 'ID token verification failed',
      code: 'INVALID_ID_TOKEN',
    };
  }

  if (errorMessage.includes('invalid_issuer') || errorMessage.includes('issuer')) {
    return {
      statusCode: 401,
      message: 'ID token verification failed',
      code: 'INVALID_ID_TOKEN',
    };
  }

  if (errorMessage.includes('missing required') || errorMessage.includes('missing required fields')) {
    return {
      statusCode: 400,
      message: 'Authentication data is incomplete',
      code: 'MISSING_AUTH_DATA',
    };
  }

  // Default to 500 for unknown OAuth errors
  return {
    statusCode: 500,
    message: 'Authentication service error',
    code: 'OAUTH_ERROR',
  };
}

/**
 * Categorize database/Supabase errors and return appropriate HTTP status and message
 * Never reveals internal database details
 * 
 * Requirements: 9.5, 9.6
 */
export function categorizeDatabaseError(error: any): {
  statusCode: number;
  message: string;
  code: string;
} {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Connection errors (500 Internal Server Error)
  if (
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return {
      statusCode: 500,
      message: 'Database service temporarily unavailable',
      code: 'DB_CONNECTION_ERROR',
    };
  }

  // Query errors (500 Internal Server Error)
  if (
    errorMessage.includes('query') ||
    errorMessage.includes('syntax') ||
    errorMessage.includes('permission')
  ) {
    return {
      statusCode: 500,
      message: 'Failed to process request',
      code: 'DB_QUERY_ERROR',
    };
  }

  // Record not found (when explicitly checked)
  if (errorMessage.includes('not found') || errorMessage.includes('no rows')) {
    return {
      statusCode: 404,
      message: 'Resource not found',
      code: 'NOT_FOUND',
    };
  }

  // Default to 500 for unknown database errors
  return {
    statusCode: 500,
    message: 'Service temporarily unavailable',
    code: 'SERVICE_ERROR',
  };
}
