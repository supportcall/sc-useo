import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="w-full border-t border-border bg-card"
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="container-wide py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3 lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-lg font-semibold text-foreground">
                SC-U SEO
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              SupportCALL Ultimate SEO
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              A once-off SEO analysis | Privacy-first approach | No data collection | Free for all users
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                SEO Analysis
              </Link>
              <a 
                href="/#about" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <a 
                href="https://wiki.supportcall.com.au/doku.php?id=policy_-_privacy_policy" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <Link 
                to="/production-checklist" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Production Checklist
              </Link>
            </nav>
          </div>
          
          {/* SupportCALL Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              SupportCALL
            </h4>
            <nav className="flex flex-col space-y-2">
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Australia
              </a>
              <a 
                href="https://supportcall.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                South Africa
              </a>
              <a 
                href="https://sc-uscs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Ultimate Secure Clean Script
              </a>
              <a 
                href="https://wanip.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                WAN IP
              </a>
              <a 
                href="https://sc-cloaked.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                SafeDigits
              </a>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="border-t border-border">
        <div className="container-wide py-4">
          <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
            <p>© {currentYear} SupportCALL ICT Solutions. All rights reserved.</p>
            <p className="max-w-3xl text-xs">
              SEO analysis results provided by SC-U SEO are for informational purposes only. 
              Always consult with your ICT or SEO professional for comprehensive optimization strategies. 
              Results may vary based on website configuration and external factors.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
