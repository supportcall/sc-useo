import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = useCallback(() => {
    setIsVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Button
      onClick={scrollToTop}
      variant="secondary"
      size="icon"
      className={cn(
        'fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-lg transition-all duration-200',
        'hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      aria-label="Scroll to top of page"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}