import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer 
      className="w-full border-t border-border bg-card py-4"
      role="contentinfo"
    >
      <div className="container-wide">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span className="font-medium text-foreground">
            SupportCALL Ultimate SEO
          </span>
          
          <span className="text-center">
            A once-off SEO analysis | Privacy-first approach | No data collection | Free for all users
          </span>
          
          <div className="flex flex-col items-center gap-0.5 text-center sm:items-end sm:text-right">
            <span>Need help with ICT issues?</span>
            <span>Need to reduce downtime?</span>
            <span>
              Have a quick look at{' '}
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                SupportCALL.com.au
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}