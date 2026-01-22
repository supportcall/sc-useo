import { ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* About Text */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                About SC-U SEO
              </h1>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">SupportCALL Ultimate SEO</strong> is developed by{' '}
                  <a 
                    href="https://supportcall.com.au" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    SupportCALL ICT Solutions
                  </a>
                  , a trusted IT services provider with over 30 years of experience serving businesses across Australia and South Africa.
                </p>
                
                <p>
                  Born from real-world IT support experience, SC-U SEO provides website owners, developers, and SEO professionals with a comprehensive, privacy-first SEO analysis tool. Every check is carefully designed to provide actionable insights that help maximize your site's potential.
                </p>
                
                <p>
                  Our philosophy is simple:{' '}
                  <em className="text-foreground font-medium">
                    provide thorough, transparent SEO analysis without collecting or storing any user data
                  </em>
                  . No accounts required, no data retention, no hidden tracking.
                </p>
              </div>
            </div>
            
            {/* SupportCALL Links */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">
                SupportCALL ICT Solutions
              </h2>
              
              <div className="space-y-3">
                <a
                  href="https://supportcall.com.au"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="text-2xl" role="img" aria-label="Australian flag">🇦🇺</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">SupportCALL Australia</div>
                    <div className="text-sm text-muted-foreground">supportcall.com.au</div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </a>
                
                <a
                  href="https://supportcall.co.za"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                >
                  <span className="text-2xl" role="img" aria-label="South African flag">🇿🇦</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">SupportCALL South Africa</div>
                    <div className="text-sm text-muted-foreground">supportcall.co.za</div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
