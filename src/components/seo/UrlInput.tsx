import { useState } from 'react';
import { Globe, Plus, X, ChevronDown, ChevronUp, Check, MapPin, Key, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalysisConfig, defaultConfig, checkCategories, CheckCategory, geographicScopes, GeographicScope } from '@/types/seo';

interface UrlInputProps {
  onSubmit: (config: AnalysisConfig) => void;
  isRunning: boolean;
  onCancel: () => void;
  onReset: () => void;
}

// Default reference competitor for keyword analysis
const UBERSUGGEST_URL = 'https://neilpatel.com/';

export function UrlInput({ onSubmit, isRunning, onCancel, onReset }: UrlInputProps) {
  const [config, setConfig] = useState<AnalysisConfig>(defaultConfig);
  const [competitorInput, setCompetitorInput] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [keywordSettingsOpen, setKeywordSettingsOpen] = useState(true);
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
    setKeywordSettingsOpen(true);
    onReset();
  };

  const showLocationInput = config.geographicScope === 'state' || config.geographicScope === 'regional';

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
            <p className="text-xs text-muted-foreground">
              Add competitor sites to analyze their keywords. Ubersuggest (neilpatel.com) is used as a reference.
            </p>
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

          {/* Keyword Analysis Settings */}
          <Collapsible open={keywordSettingsOpen} onOpenChange={setKeywordSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Keyword Analysis Settings
                  <Sparkles className="h-3 w-3 text-primary" />
                </span>
                {keywordSettingsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Enable Keyword Analysis */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    Enable Keyword Analysis
                    <Sparkles className="h-3 w-3 text-primary" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Extract keywords from your site and competitors, get suggestions
                  </p>
                </div>
                <Switch
                  checked={config.enableKeywordAnalysis}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableKeywordAnalysis: checked }))}
                  disabled={isRunning}
                />
              </div>

              {config.enableKeywordAnalysis && (
                <>
                  {/* Geographic Scope */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Label>Geographic Targeting Scope</Label>
                    </div>
                    <Select
                      value={config.geographicScope}
                      onValueChange={(value: GeographicScope) => setConfig(prev => ({ ...prev, geographicScope: value }))}
                      disabled={isRunning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select geographic scope" />
                      </SelectTrigger>
                      <SelectContent>
                        {geographicScopes.map((scope) => (
                          <SelectItem key={scope.id} value={scope.id}>
                            <div className="flex flex-col">
                              <span>{scope.label}</span>
                              <span className="text-xs text-muted-foreground">{scope.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Location (for state/regional) */}
                  {showLocationInput && (
                    <div className="space-y-2">
                      <Label htmlFor="targetLocation">
                        Target Location {config.geographicScope === 'state' ? '(State/Province)' : '(City/Region)'}
                      </Label>
                      <Input
                        id="targetLocation"
                        type="text"
                        placeholder={config.geographicScope === 'state' ? 'e.g., California, Ontario' : 'e.g., Los Angeles, Toronto'}
                        value={config.targetLocation || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, targetLocation: e.target.value || undefined }))}
                        disabled={isRunning}
                      />
                      <p className="text-xs text-muted-foreground">
                        Helps identify location-specific keywords and competitors
                      </p>
                    </div>
                  )}

                  {/* Reference Info */}
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-muted-foreground">Keyword Analysis Includes:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Extract top keywords from your site pages</li>
                      <li>• Analyze competitor keyword strategies</li>
                      <li>• Identify keyword gaps and opportunities</li>
                      <li>• Suggest high-value keywords based on {config.geographicScope} targeting</li>
                      <li>• Compare against Ubersuggest methodology</li>
                    </ul>
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* SEO Check Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">SEO Checks to Run</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, selectedCategories: checkCategories.map(c => c.id) }))}
                  disabled={isRunning}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, selectedCategories: [] }))}
                  disabled={isRunning}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* SEO Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">SEO & Technical</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {checkCategories
                  .filter(cat => cat.group === 'seo')
                  .map(cat => (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                        config.selectedCategories.includes(cat.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <Checkbox
                        checked={config.selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({
                            ...prev,
                            selectedCategories: checked
                              ? [...prev.selectedCategories, cat.id]
                              : prev.selectedCategories.filter(id => id !== cat.id)
                          }));
                        }}
                        disabled={isRunning}
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium leading-none">{cat.label}</span>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            {/* Security Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Security & Reputation</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {checkCategories
                  .filter(cat => cat.group === 'security')
                  .map(cat => (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                        config.selectedCategories.includes(cat.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <Checkbox
                        checked={config.selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({
                            ...prev,
                            selectedCategories: checked
                              ? [...prev.selectedCategories, cat.id]
                              : prev.selectedCategories.filter(id => id !== cat.id)
                          }));
                        }}
                        disabled={isRunning}
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium leading-none">{cat.label}</span>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            {/* Marketing & Analytics Categories */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Marketing & Analytics</h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {checkCategories
                  .filter(cat => cat.group === 'marketing')
                  .map(cat => (
                    <label
                      key={cat.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                        config.selectedCategories.includes(cat.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <Checkbox
                        checked={config.selectedCategories.includes(cat.id)}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({
                            ...prev,
                            selectedCategories: checked
                              ? [...prev.selectedCategories, cat.id]
                              : prev.selectedCategories.filter(id => id !== cat.id)
                          }));
                        }}
                        disabled={isRunning}
                      />
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium leading-none">{cat.label}</span>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {config.selectedCategories.length} of {checkCategories.length} checks selected
            </p>
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
