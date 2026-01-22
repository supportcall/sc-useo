import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer 
      className="w-full border-t border-border bg-card"
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="container-wide py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-2">
            <div className="font-semibold text-foreground">SC-U SEO</div>
            <div className="text-sm text-muted-foreground">
              SupportCALL Ultimate SEO
            </div>
            <div className="text-xs text-muted-foreground">
              A once-off SEO analysis | Privacy-first approach | No data collection | Free for all users
            </div>
          </div>
          
          {/* Quick Links Column */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </div>
            <nav className="flex flex-col gap-1.5 text-sm">
              <Link 
                to="/" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                SEO Analysis
              </Link>
              <Link 
                to="/production-checklist" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Production Checklist
              </Link>
              <Link 
                to="/about" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
          
          {/* SupportCALL Column */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SupportCALL
            </div>
            <nav className="flex flex-col gap-1.5 text-sm">
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Australia
              </a>
              <a 
                href="https://supportcall.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                South Africa
              </a>
              <a 
                href="https://sc-uscs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Ultimate Secure Clean Script
              </a>
              <a 
                href="https://sc-cloaked.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                SC-Cloaked
              </a>
            </nav>
          </div>
          
          {/* Need Help Column */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Need Help?
            </div>
            <div className="text-sm text-muted-foreground">
              Need help with ICT issues? Need to reduce downtime?
            </div>
            <a 
              href="https://supportcall.com.au" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Visit SupportCALL.com.au
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container-wide py-4">
          <div className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} SupportCALL ICT Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}