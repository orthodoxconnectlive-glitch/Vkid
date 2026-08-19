import { useEffect } from 'react';

// Common Smart TV Remote Keycodes across Samsung Tizen, LG webOS, Android TV, Fire TV, etc.
export const TV_KEYS = {
  UP: ['ArrowUp', 'Up', '38'],
  DOWN: ['ArrowDown', 'Down', '40'],
  LEFT: ['ArrowLeft', 'Left', '37'],
  RIGHT: ['ArrowRight', 'Right', '39'],
  ENTER: ['Enter', '13', '32', 'Select', 'Ok', 'OK'],
  BACK: ['Escape', 'Backspace', 'GoBack', 'BrowserBack', '27', '8', '10009', '461'],
};

export interface TvNavigationOptions {
  onBack?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

/**
 * Calculates geometric euclidean distance between two DOMRects in a specific direction.
 */
function getDistanceInDirection(
  fromRect: DOMRect,
  toRect: DOMRect,
  direction: 'up' | 'down' | 'left' | 'right'
): number | null {
  const fromCenterX = fromRect.left + fromRect.width / 2;
  const fromCenterY = fromRect.top + fromRect.height / 2;
  const toCenterX = toRect.left + toRect.width / 2;
  const toCenterY = toRect.top + toRect.height / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  // Verify alignment in the intended direction
  switch (direction) {
    case 'up':
      if (dy >= -5) return null;
      return Math.sqrt(dx * dx * 2 + dy * dy);
    case 'down':
      if (dy <= 5) return null;
      return Math.sqrt(dx * dx * 2 + dy * dy);
    case 'left':
      if (dx >= -5) return null;
      return Math.sqrt(dx * dx + dy * dy * 2);
    case 'right':
      if (dx <= 5) return null;
      return Math.sqrt(dx * dx + dy * dy * 2);
  }
}

/**
 * Custom React Hook for Smart TV D-Pad Remote Control Navigation
 * Works on older Samsung Tizen, LG webOS, Android TV, and standard web browsers.
 */
export function useTvNavigation(options: TvNavigationOptions = {}) {
  const { onBack, onEnter, enabled = true } = options;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const keyName = e.key || String(e.keyCode);
      const keyCode = e.keyCode;
      const keyCodeStr = String(keyCode);

      // 1. Back / Return Key Handling for Smart TV Remotes (Samsung Tizen: 10009, LG webOS: 461)
      if (
        TV_KEYS.BACK.includes(keyName) ||
        TV_KEYS.BACK.includes(keyCodeStr) ||
        keyCode === 10009 ||
        keyCode === 461 ||
        keyCode === 27 ||
        keyCode === 8
      ) {
        if (onBack) {
          e.preventDefault();
          e.stopPropagation();
          onBack();
          return;
        }
      }

      // 2. Enter / OK Key Handling (keyCode 13, Enter, Select)
      if (
        TV_KEYS.ENTER.includes(keyName) ||
        TV_KEYS.ENTER.includes(keyCodeStr) ||
        keyCode === 13
      ) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && activeEl !== document.body) {
          // If active element is a non-button (like a div with tabindex) or needs standard click execution
          if (activeEl.tagName !== 'BUTTON' && activeEl.tagName !== 'A' && activeEl.tagName !== 'INPUT') {
            e.preventDefault();
            activeEl.click();
            return;
          }
        } else if (onEnter) {
          e.preventDefault();
          onEnter();
          return;
        }
      }

      // 3. D-Pad Directional Arrow Navigation
      let direction: 'up' | 'down' | 'left' | 'right' | null = null;
      if (keyName === 'ArrowUp' || keyName === 'Up' || keyCode === 38) direction = 'up';
      else if (keyName === 'ArrowDown' || keyName === 'Down' || keyCode === 40) direction = 'down';
      else if (keyName === 'ArrowLeft' || keyName === 'Left' || keyCode === 37) direction = 'left';
      else if (keyName === 'ArrowRight' || keyName === 'Right' || keyCode === 39) direction = 'right';

      if (direction) {
        // Do not intercept arrow keys if currently typing in an input/textarea
        const currentActive = document.activeElement as HTMLElement | null;
        if (
          currentActive &&
          (currentActive.tagName === 'INPUT' || currentActive.tagName === 'TEXTAREA') &&
          (direction === 'left' || direction === 'right')
        ) {
          return;
        }

        const focusables = Array.from(
          document.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          )
        ).filter((el) => {
          const style = window.getComputedStyle(el);
          return (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            el.offsetParent !== null
          );
        });

        if (focusables.length === 0) return;

        if (!currentActive || currentActive === document.body || !focusables.includes(currentActive)) {
          e.preventDefault();
          focusables[0].focus();
          return;
        }

        const currentRect = currentActive.getBoundingClientRect();
        let closestEl: HTMLElement | null = null;
        let minDistance = Infinity;

        for (const candidate of focusables) {
          if (candidate === currentActive) continue;
          const candidateRect = candidate.getBoundingClientRect();
          const dist = getDistanceInDirection(currentRect, candidateRect, direction);
          if (dist !== null && dist < minDistance) {
            minDistance = dist;
            closestEl = candidate;
          }
        }

        if (closestEl) {
          e.preventDefault();
          closestEl.focus();
          closestEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } else {
          // If no geometric neighbor in direction, cycle forward/backward
          const currentIndex = focusables.indexOf(currentActive);
          if (currentIndex !== -1) {
            let nextIndex = currentIndex;
            if (direction === 'right' || direction === 'down') {
              nextIndex = (currentIndex + 1) % focusables.length;
            } else if (direction === 'left' || direction === 'up') {
              nextIndex = (currentIndex - 1 + focusables.length) % focusables.length;
            }
            if (nextIndex !== currentIndex && focusables[nextIndex]) {
              e.preventDefault();
              focusables[nextIndex].focus();
              focusables[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onBack, onEnter, enabled]);
}
