import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling click outside behavior
 * @param {Function} callback - Function to call when clicking outside
 * @param {boolean} isActive - Whether the click outside detection should be active
 * @param {number} delay - Delay in milliseconds before adding event listener (useful for portals)
 * @returns {Object} - Ref object to attach to the element
 */
export const useClickOutside = (callback, isActive = true, delay = 0) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    if (isActive) {
      const addListener = () => {
        document.addEventListener('mousedown', handleClickOutside);
      };

      if (delay > 0) {
        const timeoutId = setTimeout(addListener, delay);
        return () => {
          clearTimeout(timeoutId);
          document.removeEventListener('mousedown', handleClickOutside);
        };
      } else {
        addListener();
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
    }
  }, [callback, isActive, delay]);

  return ref;
};

/**
 * Custom hook for handling escape key press
 * @param {Function} callback - Function to call when escape key is pressed
 * @param {boolean} isActive - Whether the escape key detection should be active
 */
export const useEscapeKey = (callback, isActive = true) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (isActive && event.key === 'Escape') {
        callback();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [callback, isActive]);
};
