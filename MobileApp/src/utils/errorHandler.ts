/**
 * Error Handling Utilities - Safe, informative error reporting
 * - Centralized error logging
 * - User-friendly error messages
 * - Error categorization and recovery suggestions
 */

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

export interface AppError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  originalError?: any;
  timestamp: string;
}

/**
 * Categorize and format errors for user consumption
 */
export const errorHandler = {
  /**
   * Parse error and return user-friendly message
   */
  parseError(error: any): AppError {
    let category = ErrorCategory.UNKNOWN;
    let message = 'An unexpected error occurred';
    let userMessage = 'Something went wrong. Please try again.';

    if (error.response) {
      // HTTP error response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401 || status === 403) {
        category = ErrorCategory.AUTH;
        userMessage = 'Session expired. Please log in again.';
      } else if (status === 404) {
        category = ErrorCategory.NOT_FOUND;
        userMessage = 'The requested item was not found.';
      } else if (status === 400) {
        category = ErrorCategory.VALIDATION;
        userMessage = data?.message || 'Invalid request. Please check your input.';
      } else if (status >= 500) {
        userMessage = 'Server error. Please try again later.';
      }

      message = data?.message || error.message;
    } else if (error.message === 'Network Error') {
      category = ErrorCategory.NETWORK;
      message = 'Network request failed';
      userMessage = 'No internet connection. Please check your network.';
    } else if (error.message?.includes('permission')) {
      category = ErrorCategory.PERMISSION;
      message = error.message;
      userMessage = 'Permission denied. Please enable in settings.';
    } else {
      message = error.message || 'Unknown error';
    }

    return {
      category,
      message,
      userMessage,
      originalError: error,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Log error to console and analytics
   */
  log(error: any, context?: string) {
    const parsed = this.parseError(error);
    console.error(`[Error${context ? ` - ${context}` : ''}] ${parsed.message}`, {
      category: parsed.category,
      error: parsed.originalError,
      timestamp: parsed.timestamp,
    });
  },

  /**
   * Get recovery suggestion based on error category
   */
  getRecoverySuggestion(category: ErrorCategory): string {
    const suggestions: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Check your internet connection and try again',
      [ErrorCategory.AUTH]: 'Please log in again',
      [ErrorCategory.VALIDATION]: 'Check your input and try again',
      [ErrorCategory.NOT_FOUND]: 'This item may have been deleted',
      [ErrorCategory.PERMISSION]: 'Grant permission in app settings',
      [ErrorCategory.UNKNOWN]: 'Please try again or contact support',
    };

    return suggestions[category];
  },
};

/**
 * Safe API call wrapper with automatic error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  errorContext?: string
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await apiCall();
    return { data };
  } catch (err) {
    const error = errorHandler.parseError(err);
    errorHandler.log(err, errorContext);
    return { error };
  }
};
