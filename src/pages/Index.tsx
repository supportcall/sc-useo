import { useState, useRef, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { UrlInput } from '@/components/seo/UrlInput';
import { AnalysisProgress } from '@/components/seo/AnalysisProgress';
import { ResultsDashboard } from '@/components/seo/ResultsDashboard';
import { AnalysisConfig, AnalysisState, analysisStages, AnalysisStage } from '@/types/seo';
import { runAnalysis } from '@/lib/seo-analysis';
import { useToast } from '@/hooks/use-toast';

function AboutSection() {
  return (
    <section id="about" className="py-12 border-t border-border">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* About Text */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            About SC-U SEO
          </h2>
          
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
          <h3 className="text-xl font-semibold text-foreground">
            SupportCALL ICT Solutions
          </h3>
          
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
    </section>
  );
}

const Index = () => {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [state, setState] = useState<AnalysisState>({
    status: 'idle',
    stages: analysisStages.map((s) => ({ ...s })),
    result: null,
  });

  const updateStage = useCallback((stageId: string, updates: Partial<AnalysisStage>) => {
    setState((prev) => ({
      ...prev,
      stages: prev.stages.map((s) =>
        s.id === stageId ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const handleSubmit = async (config: AnalysisConfig) => {
    // Reset state
    setState({
      status: 'running',
      stages: analysisStages.map((s) => ({ ...s, status: 'pending', progress: undefined, message: undefined, error: undefined })),
      result: null,
    });

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await runAnalysis(config, updateStage, abortControllerRef.current.signal);
      
      setState((prev) => ({
        ...prev,
        status: 'complete',
        result,
      }));

      toast({
        title: 'Analysis Complete',
        description: `Found ${result.summary.totalIssues} issues. Score: ${result.score}/100`,
      });
    } catch (error) {
      if ((error as Error).message === 'Analysis cancelled') {
        setState((prev) => ({
          ...prev,
          status: 'cancelled',
          stages: prev.stages.map((s) => 
            s.status === 'running' ? { ...s, status: 'pending' } : s
          ),
        }));
        toast({
          title: 'Analysis Cancelled',
          description: 'The analysis was stopped.',
        });
      } else {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: (error as Error).message,
        }));
        toast({
          title: 'Analysis Failed',
          description: 'An error occurred during analysis.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleReset = () => {
    setState({
      status: 'idle',
      stages: analysisStages.map((s) => ({ ...s, status: 'pending', progress: undefined, message: undefined, error: undefined })),
      result: null,
    });
  };

  const overallProgress = 
    (state.stages.filter((s) => s.status === 'complete').length / state.stages.length) * 100;

  return (
    <Layout>
      <div className="container-wide py-6 lg:py-10">
        {/* Hero Section */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            SEO Analysis Portal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Run a comprehensive, one-off SEO audit for any website. No data stored.
          </p>
        </header>

        <section className="mx-auto max-w-4xl space-y-6" aria-label="SEO Analysis Tool">
          {/* Input Form */}
          <UrlInput
            onSubmit={handleSubmit}
            isRunning={state.status === 'running'}
            onCancel={handleCancel}
            onReset={handleReset}
          />

          {/* Progress Indicator */}
          {state.status === 'running' && (
            <AnalysisProgress stages={state.stages} overallProgress={overallProgress} />
          )}

          {/* Results */}
          {state.status === 'complete' && state.result && (
            <ResultsDashboard result={state.result} />
          )}

          {/* Error State */}
          {state.status === 'error' && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">
                An error occurred during analysis. Please try again.
              </p>
            </div>
          )}

          {/* About Section - Below Run Analysis */}
          <AboutSection />
        </section>
      </div>
    </Layout>
  );
};

export default Index;
