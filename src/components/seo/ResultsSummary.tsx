import { AlertCircle, AlertTriangle, Info, CheckCircle2, FileText, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResult } from '@/types/seo';
import { ScoreBadge } from './ScoreBadge';

interface ResultsSummaryProps {
  result: AnalysisResult;
}

export function ResultsSummary({ result }: ResultsSummaryProps) {
  const { summary, score, scoreBreakdown } = result;

  const statCards = [
    {
      label: 'Pages Analyzed',
      value: summary.pagesAnalyzed,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Critical Issues',
      value: summary.criticalIssues,
      icon: AlertCircle,
      color: 'text-destructive',
    },
    {
      label: 'High Priority',
      value: summary.highIssues,
      icon: AlertTriangle,
      color: 'text-high',
    },
    {
      label: 'Medium Priority',
      value: summary.mediumIssues,
      icon: Info,
      color: 'text-medium',
    },
    {
      label: 'Low Priority',
      value: summary.lowIssues,
      icon: CheckCircle2,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score and URL */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <h3 className="text-lg font-medium">{result.config.url}</h3>
            <p className="text-sm text-muted-foreground">
              Analyzed {summary.pagesAnalyzed} pages • {summary.totalIssues} issues found
            </p>
          </div>
          <ScoreBadge score={score} size="lg" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-3 text-center"
            >
              <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Score Breakdown */}
        <div>
          <h4 className="text-sm font-medium mb-2">Score Breakdown</h4>
          <div className="space-y-2">
            {scoreBreakdown.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground capitalize">
                  {category.category.replace('-', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {category.issues} issues
                  </span>
                  <span className={category.deductions > 0 ? 'text-destructive' : 'text-success'}>
                    {category.deductions > 0 ? `-${category.deductions}` : '0'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
