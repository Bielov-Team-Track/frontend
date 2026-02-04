/**
 * Field-level validation error from API.
 */
export interface FieldError {
  field: string;
  code: string;
  message: string;
}

/**
 * RFC 9457 Problem Details response from API.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: string;
  detail: string;
  errors?: FieldError[];
  debug?: {
    exceptionType?: string;
    stackTrace?: string;
    innerException?: string;
  };
}

/**
 * Common error codes returned by the API.
 */
export const ErrorCodes = {
  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',

  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

  // Events
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  EVENT_FULL: 'EVENT_FULL',
  ALREADY_JOINED: 'ALREADY_JOINED',
  POSITION_ALREADY_CLAIMED: 'POSITION_ALREADY_CLAIMED',

  // Clubs
  CLUB_NOT_FOUND: 'CLUB_NOT_FOUND',
  NOT_CLUB_MEMBER: 'NOT_CLUB_MEMBER',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
