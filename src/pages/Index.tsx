import { useState, useRef, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { UrlInput } from '@/components/seo/UrlInput';
import { AnalysisProgress } from '@/components/seo/AnalysisProgress';
import { ResultsDashboard } from '@/components/seo/ResultsDashboard';
import { AnalysisConfig, AnalysisState, analysisStages, AnalysisStage } from '@/types/seo';
import { simulateAnalysis } from '@/lib/mock-analysis';
import { useToast } from '@/hooks/use-toast';

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
      const result = await simulateAnalysis(config, updateStage, abortControllerRef.current.signal);
      
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            SEO Analysis Portal
          </h1>
          <p className="mt-2 text-muted-foreground">
            Run a comprehensive, one-off SEO audit for any website. No data stored.
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
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
        </div>
      </div>
    </Layout>
  );
};

export default Index;
