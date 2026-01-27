import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Hook to warn users about unsaved changes when navigating away
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {string} message - Optional custom warning message
 */
export function useUnsavedChanges(hasUnsavedChanges, message = "You have unsaved changes. Are you sure you want to leave?") {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    // Handle browser navigation (back button, closing tab, etc.)
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle React Router navigation
    if (blocker.state === "blocked" && hasUnsavedChanges) {
      const proceed = window.confirm(message);
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, blocker, message]);

  return blocker;
}
