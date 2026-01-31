import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Eye, Trash2, Lock, Server, BarChart3, Cookie } from 'lucide-react';

const Privacy = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: January 31, 2026
        </p>

        <div className="prose prose-neutral max-w-none space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Our Privacy Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">SC-U SEO</strong> is designed with privacy as a core principle. 
                We perform <strong className="text-foreground">one-off SEO analysis</strong> without storing any of your data.
              </p>
              <p>
                Every analysis runs in isolation. When you close your browser or navigate away, 
                all analysis data is permanently gone. There is no history, no accounts, 
                and no way to retrieve past analyses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                What We Don't Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 mt-1 text-destructive flex-shrink-0" />
                  <span><strong className="text-foreground">URLs you analyze:</strong> We don't log or store the websites you audit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 mt-1 text-destructive flex-shrink-0" />
                  <span><strong className="text-foreground">HTML content:</strong> Page content fetched during analysis is processed in memory only.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 mt-1 text-destructive flex-shrink-0" />
                  <span><strong className="text-foreground">Analysis results:</strong> Your SEO reports exist only in your browser session.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 mt-1 text-destructive flex-shrink-0" />
                  <span><strong className="text-foreground">Personal information:</strong> No accounts required, no tracking cookies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trash2 className="h-4 w-4 mt-1 text-destructive flex-shrink-0" />
                  <span><strong className="text-foreground">IP addresses:</strong> We don't log visitor IPs to persistent storage.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Analytics & Session Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may use the following third-party services to understand how visitors use our site:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Google Analytics 4 (GA4):</strong> Collects anonymous usage data such as pages visited, time on site, and device type. No personally identifiable information is collected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Google Tag Manager (GTM):</strong> Manages analytics and tracking scripts. Does not collect data itself.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Microsoft Clarity:</strong> May record anonymous session replays to understand user behavior. Sensitive form fields are automatically masked.</span>
                </li>
              </ul>
              <p>
                You can opt out of Google Analytics by installing the{' '}
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Analytics Opt-out Browser Add-on
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">Essential cookies:</strong> We use minimal cookies required for the site to function. These do not track you across websites.
              </p>
              <p>
                <strong className="text-foreground">Analytics cookies:</strong> If enabled, Google Analytics and Microsoft Clarity may set cookies to track anonymous usage patterns. These help us improve the site but are not essential.
              </p>
              <p>
                <strong className="text-foreground">Remarketing:</strong> We may use Google Ads remarketing to show relevant ads to previous visitors. You can opt out via{' '}
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Ads Settings
                </a>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                What Happens During Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                When you run an analysis, our server fetches public pages from the target website 
                on your behalf. This is similar to how search engines crawl websites.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>We only access publicly available pages (no login-protected content)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>We respect robots.txt directives</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Fetched content is analyzed in memory and discarded</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Results are sent directly to your browser—nothing is saved</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Google PageSpeed Insights (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you enable the optional PageSpeed Insights feature, URLs will be sent to Google 
                for performance analysis. This is the only case where data leaves our server.
              </p>
              <p>
                <strong className="text-foreground">This feature is OFF by default.</strong> You must explicitly enable it. 
                When disabled, we provide a manual checklist instead.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Exported Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                When you export your analysis (PDF, JSON, or CSV), the file is generated in your 
                browser and downloaded directly to your device. <strong className="text-foreground">No copy is kept on our servers.</strong>
              </p>
              <p>
                Once downloaded, you are responsible for storing and securing your report.
              </p>
            </CardContent>
          </Card>

          <div className="rounded-lg border border-border bg-muted/50 p-6">
            <h3 className="font-semibold mb-2">Questions?</h3>
            <p className="text-muted-foreground">
              If you have any questions about our privacy practices, please contact us at{' '}
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                SupportCALL.com.au
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
