import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollReset component ensures all route changes scroll to top
 * Addresses Phase 2.7 - Navigation & Scroll Behavior requirement
 */
export function ScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}