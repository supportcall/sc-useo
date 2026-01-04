// Self-contained SEO Analysis Edge Function
// Free, open source, no external API dependencies

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisConfig {
  url: string;
  crawlLimit: number;
  includeSubdomains: boolean;
  usePSI: boolean;
}

interface PageAnalysis {
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

interface RobotsInfo {
  found: boolean;
  content?: string;
  sitemapUrls: string[];
  blockedPaths: string[];
  errors: string[];
}

interface SitemapInfo {
  url: string;
  urlCount: number;
  errors: string[];
  lastModified?: string;
}

interface Issue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  whyItMatters: string;
  evidence: string[];
  affectedUrls?: string[];
  fixSteps: string[];
  platformFixSteps?: {
    wordpress?: string[];
    shopify?: string[];
    webflow?: string[];
    custom?: string[];
  };
  snippets?: string[];
  verifySteps: string[];
  mistakesToAvoid?: string[];
  manualCheckRequired: boolean;
}

// Helper: Parse HTML to extract SEO elements
function parseHTML(html: string, baseUrl: string): PageAnalysis {
  const url = new URL(baseUrl);
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;
  
  // Extract meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDescription = descMatch ? descMatch[1].trim() : undefined;
  
  // Count H1s and extract first
  const h1Matches = html.match(/<h1[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/h1>/gi) || [];
  const h1Count = h1Matches.length;
  const firstH1 = h1Matches[0];
  const h1Text = firstH1 ? firstH1.replace(/<[^>]+>/g, '').trim() : undefined;
  
  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i) ||
                         html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : undefined;
  
  // Extract meta robots
  const robotsMatch = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i);
  const metaRobots = robotsMatch ? robotsMatch[1] : undefined;
  
  // Check viewport
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  
  // Check lang
  const langMatch = html.match(/<html[^>]+lang=["']([^"']*)["']/i);
  const hasLang = !!langMatch;
  const langValue = langMatch ? langMatch[1] : undefined;
  
  // Check Open Graph
  const hasOpenGraph = /<meta[^>]+property=["']og:/i.test(html);
  
  // Check Twitter Cards
  const hasTwitterCards = /<meta[^>]+name=["']twitter:/i.test(html);
  
  // Check JSON-LD
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi) || [];
  const hasJsonLd = jsonLdMatches.length > 0;
  const jsonLdTypes: string[] = [];
  jsonLdMatches.forEach(match => {
    try {
      const json = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
      const parsed = JSON.parse(json);
      if (parsed['@type']) jsonLdTypes.push(parsed['@type']);
    } catch { /* ignore parse errors */ }
  });
  
  // Count words (rough estimate from body text)
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '')
                                           .replace(/<style[\s\S]*?<\/style>/gi, '')
                                           .replace(/<[^>]+>/g, ' ')
                                           .replace(/\s+/g, ' ')
                                           .trim() : '';
  const wordCount = bodyText.split(' ').filter(w => w.length > 0).length;
  
  // Count links
  const linkMatches = html.match(/<a[^>]+href=["']([^"']*)["']/gi) || [];
  let internalLinks = 0;
  let externalLinks = 0;
  linkMatches.forEach(link => {
    const hrefMatch = link.match(/href=["']([^"']*)["']/i);
    if (hrefMatch) {
      const href = hrefMatch[1];
      if (href.startsWith('/') || href.startsWith('#') || href.includes(url.hostname)) {
        internalLinks++;
      } else if (href.startsWith('http')) {
        externalLinks++;
      }
    }
  });
  
  // Count images and check alt
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const totalImages = imgMatches.length;
  let imagesWithoutAlt = 0;
  imgMatches.forEach(img => {
    if (!img.match(/alt=["'][^"']+["']/i)) {
      imagesWithoutAlt++;
    }
  });
  
  return {
    url: baseUrl,
    status: 200,
    title,
    titleLength: title?.length,
    metaDescription,
    metaDescriptionLength: metaDescription?.length,
    h1Count,
    h1Text,
    canonical,
    metaRobots,
    hasViewport,
    hasLang,
    langValue,
    hasOpenGraph,
    hasTwitterCards,
    hasJsonLd,
    jsonLdTypes: jsonLdTypes.length > 0 ? jsonLdTypes : undefined,
    wordCount,
    internalLinks,
    externalLinks,
    imagesWithoutAlt,
    totalImages,
  };
}

// Helper: Fetch robots.txt
async function fetchRobots(baseUrl: string): Promise<RobotsInfo> {
  const url = new URL(baseUrl);
  const robotsUrl = `${url.protocol}//${url.hostname}/robots.txt`;
  
  try {
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'SupportCALL-SEO-Analyzer/1.0' },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return {
        found: false,
        sitemapUrls: [],
        blockedPaths: [],
        errors: [`robots.txt returned status ${response.status}`],
      };
    }
    
    const content = await response.text();
    const sitemapUrls: string[] = [];
    const blockedPaths: string[] = [];
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('sitemap:')) {
        sitemapUrls.push(trimmed.substring(8).trim());
      }
      if (trimmed.toLowerCase().startsWith('disallow:')) {
        const path = trimmed.substring(9).trim();
        if (path) blockedPaths.push(path);
      }
    });
    
    return {
      found: true,
      content,
      sitemapUrls,
      blockedPaths,
      errors: [],
    };
  } catch (error) {
    return {
      found: false,
      sitemapUrls: [],
      blockedPaths: [],
      errors: [(error as Error).message],
    };
  }
}

// Helper: Fetch sitemap
async function fetchSitemap(sitemapUrl: string): Promise<SitemapInfo> {
  try {
    const response = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'SupportCALL-SEO-Analyzer/1.0' },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      return {
        url: sitemapUrl,
        urlCount: 0,
        errors: [`Sitemap returned status ${response.status}`],
      };
    }
    
    const content = await response.text();
    const urlMatches = content.match(/<loc>([^<]+)<\/loc>/gi) || [];
    
    return {
      url: sitemapUrl,
      urlCount: urlMatches.length,
      errors: [],
    };
  } catch (error) {
    return {
      url: sitemapUrl,
      urlCount: 0,
      errors: [(error as Error).message],
    };
  }
}

// Helper: Extract internal URLs from HTML
function extractInternalUrls(html: string, baseUrl: string): string[] {
  const url = new URL(baseUrl);
  const urls: Set<string> = new Set();
  
  const linkMatches = html.match(/<a[^>]+href=["']([^"']*)["']/gi) || [];
  linkMatches.forEach(link => {
    const hrefMatch = link.match(/href=["']([^"']*)["']/i);
    if (hrefMatch) {
      let href = hrefMatch[1];
      
      // Skip anchors, javascript, mailto, tel
      if (href.startsWith('#') || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      
      // Convert relative to absolute
      if (href.startsWith('/')) {
        href = `${url.protocol}//${url.hostname}${href}`;
      } else if (!href.startsWith('http')) {
        return;
      }
      
      try {
        const parsed = new URL(href);
        // Only include same domain
        if (parsed.hostname === url.hostname) {
          // Remove hash and normalize
          parsed.hash = '';
          urls.add(parsed.toString());
        }
      } catch { /* invalid URL */ }
    }
  });
  
  return Array.from(urls);
}

// Generate issues based on analysis
function generateIssues(homepage: PageAnalysis, robots: RobotsInfo, pages: PageAnalysis[], config: AnalysisConfig): Issue[] {
  const issues: Issue[] = [];
  
  // Check meta description
  const pagesWithoutDescription = pages.filter(p => !p.metaDescription || p.metaDescription.length === 0);
  if (!homepage.metaDescription || pagesWithoutDescription.length > 0) {
    issues.push({
      id: 'missing-meta-description',
      title: 'Missing or empty meta description',
      severity: 'high',
      category: 'on-page',
      whyItMatters: 'Meta descriptions appear in search results and influence click-through rates. Pages without descriptions may show random text snippets, reducing clicks.',
      evidence: [
        ...(!homepage.metaDescription ? ['Homepage has no meta description tag'] : []),
        ...(pagesWithoutDescription.length > 0 ? [`${pagesWithoutDescription.length} page(s) missing descriptions`] : []),
      ],
      affectedUrls: [
        ...(!homepage.metaDescription ? [homepage.url] : []),
        ...pagesWithoutDescription.map(p => p.url),
      ],
      fixSteps: [
        'Add a unique meta description to each page',
        'Keep descriptions between 150-160 characters',
        'Include primary keywords naturally',
        'Write compelling copy that encourages clicks',
      ],
      platformFixSteps: {
        wordpress: ['Install Yoast SEO or Rank Math plugin', 'Edit each page and scroll to the SEO meta box', 'Enter your meta description in the "Meta description" field', 'Save and check preview'],
        shopify: ['Go to Online Store > Pages or Products', 'Click on the page to edit', 'Scroll to "Search engine listing preview" and click Edit', 'Enter description and save'],
        custom: ['Add <meta name="description" content="Your description here"> to the <head> section', 'Ensure each page has a unique description'],
      },
      snippets: ['<meta name="description" content="Your compelling page description here. Keep it under 160 characters and include your main keyword.">'],
      verifySteps: ['View page source and confirm meta description tag exists', 'Use Google Search Console URL Inspection tool'],
      manualCheckRequired: false,
    });
  }
  
  // Check title length
  if (homepage.titleLength && (homepage.titleLength < 30 || homepage.titleLength > 60)) {
    issues.push({
      id: 'title-length',
      title: homepage.titleLength < 30 ? 'Title tag too short' : 'Title tag too long',
      severity: 'medium',
      category: 'on-page',
      whyItMatters: 'Title tags should be between 30-60 characters. Too short loses keyword opportunity; too long gets truncated in search results.',
      evidence: [`Homepage title is ${homepage.titleLength} characters: "${homepage.title}"`],
      affectedUrls: [homepage.url],
      fixSteps: ['Adjust title to be between 30-60 characters', 'Include primary keyword near the beginning', 'Make it compelling and descriptive'],
      verifySteps: ['Check page source for updated title tag'],
      manualCheckRequired: false,
    });
  }
  
  // Check H1
  const pagesWithBadH1 = pages.filter(p => p.h1Count === 0 || p.h1Count > 1);
  if (homepage.h1Count === 0 || homepage.h1Count > 1 || pagesWithBadH1.length > 0) {
    issues.push({
      id: 'h1-issues',
      title: homepage.h1Count === 0 ? 'Missing H1 heading' : (homepage.h1Count > 1 ? 'Multiple H1 headings detected' : 'H1 issues on internal pages'),
      severity: 'high',
      category: 'on-page',
      whyItMatters: 'Each page should have exactly one H1 heading that describes the main topic. Missing or multiple H1s can confuse search engines.',
      evidence: [
        homepage.h1Count === 0 ? 'Homepage has no H1 tag' : (homepage.h1Count > 1 ? `Homepage has ${homepage.h1Count} H1 tags` : null),
        pagesWithBadH1.length > 0 ? `${pagesWithBadH1.length} internal pages have H1 issues` : null,
      ].filter(Boolean) as string[],
      affectedUrls: [
        ...(homepage.h1Count !== 1 ? [homepage.url] : []),
        ...pagesWithBadH1.map(p => p.url),
      ],
      fixSteps: ['Ensure exactly one H1 tag per page', 'Place H1 near the top of the main content', 'Include primary keyword in H1'],
      verifySteps: ['Inspect page source for <h1> tag', 'Confirm only one H1 exists'],
      manualCheckRequired: false,
    });
  }
  
  // Check canonical
  if (!homepage.canonical) {
    issues.push({
      id: 'missing-canonical',
      title: 'Missing canonical tag',
      severity: 'critical',
      category: 'indexing',
      whyItMatters: 'Canonical tags tell search engines which URL is the preferred version. Without them, duplicate content issues can dilute ranking signals.',
      evidence: ['Homepage has no canonical tag'],
      affectedUrls: [homepage.url],
      fixSteps: ['Add canonical tag to every indexable page', 'Self-reference canonical for unique pages', 'Use absolute URLs, not relative'],
      snippets: [`<link rel="canonical" href="${homepage.url}">`],
      verifySteps: ['Check page source for canonical tag in <head>'],
      manualCheckRequired: false,
    });
  }
  
  // Check viewport
  if (!homepage.hasViewport) {
    issues.push({
      id: 'missing-viewport',
      title: 'Missing viewport meta tag',
      severity: 'critical',
      category: 'technical',
      whyItMatters: 'The viewport meta tag is essential for mobile responsiveness. Without it, your site may not display properly on mobile devices, hurting rankings.',
      evidence: ['No viewport meta tag found'],
      affectedUrls: [homepage.url],
      fixSteps: ['Add viewport meta tag to the <head> section of all pages'],
      snippets: ['<meta name="viewport" content="width=device-width, initial-scale=1">'],
      verifySteps: ['View page source and confirm viewport tag exists'],
      manualCheckRequired: false,
    });
  }
  
  // Check lang attribute
  if (!homepage.hasLang) {
    issues.push({
      id: 'missing-lang',
      title: 'Missing HTML lang attribute',
      severity: 'medium',
      category: 'technical',
      whyItMatters: 'The lang attribute helps search engines understand the language of your content and improves accessibility for screen readers.',
      evidence: ['No lang attribute on <html> tag'],
      affectedUrls: [homepage.url],
      fixSteps: ['Add lang attribute to the <html> tag'],
      snippets: ['<html lang="en">'],
      verifySteps: ['Check that <html> tag has lang attribute'],
      manualCheckRequired: false,
    });
  }
  
  // Check robots.txt
  if (!robots.found) {
    issues.push({
      id: 'missing-robots-txt',
      title: 'robots.txt file not found',
      severity: 'high',
      category: 'indexing',
      whyItMatters: 'robots.txt controls which pages search engines can crawl. Missing robots.txt can lead to inefficient crawling.',
      evidence: robots.errors.length > 0 ? robots.errors : ['No robots.txt found at /robots.txt'],
      fixSteps: ['Create robots.txt file at website root', 'Include Sitemap directive'],
      snippets: [`User-agent: *\nAllow: /\n\nSitemap: ${new URL(config.url).origin}/sitemap.xml`],
      verifySteps: ['Access yoursite.com/robots.txt directly'],
      manualCheckRequired: false,
    });
  }
  
  // Check Open Graph
  if (!homepage.hasOpenGraph) {
    issues.push({
      id: 'missing-og',
      title: 'Missing Open Graph meta tags',
      severity: 'low',
      category: 'on-page',
      whyItMatters: 'Open Graph tags control how your content appears when shared on social media. Without them, social shares may look unappealing.',
      evidence: ['No Open Graph (og:) meta tags found'],
      affectedUrls: [homepage.url],
      fixSteps: ['Add og:title, og:description, og:image, and og:url tags'],
      snippets: [
        '<meta property="og:title" content="Your Page Title">',
        '<meta property="og:description" content="Description for social sharing">',
        '<meta property="og:image" content="https://example.com/image.jpg">',
        '<meta property="og:url" content="https://example.com/page">',
      ],
      verifySteps: ['Use Facebook Sharing Debugger to test'],
      manualCheckRequired: false,
    });
  }
  
  // Check images without alt
  const totalImagesWithoutAlt = pages.reduce((sum, p) => sum + p.imagesWithoutAlt, homepage.imagesWithoutAlt);
  if (totalImagesWithoutAlt > 0) {
    issues.push({
      id: 'images-missing-alt',
      title: 'Images missing alt text',
      severity: 'medium',
      category: 'images',
      whyItMatters: 'Alt text helps search engines understand images and is essential for accessibility. Missing alt text is a missed SEO opportunity.',
      evidence: [`${totalImagesWithoutAlt} images found without alt attributes`],
      fixSteps: ['Add descriptive alt text to all meaningful images', 'Use empty alt="" for decorative images'],
      snippets: ['<img src="product.jpg" alt="Blue running shoes - Nike Air Max 2024">'],
      verifySteps: ['Audit all <img> tags for alt attributes'],
      manualCheckRequired: false,
    });
  }
  
  // Check JSON-LD
  if (!homepage.hasJsonLd) {
    issues.push({
      id: 'missing-structured-data',
      title: 'No structured data detected',
      severity: 'low',
      category: 'structured-data',
      whyItMatters: 'Structured data helps search engines understand your content and can enable rich results in search listings.',
      evidence: ['No JSON-LD structured data found'],
      fixSteps: ['Add Organization or WebSite schema to homepage', 'Validate with Google Rich Results Test'],
      snippets: [
        `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "${homepage.url}"\n}\n</script>`,
      ],
      verifySteps: ['Use Google Rich Results Test'],
      manualCheckRequired: false,
    });
  }
  
  // Check internal linking
  if (homepage.internalLinks < 5) {
    issues.push({
      id: 'low-internal-links',
      title: 'Low internal link count on homepage',
      severity: 'medium',
      category: 'internal-linking',
      whyItMatters: 'Internal links help search engines discover content and pass authority. Too few internal links can limit crawling and indexing.',
      evidence: [`Homepage has only ${homepage.internalLinks} internal links`],
      affectedUrls: [homepage.url],
      fixSteps: ['Add more internal links to key pages', 'Use descriptive anchor text', 'Ensure important pages are linked from homepage'],
      verifySteps: ['Count internal links on homepage'],
      manualCheckRequired: false,
    });
  }
  
  // Check content length
  if (homepage.wordCount < 300) {
    issues.push({
      id: 'thin-content',
      title: 'Thin content detected',
      severity: 'medium',
      category: 'content',
      whyItMatters: 'Pages with very little content may be seen as low quality by search engines. Aim for comprehensive, valuable content.',
      evidence: [`Homepage has only ${homepage.wordCount} words`],
      affectedUrls: [homepage.url],
      fixSteps: ['Add more valuable, relevant content', 'Aim for at least 300-500 words on key pages'],
      verifySteps: ['Review content length and quality'],
      manualCheckRequired: true,
    });
  }
  
  return issues;
}

// Calculate score
function calculateScore(issues: Issue[]): { score: number; breakdown: { category: string; deductions: number; maxDeduction: number; issues: number }[] } {
  let score = 100;
  const deductions: Record<string, number> = {};
  const issueCounts: Record<string, number> = {};
  
  issues.forEach(issue => {
    const category = issue.category;
    const deduction = 
      issue.severity === 'critical' ? 12 :
      issue.severity === 'high' ? 6 :
      issue.severity === 'medium' ? 3 : 1;
    
    deductions[category] = (deductions[category] || 0) + deduction;
    issueCounts[category] = (issueCounts[category] || 0) + 1;
    score -= deduction;
  });
  
  const breakdown = Object.entries(deductions).map(([category, deduction]) => ({
    category,
    deductions: deduction,
    maxDeduction: 25,
    issues: issueCounts[category],
  }));
  
  return { score: Math.max(0, score), breakdown };
}

serve(async (req) => {
  console.log('[seo-analyze] Request received:', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { config, stage } = await req.json() as { config: AnalysisConfig; stage?: string };
    console.log('[seo-analyze] Analyzing:', config.url, 'Stage:', stage || 'full');
    
    const startedAt = new Date();
    const baseUrl = config.url.endsWith('/') ? config.url.slice(0, -1) : config.url;
    
    // Stage: Validate URL
    if (stage === 'validate') {
      try {
        new URL(baseUrl);
        return new Response(JSON.stringify({ success: true, message: 'URL validated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid URL format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Fetch homepage
    console.log('[seo-analyze] Fetching homepage...');
    let homepageHtml = '';
    let homepageStatus = 0;
    let redirectChain: string[] = [];
    
    try {
      const response = await fetch(baseUrl, {
        headers: { 'User-Agent': 'SupportCALL-SEO-Analyzer/1.0' },
        redirect: 'follow',
      });
      homepageStatus = response.status;
      homepageHtml = await response.text();
      console.log('[seo-analyze] Homepage fetched, status:', homepageStatus, 'size:', homepageHtml.length);
    } catch (error) {
      console.error('[seo-analyze] Failed to fetch homepage:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to fetch URL: ${(error as Error).message}` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Parse homepage
    const homepage = parseHTML(homepageHtml, baseUrl);
    homepage.status = homepageStatus;
    homepage.redirectChain = redirectChain.length > 0 ? redirectChain : undefined;
    
    // Fetch robots.txt
    console.log('[seo-analyze] Fetching robots.txt...');
    const robots = await fetchRobots(baseUrl);
    console.log('[seo-analyze] robots.txt found:', robots.found);
    
    // Fetch sitemaps
    const sitemaps: SitemapInfo[] = [];
    const sitemapUrls = robots.sitemapUrls.length > 0 
      ? robots.sitemapUrls 
      : [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap_index.xml`];
    
    console.log('[seo-analyze] Checking sitemaps:', sitemapUrls);
    for (const sitemapUrl of sitemapUrls.slice(0, 3)) { // Limit to 3 sitemaps
      const sitemap = await fetchSitemap(sitemapUrl);
      if (sitemap.urlCount > 0) {
        sitemaps.push(sitemap);
      }
    }
    
    // Crawl internal pages
    const pages: PageAnalysis[] = [];
    const internalUrls = extractInternalUrls(homepageHtml, baseUrl);
    const urlsToCrawl = internalUrls.slice(0, Math.min(config.crawlLimit - 1, 10)); // Limit crawl
    
    console.log('[seo-analyze] Crawling', urlsToCrawl.length, 'internal pages...');
    for (const pageUrl of urlsToCrawl) {
      try {
        const response = await fetch(pageUrl, {
          headers: { 'User-Agent': 'SupportCALL-SEO-Analyzer/1.0' },
          redirect: 'follow',
        });
        if (response.ok) {
          const html = await response.text();
          const pageAnalysis = parseHTML(html, pageUrl);
          pageAnalysis.status = response.status;
          pages.push(pageAnalysis);
        }
      } catch (error) {
        console.warn('[seo-analyze] Failed to crawl:', pageUrl, error);
      }
    }
    console.log('[seo-analyze] Crawled', pages.length, 'pages');
    
    // Generate issues
    const issues = generateIssues(homepage, robots, pages, config);
    console.log('[seo-analyze] Generated', issues.length, 'issues');
    
    // Calculate score
    const { score, breakdown } = calculateScore(issues);
    
    // Build summary
    const summary = {
      pagesAnalyzed: 1 + pages.length,
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      highIssues: issues.filter(i => i.severity === 'high').length,
      mediumIssues: issues.filter(i => i.severity === 'medium').length,
      lowIssues: issues.filter(i => i.severity === 'low').length,
    };
    
    const result = {
      config,
      startedAt,
      completedAt: new Date(),
      score,
      scoreBreakdown: breakdown,
      homepage,
      robots,
      sitemaps,
      pages,
      crawlResults: [],
      issues,
      summary,
    };
    
    console.log('[seo-analyze] Analysis complete. Score:', score);
    
    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[seo-analyze] Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
