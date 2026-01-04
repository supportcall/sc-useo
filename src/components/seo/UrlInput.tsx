import { useState } from 'react';
import { Globe, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisConfig, defaultConfig } from '@/types/seo';

interface UrlInputProps {
  onSubmit: (config: AnalysisConfig) => void;
  isRunning: boolean;
  onCancel: () => void;
  onReset: () => void;
}

export function UrlInput({ onSubmit, isRunning, onCancel, onReset }: UrlInputProps) {
  const [config, setConfig] = useState<AnalysisConfig>(defaultConfig);
  const [competitorInput, setCompetitorInput] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [urlError, setUrlError] = useState('');

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError('URL is required');
      return false;
    }
    
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setUrlError('Only HTTP and HTTPS URLs are allowed');
        return false;
      }
      setUrlError('');
      return true;
    } catch {
      setUrlError('Please enter a valid URL');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let urlToAnalyze = config.url.trim();
    if (!urlToAnalyze.startsWith('http')) {
      urlToAnalyze = `https://${urlToAnalyze}`;
    }
    
    if (!validateUrl(urlToAnalyze)) return;
    
    onSubmit({ ...config, url: urlToAnalyze });
  };

  const addCompetitor = () => {
    if (!competitorInput.trim()) return;
    if (config.competitors.length >= 3) return;
    
    let competitorUrl = competitorInput.trim();
    if (!competitorUrl.startsWith('http')) {
      competitorUrl = `https://${competitorUrl}`;
    }
    
    try {
      new URL(competitorUrl);
      setConfig(prev => ({
        ...prev,
        competitors: [...prev.competitors, competitorUrl]
      }));
      setCompetitorInput('');
    } catch {
      // Invalid URL, ignore
    }
  };

  const removeCompetitor = (index: number) => {
    setConfig(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setCompetitorInput('');
    setUrlError('');
    setAdvancedOpen(false);
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          SEO Analysis
        </CardTitle>
        <CardDescription>
          Enter a website URL to run a comprehensive SEO audit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="text"
              placeholder="example.com"
              value={config.url}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, url: e.target.value }));
                if (urlError) validateUrl(e.target.value);
              }}
              disabled={isRunning}
              className={urlError ? 'border-destructive' : ''}
            />
            {urlError && (
              <p className="text-sm text-destructive">{urlError}</p>
            )}
          </div>

          {/* Competitor URLs */}
          <div className="space-y-2">
            <Label>Competitor URLs (optional, max 3)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="competitor.com"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                disabled={isRunning || config.competitors.length >= 3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCompetitor();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addCompetitor}
                disabled={isRunning || config.competitors.length >= 3 || !competitorInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {config.competitors.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {config.competitors.map((url, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                  >
                    {new URL(url).hostname}
                    <button
                      type="button"
                      onClick={() => removeCompetitor(i)}
                      disabled={isRunning}
                      className="ml-1 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" type="button" className="w-full justify-between">
                Advanced Options
                {advancedOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Crawl Limit */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Crawl Limit</Label>
                  <span className="text-sm text-muted-foreground">
                    {config.crawlLimit} pages
                  </span>
                </div>
                <Slider
                  value={[config.crawlLimit]}
                  onValueChange={([value]) => setConfig(prev => ({ ...prev, crawlLimit: value }))}
                  min={5}
                  max={100}
                  step={5}
                  disabled={isRunning}
                />
              </div>

              {/* Subdomain Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Subdomains</Label>
                  <p className="text-sm text-muted-foreground">
                    Crawl subdomains of the target domain
                  </p>
                </div>
                <Switch
                  checked={config.includeSubdomains}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeSubdomains: checked }))}
                  disabled={isRunning}
                />
              </div>

              {/* Sitemap Override */}
              <div className="space-y-2">
                <Label htmlFor="sitemap">Sitemap URL Override (optional)</Label>
                <Input
                  id="sitemap"
                  type="text"
                  placeholder="/sitemap.xml"
                  value={config.sitemapOverride || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, sitemapOverride: e.target.value || undefined }))}
                  disabled={isRunning}
                />
              </div>

              {/* Performance Toggles */}
              <div className="space-y-3">
                <Label>Performance Checks</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mobile</span>
                  <Switch
                    checked={config.checkMobile}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkMobile: checked }))}
                    disabled={isRunning}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Desktop</span>
                  <Switch
                    checked={config.checkDesktop}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, checkDesktop: checked }))}
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* PSI Toggle */}
              <div className="rounded-md border border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Use Google PageSpeed Insights
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sends URLs to Google for Core Web Vitals data
                    </p>
                  </div>
                  <Switch
                    checked={config.usePSI}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, usePSI: checked }))}
                    disabled={isRunning}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {isRunning ? (
              <Button
                type="button"
                variant="destructive"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel Analysis
              </Button>
            ) : (
              <>
                <Button type="submit" className="flex-1">
                  Run Analysis
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                >
                  Clear
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
