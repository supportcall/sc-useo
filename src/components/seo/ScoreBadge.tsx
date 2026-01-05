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
    sm: 'h-12 w-12 text-base',
    md: 'h-16 w-16 text-xl',
    lg: 'h-24 w-24 text-3xl',
  };

  const maxScoreSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline gap-0.5">
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-bold shadow-sm',
            sizeClasses[size],
            getScoreClass(score)
          )}
          role="img"
          aria-label={`SEO Score: ${score} out of 100, rated ${getScoreLabel(score)}`}
        >
          {score}
        </div>
        <span 
          className={cn(
            'font-black text-muted-foreground tracking-tight',
            maxScoreSizes[size]
          )}
          aria-hidden="true"
        >
          /100
        </span>
      </div>
      {showLabel && (
        <span className={cn('font-semibold text-muted-foreground', labelSizes[size])}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
