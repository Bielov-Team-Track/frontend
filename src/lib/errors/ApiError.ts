import { AxiosError } from 'axios';
import { ProblemDetails, FieldError, ErrorCodes } from './types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly fieldErrors: FieldError[];
  public readonly isValidationError: boolean;
  public readonly isAuthError: boolean;
  public readonly isNotFoundError: boolean;
  public readonly originalError: unknown;

  constructor(problemDetails: ProblemDetails, originalError?: unknown) {
    super(problemDetails.detail);
    this.name = 'ApiError';
    this.status = problemDetails.status;
    this.code = problemDetails.code;
    this.title = problemDetails.title;
    this.detail = problemDetails.detail;
    this.fieldErrors = problemDetails.errors ?? [];
    this.originalError = originalError;

    this.isValidationError = this.code === ErrorCodes.VALIDATION_ERROR;
    this.isAuthError = this.status === 401 || this.status === 403;
    this.isNotFoundError = this.status === 404;
  }

  getFieldError(fieldName: string): string | undefined {
    const error = this.fieldErrors.find(
      (e) => e.field.toLowerCase() === fieldName.toLowerCase()
    );
    return error?.message;
  }

  getFieldErrorsMap(): Record<string, string> {
    return this.fieldErrors.reduce(
      (acc, error) => {
        acc[error.field] = error.message;
        return acc;
      },
      {} as Record<string, string>
    );
  }

  getUserMessage(): string {
    if (this.isValidationError && this.fieldErrors.length > 0) {
      if (this.fieldErrors.length === 1) {
        return this.fieldErrors[0].message;
      }
      return this.detail || 'Please fix the validation errors';
    }

    // Don't show technical details for internal server errors
    if (this.status >= 500) {
      return 'Something went wrong. Please try again later.';
    }

    // For 502/503/504 gateway errors, show a service unavailable message
    if (this.code === 'NETWORK_ERROR' || this.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    }

    return this.detail || this.title || 'An error occurred';
  }

  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Axios error with response - expect RFC 9457 ProblemDetails format
    if (error instanceof AxiosError && error.response?.data) {
      const data = error.response.data;
      if (data.code && data.detail) {
        return new ApiError(data as ProblemDetails, error);
      }
    }

    // Axios error without response (network error)
    if (error instanceof AxiosError) {
      return new ApiError({
        type: 'about:blank',
        title: 'Network error',
        status: 0,
        code: 'NETWORK_ERROR',
        detail: error.message || 'Unable to connect to the server',
      }, error);
    }

    // Generic error
    if (error instanceof Error) {
      return new ApiError({
        type: 'about:blank',
        title: 'Error',
        status: 500,
        code: 'UNKNOWN_ERROR',
        detail: error.message || 'An unexpected error occurred',
      }, error);
    }

    // Unknown error type
    return new ApiError({
      type: 'about:blank',
      title: 'Error',
      status: 500,
      code: 'UNKNOWN_ERROR',
      detail: 'An unexpected error occurred',
    }, error);
  }

  hasCode(code: string): boolean {
    return this.code === code;
  }
}
