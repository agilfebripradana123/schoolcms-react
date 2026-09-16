import { useEffect, useRef } from 'react';
import { useAuth } from '../useAuth';

export function useAutoRefreshAuth() {
  const { refreshUser, isAuthenticated } = useAuth();
  const lastRefreshRef = useRef<number>(0);
  const DEBOUNCE_MS = 3000;

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < DEBOUNCE_MS) return;
      lastRefreshRef.current = now;
      refreshUser().catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, refreshUser]);
}
