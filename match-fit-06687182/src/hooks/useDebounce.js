import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds (default: 1000)
 * @returns {Function} Throttled function
 */
export function useThrottle(func, delay = 1000) {
  const [lastCallTime, setLastCallTime] = useState(0);

  return (...args) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      setLastCallTime(now);
      return func(...args);
    }
  };
}
