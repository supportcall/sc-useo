import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-4">
      <div className="container-wide">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span className="font-medium text-foreground">
            SupportCALL Ultimate SEO
          </span>
          
          <span className="text-center">
            One-off SEO analysis. No storage.
          </span>
          
          <a 
            href="https://supportcall.com.au" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 text-center text-primary hover:underline sm:items-end sm:text-right"
          >
            <span>Need help with ICT issues?</span>
            <span>Need to reduce downtime?</span>
            <span className="flex items-center gap-1.5">
              Have a quick look at SupportCALL.com.au
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
