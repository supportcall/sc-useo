import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordAnalysis } from '@/types/seo';
import { Key, TrendingUp, Users, Lightbulb, Target } from 'lucide-react';

interface KeywordAnalysisTabProps {
  keywordAnalysis: KeywordAnalysis;
  geographicScope: string;
  targetLocation?: string;
}

export function KeywordAnalysisTab({ keywordAnalysis, geographicScope, targetLocation }: KeywordAnalysisTabProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Geographic Context */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Target className="h-4 w-4" />
        <span>
          Targeting: <strong className="text-foreground capitalize">{geographicScope}</strong>
          {targetLocation && <span> - {targetLocation}</span>}
        </span>
      </div>

      {/* Your Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="h-5 w-5" />
            Your Top Keywords
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {keywordAnalysis.siteKeywords.slice(0, 15).map((kw, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{kw.keyword}</span>
                  <div className="flex gap-1">
                    {kw.inTitle && <Badge variant="outline" className="text-xs">Title</Badge>}
                    {kw.inH1 && <Badge variant="outline" className="text-xs">H1</Badge>}
                    {kw.inMetaDescription && <Badge variant="outline" className="text-xs">Meta</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{kw.frequency}x</span>
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${kw.prominence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Suggestions */}
      {keywordAnalysis.suggestedKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Suggested Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Keywords your competitors use that could boost your {geographicScope} visibility.
            </p>
            <div className="space-y-3">
              {keywordAnalysis.suggestedKeywords.map((suggestion, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium">{suggestion.keyword}</span>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                    </div>
                    <Badge className={getDifficultyColor(suggestion.estimatedDifficulty)}>
                      {suggestion.estimatedDifficulty}
                    </Badge>
                  </div>
                  {suggestion.competitorUsing.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Used by: {suggestion.competitorUsing.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyword Gaps */}
      {keywordAnalysis.keywordGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Keyword Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Keywords competitors rank for that you're missing:
            </p>
            <div className="flex flex-wrap gap-2">
              {keywordAnalysis.keywordGaps.map((kw, i) => (
                <Badge key={i} variant="secondary">{kw}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Analysis */}
      {keywordAnalysis.competitorAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Competitor Keyword Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywordAnalysis.competitorAnalysis.map((comp, i) => (
                <div key={i} className="rounded-lg border p-3">
                  <div className="font-medium text-sm mb-2">
                    {new URL(comp.competitorUrl).hostname}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {comp.topKeywords.slice(0, 8).map((kw, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
