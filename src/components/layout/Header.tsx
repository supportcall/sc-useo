import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container-wide flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            SupportCALL Ultimate SEO
          </span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            to="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy
          </Link>
          <Link 
            to="/production-checklist" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Production Checklist
          </Link>
          <Button asChild variant="default" size="sm">
            <a 
              href="https://supportcall.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              Get Support
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
