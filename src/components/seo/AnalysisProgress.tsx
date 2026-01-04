import { Check, Circle, Loader2, AlertCircle, SkipForward } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnalysisStage } from '@/types/seo';
import { cn } from '@/lib/utils';

interface AnalysisProgressProps {
  stages: AnalysisStage[];
  overallProgress: number;
}

export function AnalysisProgress({ stages, overallProgress }: AnalysisProgressProps) {
  const getStatusIcon = (status: AnalysisStage['status']) => {
    switch (status) {
      case 'complete':
        return <Check className="h-4 w-4 text-success" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'skipped':
        return <SkipForward className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: AnalysisStage['status']) => {
    switch (status) {
      case 'complete':
        return 'stage-complete';
      case 'running':
        return 'stage-running';
      case 'error':
        return 'stage-error';
      default:
        return 'stage-pending';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Analysis Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={overallProgress} className="h-2" />
        
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={cn(
                'flex items-start gap-3 rounded-md px-2 py-1.5',
                stage.status === 'running' && 'bg-muted'
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getStatusIcon(stage.status)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm', getStatusClass(stage.status))}>
                    {index + 1}. {stage.name}
                  </span>
                  {stage.progress !== undefined && stage.status === 'running' && (
                    <span className="text-xs text-muted-foreground">
                      {stage.progress}%
                    </span>
                  )}
                </div>
                {stage.message && (
                  <p className="text-xs text-muted-foreground truncate">
                    {stage.message}
                  </p>
                )}
                {stage.error && (
                  <p className="text-xs text-destructive">
                    {stage.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
