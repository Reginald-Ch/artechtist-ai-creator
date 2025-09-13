import { AppError } from '@/types/common';

/**
 * Enhanced error handling utilities
 */

export class AppErrorClass extends Error implements AppError {
  code: string;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage: string;

  constructor(
    code: string,
    message: string,
    userMessage: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
    this.timestamp = new Date();
  }
}

export const createError = (
  code: string,
  message: string,
  userMessage: string,
  details?: Record<string, any>
): AppError => {
  return new AppErrorClass(code, message, userMessage, details);
};

export const handleAuthError = (error: any): AppError => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('invalid login credentials')) {
    return createError(
      'AUTH_INVALID_CREDENTIALS',
      'Invalid login credentials provided',
      'Invalid email or password. Please check your credentials and try again.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return createError(
      'AUTH_EMAIL_NOT_CONFIRMED',
      'Email address not confirmed',
      'Please check your email and click the confirmation link before signing in.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('too many requests')) {
    return createError(
      'AUTH_RATE_LIMITED',
      'Too many authentication requests',
      'Too many login attempts. Please wait a few minutes and try again.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('user not found')) {
    return createError(
      'AUTH_USER_NOT_FOUND',
      'User account not found',
      'No account found with this email address. Please sign up first.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('weak password')) {
    return createError(
      'AUTH_WEAK_PASSWORD',
      'Password does not meet security requirements',
      'Password is too weak. Please choose a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('email already registered')) {
    return createError(
      'AUTH_EMAIL_EXISTS',
      'Email address already in use',
      'An account with this email address already exists. Please sign in instead.',
      { originalError: error.message }
    );
  }
  
  if (errorMessage.includes('network')) {
    return createError(
      'NETWORK_ERROR',
      'Network connection error',
      'Network error. Please check your internet connection and try again.',
      { originalError: error.message }
    );
  }
  
  // Default fallback error
  return createError(
    'AUTH_UNKNOWN_ERROR',
    'Unknown authentication error',
    'An unexpected error occurred. Please try again later.',
    { originalError: error.message }
  );
};

export const handleApiError = (error: any, context?: string): AppError => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const statusCode = error?.status || error?.statusCode;
  
  if (statusCode === 400) {
    return createError(
      'API_BAD_REQUEST',
      'Bad request sent to server',
      'Invalid request. Please check your input and try again.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (statusCode === 401) {
    return createError(
      'API_UNAUTHORIZED',
      'Unauthorized access attempt',
      'Your session has expired. Please sign in again.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (statusCode === 403) {
    return createError(
      'API_FORBIDDEN',
      'Access to resource forbidden',
      'You don\'t have permission to access this resource.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (statusCode === 404) {
    return createError(
      'API_NOT_FOUND',
      'Resource not found',
      'The requested resource was not found.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (statusCode === 429) {
    return createError(
      'API_RATE_LIMITED',
      'Too many requests',
      'Too many requests. Please wait a moment and try again.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (statusCode >= 500) {
    return createError(
      'API_SERVER_ERROR',
      'Server error occurred',
      'A server error occurred. Please try again later.',
      { originalError: error.message, context, statusCode }
    );
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return createError(
      'NETWORK_ERROR',
      'Network connection error',
      'Network error. Please check your internet connection and try again.',
      { originalError: error.message, context }
    );
  }
  
  // Default API error
  return createError(
    'API_UNKNOWN_ERROR',
    'Unknown API error',
    'An unexpected error occurred. Please try again later.',
    { originalError: error.message, context, statusCode }
  );
};

export const handleValidationError = (errors: string[]): AppError => {
  return createError(
    'VALIDATION_ERROR',
    `Validation failed: ${errors.join(', ')}`,
    `Please fix the following issues: ${errors.join(', ')}`,
    { validationErrors: errors }
  );
};

export const logError = (error: AppError | Error, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Details');
    console.error('Error:', error);
    if (context) console.log('Context:', context);
    if ('code' in error) console.log('Error Code:', error.code);
    if ('details' in error) console.log('Details:', error.details);
    console.groupEnd();
  }
  
  // In production, you would send this to your error monitoring service
  // e.g., Sentry, LogRocket, etc.
};

export const isAppError = (error: any): error is AppError => {
  return error && 
         typeof error.code === 'string' &&
         typeof error.message === 'string' &&
         typeof error.userMessage === 'string' &&
         error.timestamp instanceof Date;
};

export const getErrorMessage = (error: any): string => {
  if (isAppError(error)) {
    return error.userMessage;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again later.';
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};