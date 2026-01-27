/**
 * Utility functions for form handling and rate limiting
 */

/**
 * Creates a debounced version of a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Creates a throttled version of a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 1000) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Prevents rapid successive form submissions
 * @param {Function} submitFn - Submit function to protect
 * @param {number} cooldownMs - Cooldown period in milliseconds (default: 2000)
 * @returns {Function} Protected submit function
 */
export function preventRapidSubmit(submitFn, cooldownMs = 2000) {
  let lastSubmitTime = 0;
  let isSubmitting = false;

  return async (...args) => {
    const now = Date.now();
    
    // Prevent if still submitting
    if (isSubmitting) {
      return;
    }

    // Prevent if within cooldown period
    if (now - lastSubmitTime < cooldownMs) {
      return;
    }

    isSubmitting = true;
    lastSubmitTime = now;

    try {
      await submitFn(...args);
    } finally {
      // Allow next submission after cooldown
      setTimeout(() => {
        isSubmitting = false;
      }, cooldownMs);
    }
  };
}
