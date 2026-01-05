import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Issue } from '@/types/seo';
import { SeverityBadge } from './SeverityBadge';

interface IssueCardProps {
  issue: Issue;
  index: number;
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);

  const copyToClipboard = async (text: string, snippetIndex: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(snippetIndex);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const categoryLabels: Record<string, string> = {
    'indexing': 'Crawl & Indexing',
    'on-page': 'On-Page SEO',
    'technical': 'Technical SEO',
    'performance': 'Performance',
    'structured-data': 'Structured Data',
    'images': 'Images & Media',
    'internal-linking': 'Internal Linking',
    'content': 'Content',
    'security': 'Security & Headers',
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="flex-shrink-0 text-sm font-medium text-muted-foreground w-6">
                  {index + 1}.
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-base font-medium leading-snug">
                    {issue.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <SeverityBadge severity={issue.severity} />
                    <span className="text-xs text-muted-foreground">
                      {categoryLabels[issue.category] || issue.category}
                    </span>
                    {issue.manualCheckRequired && (
                      <span className="inline-flex items-center gap-1 text-xs text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        Manual check
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Why It Matters */}
            <div>
              <h4 className="text-sm font-medium mb-1">Why It Matters</h4>
              <p className="text-sm text-muted-foreground">
                {issue.whyItMatters}
              </p>
            </div>

            {/* Evidence */}
            {issue.evidence.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Evidence</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                  {issue.evidence.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Affected URLs */}
            {issue.affectedUrls && issue.affectedUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">
                  Affected Pages ({issue.affectedUrls.length})
                </h4>
                <ul className="text-sm text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                  {issue.affectedUrls.slice(0, 10).map((url, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {url}
                      </a>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </li>
                  ))}
                  {issue.affectedUrls.length > 10 && (
                    <li className="text-muted-foreground">
                      ...and {issue.affectedUrls.length - 10} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Fix Steps - Platform Specific */}
            <div>
              <h4 className="text-sm font-medium mb-2">How to Fix</h4>
              {issue.platformFixSteps ? (
                <Tabs defaultValue="custom" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
                    <TabsTrigger value="custom" className="text-xs py-1.5 px-2">Custom/HTML</TabsTrigger>
                    <TabsTrigger value="wordpress" className="text-xs py-1.5 px-2">WordPress</TabsTrigger>
                    <TabsTrigger value="shopify" className="text-xs py-1.5 px-2">Shopify</TabsTrigger>
                    <TabsTrigger value="webflow" className="text-xs py-1.5 px-2">Webflow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="custom" className="mt-3">
                    <ol className="list-decimal list-outside ml-4 text-sm text-muted-foreground space-y-1.5">
                      {(issue.platformFixSteps.custom || issue.fixSteps).map((step, i) => (
                        <li key={i} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </TabsContent>
                  <TabsContent value="wordpress" className="mt-3">
                    <ol className="list-decimal list-outside ml-4 text-sm text-muted-foreground space-y-1.5">
                      {(issue.platformFixSteps.wordpress || issue.fixSteps).map((step, i) => (
                        <li key={i} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </TabsContent>
                  <TabsContent value="shopify" className="mt-3">
                    <ol className="list-decimal list-outside ml-4 text-sm text-muted-foreground space-y-1.5">
                      {(issue.platformFixSteps.shopify || issue.fixSteps).map((step, i) => (
                        <li key={i} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </TabsContent>
                  <TabsContent value="webflow" className="mt-3">
                    <ol className="list-decimal list-outside ml-4 text-sm text-muted-foreground space-y-1.5">
                      {(issue.platformFixSteps.webflow || issue.fixSteps).map((step, i) => (
                        <li key={i} className="pl-1">{step}</li>
                      ))}
                    </ol>
                  </TabsContent>
                </Tabs>
              ) : (
                <ol className="list-decimal list-outside ml-4 text-sm text-muted-foreground space-y-1.5">
                  {issue.fixSteps.map((step, i) => (
                    <li key={i} className="pl-1">{step}</li>
                  ))}
                </ol>
              )}
            </div>

            {/* Code Snippets */}
            {issue.snippets && issue.snippets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Code Snippets</h4>
                <div className="space-y-2">
                  {issue.snippets.map((snippet, i) => (
                    <div key={i} className="relative">
                      <pre className="code-snippet text-xs">
                        <code>{snippet}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => copyToClipboard(snippet, i)}
                      >
                        {copiedSnippet === i ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Steps */}
            <div>
              <h4 className="text-sm font-medium mb-1">How to Verify</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-0.5">
                {issue.verifySteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            {/* Mistakes to Avoid */}
            {issue.mistakesToAvoid && issue.mistakesToAvoid.length > 0 && (
              <div className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Mistakes to Avoid
                </h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                  {issue.mistakesToAvoid.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
