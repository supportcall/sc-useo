// Mock analysis data for demonstration
// In production, this would be replaced by actual analysis from edge functions

import { AnalysisResult, Issue, AnalysisConfig, AnalysisStage } from '@/types/seo';

export function createMockResult(config: AnalysisConfig): AnalysisResult {
  const issues: Issue[] = [
    {
      id: 'missing-meta-description',
      title: 'Missing or empty meta description',
      severity: 'high',
      category: 'on-page',
      whyItMatters: 'Meta descriptions appear in search results and influence click-through rates. Pages without descriptions may show random text snippets, reducing clicks.',
      evidence: ['Homepage has no meta description tag', '3 additional pages missing descriptions'],
      affectedUrls: [config.url, `${config.url}/about`, `${config.url}/contact`, `${config.url}/services`],
      fixSteps: [
        'Add a unique meta description to each page',
        'Keep descriptions between 150-160 characters',
        'Include primary keywords naturally',
        'Write compelling copy that encourages clicks',
      ],
      platformFixSteps: {
        wordpress: [
          'Install Yoast SEO or Rank Math plugin',
          'Edit each page and scroll to the SEO meta box',
          'Enter your meta description in the "Meta description" field',
          'Save and check preview',
        ],
        shopify: [
          'Go to Online Store > Pages or Products',
          'Click on the page to edit',
          'Scroll to "Search engine listing preview" and click Edit',
          'Enter description and save',
        ],
        webflow: [
          'Select the page in the Pages panel',
          'Open Page Settings (gear icon)',
          'Enter description in "Meta Description" field',
          'Publish changes',
        ],
        custom: [
          'Add <meta name="description" content="Your description here"> to the <head> section',
          'Ensure each page has a unique description',
          'Server-render the tag for proper indexing',
        ],
      },
      snippets: [
        '<meta name="description" content="Your compelling page description here. Keep it under 160 characters and include your main keyword.">',
      ],
      verifySteps: [
        'View page source and confirm meta description tag exists',
        'Use Google Search Console URL Inspection tool',
        'Check that description appears in search results preview',
      ],
      mistakesToAvoid: [
        'Do not duplicate descriptions across pages',
        'Do not stuff keywords unnaturally',
        'Do not exceed 160 characters (truncation in SERPs)',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'missing-h1',
      title: 'Page missing H1 heading',
      severity: 'high',
      category: 'on-page',
      whyItMatters: 'H1 is the main heading that tells search engines and users what the page is about. Missing H1 can hurt rankings and accessibility.',
      evidence: ['About page has no H1 tag', 'Contact page uses H2 as first heading'],
      affectedUrls: [`${config.url}/about`, `${config.url}/contact`],
      fixSteps: [
        'Add exactly one H1 tag per page',
        'Place it near the top of the main content',
        'Include primary keyword in the H1',
        'Make it descriptive and unique for each page',
      ],
      snippets: ['<h1>Your Main Page Heading</h1>'],
      verifySteps: [
        'Inspect page source for <h1> tag',
        'Confirm only one H1 exists per page',
        'Verify H1 matches page topic',
      ],
      mistakesToAvoid: [
        'Do not use multiple H1 tags on one page',
        'Do not hide H1 with CSS',
        'Do not use logo as the only H1',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'missing-canonical',
      title: 'Missing canonical tags',
      severity: 'critical',
      category: 'indexing',
      whyItMatters: 'Canonical tags tell search engines which URL is the preferred version. Without them, duplicate content issues can dilute ranking signals.',
      evidence: ['5 pages have no canonical tag', 'Query parameters create duplicate URLs'],
      affectedUrls: [config.url, `${config.url}/blog`, `${config.url}/products`, `${config.url}/about`, `${config.url}/services`],
      fixSteps: [
        'Add canonical tag to every indexable page',
        'Self-reference canonical for unique pages',
        'Point to preferred URL for duplicates',
        'Use absolute URLs, not relative',
      ],
      snippets: [
        '<link rel="canonical" href="https://example.com/page-url">',
      ],
      verifySteps: [
        'Check page source for canonical tag in <head>',
        'Verify canonical URL is correct and accessible',
        'Use Google Search Console to check canonicalization',
      ],
      mistakesToAvoid: [
        'Do not canonical to a 404 or redirect page',
        'Do not use relative URLs',
        'Do not have conflicting canonicals',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'slow-lcp',
      title: 'Largest Contentful Paint (LCP) needs improvement',
      severity: 'medium',
      category: 'performance',
      whyItMatters: 'LCP measures loading performance. Google uses Core Web Vitals as a ranking factor. Poor LCP can hurt rankings and user experience.',
      evidence: ['Estimated LCP > 2.5s based on resource analysis', 'Large hero image without optimization'],
      fixSteps: [
        'Identify the LCP element (usually hero image or heading)',
        'Optimize images with modern formats (WebP, AVIF)',
        'Add preload hint for LCP image',
        'Reduce server response time',
        'Eliminate render-blocking resources',
      ],
      snippets: [
        '<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">',
        '<img src="/hero.webp" loading="eager" fetchpriority="high" alt="Hero">',
      ],
      verifySteps: [
        'Run PageSpeed Insights and check LCP score',
        'Aim for LCP under 2.5 seconds',
        'Test on 3G throttled connection',
      ],
      manualCheckRequired: true,
    },
    {
      id: 'images-missing-alt',
      title: 'Images missing alt text',
      severity: 'medium',
      category: 'images',
      whyItMatters: 'Alt text helps search engines understand images and is essential for accessibility. Missing alt text is a missed SEO opportunity.',
      evidence: ['12 images found without alt attributes', 'Product images lack descriptive alt text'],
      affectedUrls: [config.url, `${config.url}/products`],
      fixSteps: [
        'Add descriptive alt text to all meaningful images',
        'Use empty alt="" for decorative images',
        'Include keywords naturally when relevant',
        'Keep alt text under 125 characters',
      ],
      snippets: [
        '<img src="product.jpg" alt="Blue running shoes - Nike Air Max 2024">',
        '<img src="decorative-line.svg" alt="">',
      ],
      verifySteps: [
        'Audit all <img> tags for alt attributes',
        'Review alt text for accuracy and relevance',
        'Test with screen reader if possible',
      ],
      mistakesToAvoid: [
        'Do not use "image of" or "photo of" prefixes',
        'Do not stuff keywords',
        'Do not leave alt completely empty for important images',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'missing-robots-txt',
      title: 'robots.txt file not found or misconfigured',
      severity: 'high',
      category: 'indexing',
      whyItMatters: 'robots.txt controls which pages search engines can crawl. Missing or misconfigured robots.txt can lead to indexing issues.',
      evidence: ['No robots.txt found at /robots.txt', 'Sitemap URL not declared'],
      fixSteps: [
        'Create robots.txt file at website root',
        'Add User-agent and Disallow rules as needed',
        'Include Sitemap directive',
        'Test with Google Search Console robots.txt tester',
      ],
      snippets: [
        `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml`,
      ],
      verifySteps: [
        'Access yoursite.com/robots.txt directly',
        'Verify sitemap URL is correct',
        'Use Google Search Console robots tester',
      ],
      mistakesToAvoid: [
        'Do not block CSS or JS files needed for rendering',
        'Do not accidentally block important content',
        'Do not forget trailing slashes for directories',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'missing-structured-data',
      title: 'No structured data detected',
      severity: 'low',
      category: 'structured-data',
      whyItMatters: 'Structured data helps search engines understand your content and can enable rich results like stars, prices, and FAQs in search listings.',
      evidence: ['No JSON-LD structured data found', 'No Organization or WebSite schema'],
      fixSteps: [
        'Add Organization schema to homepage',
        'Add WebSite schema with search action if applicable',
        'Add relevant schemas for content types (Article, Product, LocalBusiness, etc.)',
        'Validate with Google Rich Results Test',
      ],
      snippets: [
        `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
</script>`,
      ],
      verifySteps: [
        'Use Google Rich Results Test',
        'Check for errors in Schema Markup Validator',
        'Monitor rich results in Search Console',
      ],
      manualCheckRequired: false,
    },
    {
      id: 'no-https-redirect',
      title: 'HTTP to HTTPS redirect not detected',
      severity: 'critical',
      category: 'security',
      whyItMatters: 'HTTPS is a ranking signal and essential for security. HTTP pages may show "Not Secure" warnings, hurting trust and conversions.',
      evidence: ['HTTP version accessible without redirect', 'Mixed content may be present'],
      fixSteps: [
        'Ensure SSL certificate is installed and valid',
        'Configure server to redirect all HTTP to HTTPS',
        'Update internal links to use HTTPS',
        'Check for mixed content issues',
      ],
      snippets: [
        `# Apache .htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
        `# Nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}`,
      ],
      verifySteps: [
        'Visit http://yoursite.com and verify redirect to https://',
        'Check SSL certificate validity (padlock icon)',
        'Run SSL test at ssllabs.com/ssltest',
      ],
      manualCheckRequired: true,
    },
  ];

  const summary = {
    pagesAnalyzed: config.crawlLimit,
    totalIssues: issues.length,
    criticalIssues: issues.filter((i) => i.severity === 'critical').length,
    highIssues: issues.filter((i) => i.severity === 'high').length,
    mediumIssues: issues.filter((i) => i.severity === 'medium').length,
    lowIssues: issues.filter((i) => i.severity === 'low').length,
  };

  // Calculate score
  let score = 100;
  const deductions: Record<string, number> = {};
  
  issues.forEach((issue) => {
    const category = issue.category;
    const deduction = 
      issue.severity === 'critical' ? 12 :
      issue.severity === 'high' ? 6 :
      issue.severity === 'medium' ? 3 : 1;
    
    deductions[category] = (deductions[category] || 0) + deduction;
    score -= deduction;
  });

  const scoreBreakdown = Object.entries(deductions).map(([category, deduction]) => ({
    category,
    deductions: deduction,
    maxDeduction: 25,
    issues: issues.filter((i) => i.category === category).length,
  }));

  return {
    config,
    startedAt: new Date(),
    completedAt: new Date(),
    score: Math.max(0, score),
    scoreBreakdown,
    homepage: {
      url: config.url,
      status: 200,
      title: 'Example Website - Home',
      titleLength: 22,
      metaDescription: undefined,
      metaDescriptionLength: 0,
      h1Count: 1,
      h1Text: 'Welcome to Example',
      canonical: config.url,
      metaRobots: 'index, follow',
      hasViewport: true,
      hasLang: true,
      langValue: 'en',
      hasOpenGraph: false,
      hasTwitterCards: false,
      hasJsonLd: false,
      wordCount: 850,
      internalLinks: 15,
      externalLinks: 3,
      imagesWithoutAlt: 4,
      totalImages: 12,
    },
    robots: {
      found: false,
      sitemapUrls: [],
      blockedPaths: [],
      errors: ['robots.txt not found'],
    },
    sitemaps: [],
    pages: [],
    crawlResults: [],
    issues,
    summary,
  };
}

export function simulateAnalysis(
  config: AnalysisConfig,
  updateStage: (stageId: string, updates: Partial<AnalysisStage>) => void,
  signal: AbortSignal
): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    const stages = [
      { id: 'validate', duration: 500 },
      { id: 'homepage', duration: 1000 },
      { id: 'robots', duration: 800 },
      { id: 'crawl', duration: 2000 },
      { id: 'onpage', duration: 1500 },
      { id: 'technical', duration: 1000 },
      { id: 'performance', duration: config.usePSI ? 2000 : 500 },
      { id: 'score', duration: 500 },
    ];

    let currentIndex = 0;

    const runNextStage = () => {
      if (signal.aborted) {
        reject(new Error('Analysis cancelled'));
        return;
      }

      if (currentIndex >= stages.length) {
        resolve(createMockResult(config));
        return;
      }

      const stage = stages[currentIndex];
      updateStage(stage.id, { status: 'running', progress: 0 });

      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(progressInterval);
          return;
        }
        progress += 10;
        updateStage(stage.id, { progress: Math.min(progress, 90) });
      }, stage.duration / 10);

      setTimeout(() => {
        clearInterval(progressInterval);
        if (signal.aborted) return;
        
        updateStage(stage.id, { status: 'complete', progress: 100 });
        currentIndex++;
        runNextStage();
      }, stage.duration);
    };

    runNextStage();
  });
}
