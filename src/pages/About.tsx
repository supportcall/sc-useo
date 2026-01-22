import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      <div className="container-wide py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column - About Content */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">
              About SC-U SEO
            </h1>
            
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">SupportCALL Ultimate SEO</span> is developed by{' '}
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
            
            <p className="text-muted-foreground">
              Born from real-world web development and digital marketing experience, SC-U SEO provides developers, marketers, and business owners with a comprehensive, privacy-first SEO analysis tool. Every check is carefully designed to identify genuine issues that impact search rankings and user experience.
            </p>
            
            <p className="text-muted-foreground">
              Our philosophy is simple:{' '}
              <span className="font-semibold text-foreground">
                provide actionable insights without collecting or storing user data
              </span>
              . No subscriptions, no data harvesting, no hidden agendas.
            </p>
          </div>
          
          {/* Right Column - SupportCALL Links */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              SupportCALL ICT Solutions
            </h2>
            
            <Card className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label="Australian flag">🇦🇺</span>
                <div>
                  <div className="font-medium text-foreground">SupportCALL Australia</div>
                  <div className="text-sm text-muted-foreground">supportcall.com.au</div>
                </div>
              </div>
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors group-hover:text-foreground"
                aria-label="Visit SupportCALL Australia (opens in new tab)"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </Card>
            
            <Card className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label="South African flag">🇿🇦</span>
                <div>
                  <div className="font-medium text-foreground">SupportCALL South Africa</div>
                  <div className="text-sm text-muted-foreground">supportcall.co.za</div>
                </div>
              </div>
              <a 
                href="https://supportcall.co.za" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors group-hover:text-foreground"
                aria-label="Visit SupportCALL South Africa (opens in new tab)"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
