import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border bg-card"
      role="banner"
    >
      <div className="container-wide flex h-14 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2"
          aria-label="SupportCALL Ultimate SEO - Home"
        >
          <span className="text-lg font-semibold text-foreground">
            SupportCALL Ultimate SEO
          </span>
        </Link>
        
        <nav className="flex items-center gap-4" role="navigation" aria-label="Main navigation">
          <a 
            href="/#about" 
            className="text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
          >
            About
          </a>
          <a 
            href="https://wiki.supportcall.com.au/doku.php?id=policy_-_privacy_policy" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded px-1"
          >
            Privacy
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          <Button asChild variant="default" size="sm">
            <a 
              href="https://supportcall.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              Get Support
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}