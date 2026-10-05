/**
 * Default fallback message when no specific code or message is matched.
 */
export const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';

/**
 * Fallback error message dictionary for HTTP status codes and custom application codes
 * when the backend response envelope does not include a custom message.
 */
export const RESPONSE_CODE_MESSAGES: Readonly<Record<string, string>> = {
  '0': 'Unable to reach the server. Check your connection and try again.',
  '400': 'Invalid request. Please check your input.',
  '401': 'Authentication required. Please sign in.',
  '403': 'You do not have permission to perform this action.',
  '404': 'The requested resource was not found.',
  '405': 'This action is not allowed.',
  '408': 'The request timed out. Please try again.',
  '409': 'This action conflicts with existing data.',
  '413': 'The submitted data is too large.',
  '415': 'Unsupported data format.',
  '422': 'The submitted data could not be processed.',
  '429': 'Too many requests. Please wait and try again.',
  '500': 'Internal server error. Please try again later.',
  '502': 'The server is temporarily unavailable. Please try again later.',
  '503': 'The service is currently unavailable. Please try again later.',
  '504': 'The server took too long to respond. Please try again.',
};
