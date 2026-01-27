/**
 * Standardized error message extraction and formatting utilities
 */

/**
 * Extracts a user-friendly error message from various error formats
 * @param {Error|string|object|null|undefined} error - The error object, string, or null/undefined
 * @param {string} defaultMessage - Default message if error cannot be extracted
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error, defaultMessage = "An unexpected error occurred. Please try again.") {
  if (!error) {
    return defaultMessage;
  }

  // If it's already a string, return it
  if (typeof error === "string") {
    return error;
  }

  // If it's an Error object, check for message
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  // If it's an object with a message property
  if (typeof error === "object" && error !== null) {
    // Check common error message properties
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return typeof error.error === "string" ? error.error : getErrorMessage(error.error, defaultMessage);
    }
    if (error.msg) {
      return error.msg;
    }
    // Supabase errors often have error_description
    if (error.error_description) {
      return error.error_description;
    }
  }

  return defaultMessage;
}

/**
 * Formats error messages for network/server errors with additional context
 * @param {Error|string|object|null|undefined} error - The error object
 * @param {string} operation - The operation that failed (e.g., "save lineup", "load events")
 * @param {boolean} isNetworkError - Whether this is a network error
 * @returns {string} Formatted error message
 */
export function formatOperationError(error, operation, isNetworkError = false) {
  const baseMessage = getErrorMessage(error);
  
  if (isNetworkError) {
    return `Network error: Unable to ${operation}. Please check your connection and try again.`;
  }

  // If the error message already contains the operation context, return as-is
  if (baseMessage.toLowerCase().includes(operation.toLowerCase())) {
    return baseMessage;
  }

  // Otherwise, prepend operation context
  return `Failed to ${operation}: ${baseMessage}`;
}

/**
 * Checks if an error is a network error
 * @param {Error|object|null|undefined} error - The error object
 * @returns {boolean} True if error appears to be network-related
 */
export function isNetworkError(error) {
  if (!error) return false;
  
  const message = getErrorMessage(error, "").toLowerCase();
  const networkKeywords = [
    "network",
    "fetch",
    "timeout",
    "connection",
    "offline",
    "failed to fetch",
    "networkerror",
    "network request failed"
  ];

  return networkKeywords.some(keyword => message.includes(keyword));
}

/**
 * Checks if an error is an authentication error
 * @param {Error|object|null|undefined} error - The error object
 * @returns {boolean} True if error appears to be auth-related
 */
export function isAuthError(error) {
  if (!error) return false;
  
  const message = getErrorMessage(error, "").toLowerCase();
  const authKeywords = [
    "unauthorized",
    "authentication",
    "session",
    "token",
    "expired",
    "invalid session",
    "not authenticated"
  ];

  return authKeywords.some(keyword => message.includes(keyword));
}

/**
 * Checks if an error is a validation error
 * @param {Error|object|null|undefined} error - The error object
 * @returns {boolean} True if error appears to be validation-related
 */
export function isValidationError(error) {
  if (!error) return false;
  
  const message = getErrorMessage(error, "").toLowerCase();
  const validationKeywords = [
    "validation",
    "invalid",
    "required",
    "missing",
    "format",
    "constraint",
    "check constraint"
  ];

  return validationKeywords.some(keyword => message.includes(keyword));
}
