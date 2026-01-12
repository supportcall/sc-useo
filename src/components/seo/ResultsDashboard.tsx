import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, FileText, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResult, Category, Issue } from '@/types/seo';
import { ResultsSummary } from './ResultsSummary';
import { IssueCard } from './IssueCard';
import { KeywordAnalysisTab } from './KeywordAnalysisTab';
import { useToast } from '@/hooks/use-toast';
import { generatePDFReport } from '@/lib/pdf-generator';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fix-plan');

  const categoryTabs: { id: Category | 'all'; label: string }[] = [
    { id: 'indexing', label: 'Crawl & Indexing' },
    { id: 'on-page', label: 'On-Page' },
    { id: 'technical', label: 'Technical' },
    { id: 'performance', label: 'Performance' },
    { id: 'structured-data', label: 'Structured Data' },
    { id: 'images', label: 'Images' },
    { id: 'internal-linking', label: 'Internal Linking' },
    { id: 'content', label: 'Content' },
    { id: 'security', label: 'Security' },
    { id: 'marketing', label: 'Marketing & Analytics' },
    { id: 'keywords', label: 'Keywords' },
  ];

  const sortedIssues = [...result.issues].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const getIssuesByCategory = (category: Category): Issue[] => {
    return sortedIssues.filter((issue) => issue.category === category);
  };

  const exportPDF = () => {
    try {
      generatePDFReport(result);
      toast({
        title: 'PDF Ready',
        description: 'Use the print dialog to save as PDF.',
      });
    } catch (error) {
      toast({
        title: 'PDF Export Failed',
        description: (error as Error).message || 'Please allow popups and try again.',
        variant: 'destructive',
      });
    }
  };

  const exportJSON = () => {
    const data = {
      url: result.config.url,
      analyzedAt: result.startedAt.toISOString(),
      score: result.score,
      summary: result.summary,
      issues: result.issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        severity: issue.severity,
        category: issue.category,
        fixSteps: issue.fixSteps,
        verifySteps: issue.verifySteps,
      })),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'JSON Exported',
      description: 'Report downloaded successfully.',
    });
  };

  const exportCSV = () => {
    const headers = ['Issue ID', 'Title', 'Severity', 'Category', 'Affected URLs'];
    const rows = result.issues.map((issue) => [
      issue.id,
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.severity,
      issue.category,
      issue.affectedUrls?.length || 0,
    ]);
    
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-issues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'CSV Exported',
      description: 'Issue matrix downloaded successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <ResultsSummary result={result} />

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="secondary" onClick={exportPDF} className="flex-1 sm:flex-none">
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="secondary" onClick={exportJSON} className="flex-1 sm:flex-none">
              <FileJson className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
            <Button variant="secondary" onClick={exportCSV} className="flex-1 sm:flex-none">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto min-w-max justify-start gap-1 bg-transparent p-0">
            <TabsTrigger 
              value="fix-plan"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
            >
              Fix Plan ({result.issues.length})
            </TabsTrigger>
            {result.keywordAnalysis && (
              <TabsTrigger 
                value="keyword-analysis"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <Key className="mr-1 h-3 w-3" />
                Keyword Analysis
              </TabsTrigger>
            )}
            {categoryTabs.map((tab) => {
              const count = getIssuesByCategory(tab.id as Category).length;
              if (count === 0) return null;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  {tab.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="fix-plan" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Issues sorted by priority. Fix critical issues first for maximum impact.
          </p>
          {sortedIssues.map((issue, index) => (
            <IssueCard key={issue.id} issue={issue} index={index} />
          ))}
        </TabsContent>

        {result.keywordAnalysis && (
          <TabsContent value="keyword-analysis" className="mt-4">
            <KeywordAnalysisTab 
              keywordAnalysis={result.keywordAnalysis}
              geographicScope={result.config.geographicScope}
              targetLocation={result.config.targetLocation}
            />
          </TabsContent>
        )}

        {categoryTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-3">
            {getIssuesByCategory(tab.id as Category).map((issue, index) => (
              <IssueCard key={issue.id} issue={issue} index={index} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
