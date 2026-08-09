import { useEffect } from 'react';

// Common Smart TV Remote Keycodes
export const TV_KEYS = {
  UP: ['ArrowUp', 'Up', '38'],
  DOWN: ['ArrowDown', 'Down', '40'],
  LEFT: ['ArrowLeft', 'Left', '37'],
  RIGHT: ['ArrowRight', 'Right', '39'],
  ENTER: ['Enter', '13', '32'],
  BACK: ['Escape', 'Backspace', 'GoBack', 'BrowserBack', '27', '8', '10009', '461'],
};

export interface TvNavigationOptions {
  onBack?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

/**
 * Custom React Hook for Smart TV D-Pad Remote Control Navigation
 */
export function useTvNavigation(options: TvNavigationOptions = {}) {
  const { onBack, onEnter, enabled = true } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyName = e.key || String(e.keyCode);
      const keyCodeStr = String(e.keyCode);

      // 1. Back / Return Key Handling for Smart TV Remotes
      if (
        TV_KEYS.BACK.includes(keyName) ||
        TV_KEYS.BACK.includes(keyCodeStr) ||
        e.keyCode === 10009 || // Samsung Tizen Return Key
        e.keyCode === 461 ||   // LG webOS Back Key
        e.keyCode === 27 ||    // Escape
        e.keyCode === 8        // Backspace
      ) {
        if (onBack) {
          e.preventDefault();
          e.stopPropagation();
          onBack();
          return;
        }
      }

      // 2. D-Pad Arrow Navigation Auto-Focus fallback
      if (
        TV_KEYS.UP.includes(keyName) ||
        TV_KEYS.DOWN.includes(keyName) ||
        TV_KEYS.LEFT.includes(keyName) ||
        TV_KEYS.RIGHT.includes(keyName)
      ) {
        // If nothing is currently focused on screen, focus the first focusable interactive element
        const activeEl = document.activeElement;
        const isBodyFocused = !activeEl || activeEl === document.body;

        if (isBodyFocused) {
          const focusables = document.querySelectorAll<HTMLElement>(
            'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            e.preventDefault();
            focusables[0].focus();
          }
        }
      }

      // 3. Enter / Select Key Handling
      if (
        TV_KEYS.ENTER.includes(keyName) ||
        TV_KEYS.ENTER.includes(keyCodeStr) ||
        e.keyCode === 13
      ) {
        if (onEnter && document.activeElement === document.body) {
          e.preventDefault();
          onEnter();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onBack, onEnter, enabled]);
}
