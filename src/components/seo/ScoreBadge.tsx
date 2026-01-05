import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const getScoreClass = (score: number) => {
    if (score >= 90) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-fair';
    if (score >= 30) return 'score-poor';
    return 'score-critical';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  };

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-14 w-14 text-lg',
    lg: 'h-20 w-20 text-2xl',
  };

  const maxScoreSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-bold',
            sizeClasses[size],
            getScoreClass(score)
          )}
        >
          {score}
        </div>
        <span className={cn('font-black text-muted-foreground', maxScoreSizes[size])}>
          /100
        </span>
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground">
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
