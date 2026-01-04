// Real SEO Analysis - calls edge function
import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult, AnalysisConfig, AnalysisStage } from '@/types/seo';

export async function runAnalysis(
  config: AnalysisConfig,
  updateStage: (stageId: string, updates: Partial<AnalysisStage>) => void,
  signal: AbortSignal
): Promise<AnalysisResult> {
  const stages = [
    { id: 'validate', name: 'Validating URL' },
    { id: 'homepage', name: 'Fetching homepage' },
    { id: 'robots', name: 'Checking robots.txt' },
    { id: 'crawl', name: 'Crawling pages' },
    { id: 'onpage', name: 'On-page analysis' },
    { id: 'technical', name: 'Technical checks' },
    { id: 'performance', name: 'Performance checks' },
    { id: 'score', name: 'Building Fix Plan' },
  ];

  // Helper to update multiple stages
  const setStageRunning = (id: string) => {
    updateStage(id, { status: 'running', progress: 0 });
  };
  
  const setStageComplete = (id: string) => {
    updateStage(id, { status: 'complete', progress: 100 });
  };
  
  const setStageError = (id: string, error: string) => {
    updateStage(id, { status: 'error', error });
  };

  try {
    // Stage 1: Validate
    if (signal.aborted) throw new Error('Analysis cancelled');
    setStageRunning('validate');
    
    // Validate URL format locally first
    try {
      new URL(config.url);
    } catch {
      setStageError('validate', 'Invalid URL format');
      throw new Error('Invalid URL format. Please enter a valid URL including https://');
    }
    
    setStageComplete('validate');

    // Stage 2-7: Run full analysis via edge function
    if (signal.aborted) throw new Error('Analysis cancelled');
    setStageRunning('homepage');
    
    // Simulate progress for the analysis stages while waiting
    const progressInterval = setInterval(() => {
      if (signal.aborted) {
        clearInterval(progressInterval);
        return;
      }
    }, 500);

    try {
      console.log('[seo-analysis] Calling edge function with config:', config);
      
      const { data, error } = await supabase.functions.invoke('seo-analyze', {
        body: { config },
      });

      clearInterval(progressInterval);

      if (signal.aborted) throw new Error('Analysis cancelled');

      if (error) {
        console.error('[seo-analysis] Edge function error:', error);
        setStageError('homepage', error.message);
        throw new Error(`Analysis failed: ${error.message}`);
      }

      if (!data.success) {
        console.error('[seo-analysis] Analysis failed:', data.error);
        setStageError('homepage', data.error);
        throw new Error(data.error || 'Analysis failed');
      }

      // Mark all stages complete
      setStageComplete('homepage');
      setStageComplete('robots');
      setStageComplete('crawl');
      setStageComplete('onpage');
      setStageComplete('technical');
      setStageComplete('performance');
      setStageComplete('score');

      // Parse dates from result
      const result = data.result as AnalysisResult;
      result.startedAt = new Date(result.startedAt);
      result.completedAt = result.completedAt ? new Date(result.completedAt) : undefined;

      console.log('[seo-analysis] Analysis complete:', result.summary);
      return result;

    } catch (fetchError) {
      clearInterval(progressInterval);
      throw fetchError;
    }

  } catch (error) {
    if ((error as Error).message === 'Analysis cancelled') {
      throw error;
    }
    console.error('[seo-analysis] Error:', error);
    throw error;
  }
}
