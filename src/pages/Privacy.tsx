import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Eye, Trash2, Lock, Server } from 'lucide-react';

const Privacy = () => {
  return (
    <Layout>
      <div className="container-narrow py-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
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
                <strong className="text-foreground">SupportCALL Ultimate SEO</strong> is designed with privacy as a core principle. 
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
                  <span><strong className="text-foreground">Personal information:</strong> No accounts, no cookies, no tracking.</span>
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
