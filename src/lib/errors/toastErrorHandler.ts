import { toast } from 'sonner';
import { ApiError } from './ApiError';
import { ErrorCodes } from './types';

export interface ToastErrorOptions {
  /** Custom message to show (overrides API message) */
  message?: string;
  /** Fallback message if error parsing fails */
  fallback?: string;
  /** Don't show toast for these error codes */
  ignore?: string[];
  /** Custom duration in ms */
  duration?: number;
}

/**
 * Show an error toast for an API error.
 * Handles all error types and formats them for user display.
 */
export function showErrorToast(
  error: unknown,
  options: ToastErrorOptions = {}
): ApiError {
  const apiError = ApiError.fromError(error);

  // Check if we should ignore this error code
  if (options.ignore?.includes(apiError.code)) {
    return apiError;
  }

  // Don't show toast for auth errors (handled by redirect)
  if (apiError.code === ErrorCodes.UNAUTHORIZED || apiError.code === ErrorCodes.TOKEN_EXPIRED) {
    return apiError;
  }

  const message = options.message ?? apiError.getUserMessage() ?? options.fallback ?? 'An error occurred';

  toast.error(message, {
    duration: options.duration ?? 5000,
  });

  return apiError;
}

/**
 * Show a success toast message.
 * Use this for successful operations to maintain consistent styling.
 */
export function showSuccessToast(message: string, duration?: number): void {
  toast.success(message, {
    duration: duration ?? 5000,
  });
}

/**
 * Get error message from any error type.
 * Use this when you need the message but don't want to show a toast.
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const apiError = ApiError.fromError(error);
  return apiError.getUserMessage() || fallback;
}

/**
 * Extract field errors from an error for form validation.
 * Returns a map of fieldName -> errorMessage.
 */
export function getFormErrors(error: unknown): Record<string, string> {
  const apiError = ApiError.fromError(error);
  return apiError.getFieldErrorsMap();
}
