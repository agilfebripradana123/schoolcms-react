import { useEffect, useRef } from 'react';
import { useAuth } from '../useAuth';

export function useAutoRefreshAuth() {
  const { refreshUser, isAuthenticated } = useAuth();
  const lastRefreshRef = useRef<number>(0);
  const DEBOUNCE_MS = 3000;
  const POLL_MS = 60000;

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < DEBOUNCE_MS) return;
      lastRefreshRef.current = now;
      refreshUser().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);

    // Poll /api/me every 60s while tab is visible — sync permission
    // changes from admin panel within 60s without user interaction.
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshUser().catch(() => {});
      }
    }, POLL_MS);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, refreshUser]);
}
