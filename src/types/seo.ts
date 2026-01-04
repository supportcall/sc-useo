// SEO Analysis Types

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Category = 
  | 'indexing' 
  | 'on-page' 
  | 'technical' 
  | 'performance' 
  | 'structured-data' 
  | 'images' 
  | 'internal-linking' 
  | 'content' 
  | 'security';

export interface PlatformFixSteps {
  wordpress?: string[];
  shopify?: string[];
  webflow?: string[];
  custom?: string[];
}

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  whyItMatters: string;
  evidence: string[];
  affectedUrls?: string[];
  fixSteps: string[];
  platformFixSteps?: PlatformFixSteps;
  snippets?: string[];
  verifySteps: string[];
  mistakesToAvoid?: string[];
  manualCheckRequired: boolean;
}

export interface PageAnalysis {
  url: string;
  status: number;
  title?: string;
  titleLength?: number;
  metaDescription?: string;
  metaDescriptionLength?: number;
  h1Count: number;
  h1Text?: string;
  canonical?: string;
  metaRobots?: string;
  hasViewport: boolean;
  hasLang: boolean;
  langValue?: string;
  hasOpenGraph: boolean;
  hasTwitterCards: boolean;
  hasJsonLd: boolean;
  jsonLdTypes?: string[];
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  imagesWithoutAlt: number;
  totalImages: number;
  redirectChain?: string[];
}

export interface SitemapInfo {
  url: string;
  urlCount: number;
  errors: string[];
  lastModified?: string;
}

export interface RobotsInfo {
  found: boolean;
  content?: string;
  sitemapUrls: string[];
  blockedPaths: string[];
  errors: string[];
}

export interface CrawlResult {
  url: string;
  status: number;
  contentType?: string;
  redirectTo?: string;
  error?: string;
}

export interface AnalysisConfig {
  url: string;
  competitors: string[];
  crawlLimit: number;
  includeSubdomains: boolean;
  sitemapOverride?: string;
  locale: string;
  checkMobile: boolean;
  checkDesktop: boolean;
  usePSI: boolean;
}

export interface AnalysisStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'skipped';
  progress?: number;
  message?: string;
  error?: string;
}

export interface AnalysisResult {
  config: AnalysisConfig;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  scoreBreakdown: {
    category: string;
    deductions: number;
    maxDeduction: number;
    issues: number;
  }[];
  homepage: PageAnalysis | null;
  robots: RobotsInfo | null;
  sitemaps: SitemapInfo[];
  pages: PageAnalysis[];
  crawlResults: CrawlResult[];
  issues: Issue[];
  summary: {
    pagesAnalyzed: number;
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
  };
}

export interface AnalysisState {
  status: 'idle' | 'running' | 'complete' | 'error' | 'cancelled';
  stages: AnalysisStage[];
  result: AnalysisResult | null;
  error?: string;
}

export const defaultConfig: AnalysisConfig = {
  url: '',
  competitors: [],
  crawlLimit: 25,
  includeSubdomains: false,
  locale: 'auto',
  checkMobile: true,
  checkDesktop: true,
  usePSI: false,
};

export const analysisStages: AnalysisStage[] = [
  { id: 'validate', name: 'Normalize & validate target', status: 'pending' },
  { id: 'homepage', name: 'Fetch homepage & resolve canonical/redirects', status: 'pending' },
  { id: 'robots', name: 'robots.txt & sitemap discovery', status: 'pending' },
  { id: 'crawl', name: 'Crawl internal pages', status: 'pending' },
  { id: 'onpage', name: 'On-page analysis', status: 'pending' },
  { id: 'technical', name: 'Technical checks', status: 'pending' },
  { id: 'performance', name: 'Performance checks', status: 'pending' },
  { id: 'score', name: 'Build Fix Plan & score', status: 'pending' },
];
