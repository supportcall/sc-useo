import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const supportCallLinks = [
    { name: 'Australia', url: 'https://www.supportcall.com.au/' },
    { name: 'South Africa', url: 'https://www.supportcall.co.za/' },
    { name: 'Workflow4AI', url: 'https://workflow4ai.com/' },
    { name: 'SysAdmin AI', url: 'https://sysadmin-ai.com/' },
    { name: 'SC-USCS', url: 'https://sc-uscs.com/' },
    { name: 'SC-Cloaked', url: 'https://sc-cloaked.com/' },
    { name: 'WAN IP', url: 'https://wanip.io/' },
    { name: 'SC-USEO', url: 'https://sc-useo.com/' },
    { name: 'SeniorMail', url: 'https://seniormail.co.za/' },
    { name: 'Rehab-Source', url: 'https://rehab-source.com/' },
    { name: 'ImmiAssist2AU', url: 'https://immiassist2au.com/' },
  ];

  const quickLinks = [
    { name: 'SEO Analysis', url: '/', internal: true },
    { name: 'About', url: '/#about', internal: false },
    { name: 'Privacy', url: 'https://wiki.supportcall.com.au/doku.php?id=policy_-_privacy_policy', internal: false },
    { name: 'Production Checklist', url: '/production-checklist', internal: true },
  ];

  return (
    <footer 
      className="w-full border-t border-border bg-card"
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="container-wide py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="text-lg font-semibold text-foreground">
                SC-U SEO
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Comprehensive SEO analysis with AI-powered insights. 
              Privacy-first approach with no data collection.
            </p>
          </div>
          
          {/* SupportCALL Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              SupportCALL
            </h4>
            <nav className="flex flex-col space-y-2">
              {supportCallLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {link.name}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2">
              {quickLinks.map((link) => (
                link.internal ? (
                  <Link
                    key={link.name}
                    to={link.url}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : undefined}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {link.name}
                    {link.url.startsWith('http') && (
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    )}
                  </a>
                )
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="border-t border-border">
        <div className="container-wide py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} SC-U SEO. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-2xl">
              SC-U SEO is provided "as is" for informational purposes only. 
              Consult with your ICT or SEO professional regarding optimization strategies. 
              Use at your own risk.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
