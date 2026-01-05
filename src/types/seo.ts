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
  | 'security'
  | 'marketing';

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

export type CheckCategory = 
  | 'indexing'
  | 'meta-tags'
  | 'headings'
  | 'content'
  | 'images'
  | 'internal-linking'
  | 'structured-data'
  | 'technical'
  | 'performance'
  | 'security'
  | 'gtm'
  | 'ga4'
  | 'search-console'
  | 'clarity'
  | 'business-profile'
  | 'google-ads'
  | 'conversion-tracking'
  | 'merchant-center';

export interface CheckCategoryOption {
  id: CheckCategory;
  label: string;
  description: string;
  group: 'seo' | 'marketing';
}

export const checkCategories: CheckCategoryOption[] = [
  // SEO Categories
  { id: 'indexing', label: 'Indexing & Crawlability', description: 'robots.txt, sitemap, canonical tags', group: 'seo' },
  { id: 'meta-tags', label: 'Meta Tags', description: 'Title, description, viewport, Open Graph', group: 'seo' },
  { id: 'headings', label: 'Headings Structure', description: 'H1, H2-H6 hierarchy', group: 'seo' },
  { id: 'content', label: 'Content Quality', description: 'Word count, readability, thin content', group: 'seo' },
  { id: 'images', label: 'Image Optimization', description: 'Alt text, file sizes, formats', group: 'seo' },
  { id: 'internal-linking', label: 'Internal Linking', description: 'Link structure, orphan pages', group: 'seo' },
  { id: 'structured-data', label: 'Structured Data', description: 'JSON-LD, schema.org markup', group: 'seo' },
  { id: 'technical', label: 'Technical SEO', description: 'HTTPS, mobile-friendly, redirects', group: 'seo' },
  { id: 'performance', label: 'Performance', description: 'Page speed, Core Web Vitals', group: 'seo' },
  { id: 'security', label: 'Security', description: 'HTTPS, mixed content, headers', group: 'seo' },
  // Marketing & Analytics Categories
  { id: 'gtm', label: 'Google Tag Manager', description: 'GTM container detection', group: 'marketing' },
  { id: 'ga4', label: 'Google Analytics 4', description: 'GA4 measurement ID detection', group: 'marketing' },
  { id: 'search-console', label: 'Google Search Console', description: 'Site verification meta tag', group: 'marketing' },
  { id: 'clarity', label: 'Microsoft Clarity', description: 'Clarity tracking code detection', group: 'marketing' },
  { id: 'business-profile', label: 'Google Business Profile', description: 'LocalBusiness schema markup', group: 'marketing' },
  { id: 'google-ads', label: 'Google Ads Tag', description: 'Google Ads gtag detection', group: 'marketing' },
  { id: 'conversion-tracking', label: 'Conversion Tracking', description: 'Google Ads conversion setup', group: 'marketing' },
  { id: 'merchant-center', label: 'Merchant Center', description: 'Product schema for free listings', group: 'marketing' },
];

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
  selectedCategories: CheckCategory[];
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
  selectedCategories: checkCategories.map(c => c.id), // All selected by default
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
