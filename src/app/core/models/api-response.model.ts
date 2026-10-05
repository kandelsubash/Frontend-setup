/**
 * Standardized backend response envelope contract across all services.
 */
export interface ApiResponse<T> {
  /** Unwrapped data payload; null or undefined for message-only mutating responses. */
  data?: T | null;
  /** ISO 8601 timestamp of server response. */
  timestamp: string;
  /** Response status code or business error code. */
  responsecode: string;
  /** Informational or error message. */
  message: string;
  /** Boolean indicating whether the business operation succeeded. */
  success: boolean;
}
