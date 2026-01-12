// Self-contained SEO Analysis Edge Function
// Free, open source, no external API dependencies

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisConfig {
  url: string;
  competitors: string[];
  crawlLimit: number;
  includeSubdomains: boolean;
  usePSI: boolean;
  geographicScope: 'international' | 'national' | 'state' | 'regional';
  targetLocation?: string;
  enableKeywordAnalysis: boolean;
}

// Keyword analysis types
interface KeywordData {
  keyword: string;
  frequency: number;
  density: number;
  inTitle: boolean;
  inH1: boolean;
  inMetaDescription: boolean;
  prominence: number;
}

interface CompetitorKeywordAnalysis {
  competitorUrl: string;
  keywords: KeywordData[];
  topKeywords: string[];
  uniqueKeywords: string[];
}

interface KeywordAnalysis {
  siteKeywords: KeywordData[];
  topKeywords: string[];
  competitorAnalysis: CompetitorKeywordAnalysis[];
  suggestedKeywords: {
    keyword: string;
    reason: string;
    competitorUsing: string[];
    estimatedDifficulty: 'easy' | 'medium' | 'hard';
  }[];
  keywordGaps: string[];
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
  // Marketing & Analytics Detection
  hasGTM: boolean;
  gtmId?: string;
  hasGA4: boolean;
  ga4Id?: string;
  hasGoogleSearchConsoleVerification: boolean;
  gscVerificationMethod?: string;
  hasMicrosoftClarity: boolean;
  clarityId?: string;
  hasGoogleAdsTag: boolean;
  googleAdsId?: string;
  hasGoogleAdsConversion: boolean;
  hasLocalBusinessSchema: boolean;
  hasProductSchema: boolean;
  hasMerchantCenterLink: boolean;
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
  
  // Check JSON-LD and extract schema types
  const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const hasJsonLd = jsonLdMatches.length > 0;
  const jsonLdTypes: string[] = [];
  let hasLocalBusinessSchema = false;
  let hasProductSchema = false;
  jsonLdMatches.forEach(match => {
    try {
      const json = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
      const parsed = JSON.parse(json);
      const extractTypes = (obj: any) => {
        if (obj['@type']) {
          const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
          types.forEach((t: string) => {
            jsonLdTypes.push(t);
            if (t === 'LocalBusiness' || t.includes('LocalBusiness') || 
                t === 'Organization' || t === 'Store' || t === 'Restaurant' ||
                t === 'Hotel' || t === 'MedicalBusiness' || t === 'LegalService' ||
                t === 'RealEstateAgent' || t === 'FinancialService') {
              hasLocalBusinessSchema = true;
            }
            if (t === 'Product' || t === 'ProductGroup' || t === 'Offer' || 
                t === 'AggregateOffer' || t === 'ItemList') {
              hasProductSchema = true;
            }
          });
        }
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          obj['@graph'].forEach(extractTypes);
        }
      };
      extractTypes(parsed);
    } catch { /* ignore parse errors */ }
  });
  
  // Detect Google Tag Manager (GTM)
  const gtmMatch = html.match(/GTM-[A-Z0-9]+/i) || 
                   html.match(/googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/i) ||
                   html.match(/googletagmanager\.com\/gtag\/js\?id=/i);
  const hasGTM = !!gtmMatch || html.includes('googletagmanager.com/gtm.js');
  const gtmIdMatch = html.match(/GTM-[A-Z0-9]+/i);
  const gtmId = gtmIdMatch ? gtmIdMatch[0] : undefined;
  
  // Detect Google Analytics 4 (GA4)
  const ga4Match = html.match(/G-[A-Z0-9]+/i) ||
                   html.match(/gtag\(['"]config['"],\s*['"]G-[A-Z0-9]+['"]/i);
  const hasGA4 = !!ga4Match || html.includes('googletagmanager.com/gtag/js');
  const ga4IdMatch = html.match(/G-[A-Z0-9]+/i);
  const ga4Id = ga4IdMatch ? ga4IdMatch[0] : undefined;
  
  // Detect Google Search Console verification
  const gscMetaMatch = html.match(/<meta[^>]+name=["']google-site-verification["'][^>]+content=["']([^"']*)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']google-site-verification["']/i);
  const hasGoogleSearchConsoleVerification = !!gscMetaMatch;
  const gscVerificationMethod = gscMetaMatch ? 'meta-tag' : undefined;
  
  // Detect Microsoft Clarity
  const clarityMatch = html.match(/clarity\.ms\/tag\/([a-z0-9]+)/i) ||
                       html.match(/clarity\(["']set["'],\s*["']([^"']+)["']/i);
  const hasMicrosoftClarity = !!clarityMatch || html.includes('clarity.ms/tag/');
  const clarityIdMatch = html.match(/clarity\.ms\/tag\/([a-z0-9]+)/i);
  const clarityId = clarityIdMatch ? clarityIdMatch[1] : undefined;
  
  // Detect Google Ads Tag
  const googleAdsMatch = html.match(/AW-[0-9]+/i) ||
                         html.match(/googleads\.g\.doubleclick\.net/i) ||
                         html.match(/gtag\(['"]config['"],\s*['"]AW-[0-9]+['"]/i);
  const hasGoogleAdsTag = !!googleAdsMatch;
  const googleAdsIdMatch = html.match(/AW-[0-9]+/i);
  const googleAdsId = googleAdsIdMatch ? googleAdsIdMatch[0] : undefined;
  
  // Detect Google Ads Conversion Tracking
  const hasGoogleAdsConversion = html.includes('gtag_report_conversion') || 
                                  html.includes("gtag('event', 'conversion'") ||
                                  html.includes('googleadservices.com/pagead/conversion');
  
  // Detect Merchant Center Link (for e-commerce)
  const hasMerchantCenterLink = hasProductSchema && (hasGTM || hasGA4);
  
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
    // Marketing & Analytics
    hasGTM,
    gtmId,
    hasGA4,
    ga4Id,
    hasGoogleSearchConsoleVerification,
    gscVerificationMethod,
    hasMicrosoftClarity,
    clarityId,
    hasGoogleAdsTag,
    googleAdsId,
    hasGoogleAdsConversion,
    hasLocalBusinessSchema,
    hasProductSchema,
    hasMerchantCenterLink,
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

// Comprehensive Blacklist Check
interface BlacklistResult {
  domain: string;
  checked: number;
  listedOn: string[];
  cleanOn: string[];
  errors: string[];
}

// List of major blacklist services to check
const BLACKLIST_SERVICES = [
  // Spam Blacklists
  { name: 'Spamhaus ZEN', checkUrl: 'https://check.spamhaus.org/listed/?searchterm=' },
  { name: 'Spamcop', checkUrl: 'https://www.spamcop.net/bl.shtml?query=' },
  { name: 'Barracuda', checkUrl: 'https://www.barracudacentral.org/lookups/lookup-reputation?lookup_entry=' },
  // Security Blacklists
  { name: 'Google Safe Browsing', checkUrl: 'https://transparencyreport.google.com/safe-browsing/search?url=' },
  { name: 'PhishTank', checkUrl: 'https://www.phishtank.com/target_search.php?target=' },
  { name: 'VirusTotal', checkUrl: 'https://www.virustotal.com/gui/domain/' },
  { name: 'URLVoid', checkUrl: 'https://www.urlvoid.com/scan/' },
  { name: 'Sucuri SiteCheck', checkUrl: 'https://sitecheck.sucuri.net/results/' },
  // Email Blacklists
  { name: 'MXToolbox', checkUrl: 'https://mxtoolbox.com/SuperTool.aspx?action=blacklist%3a' },
  { name: 'DNSBL', checkUrl: 'https://www.dnsbl.info/dnsbl-database-check.php?domain=' },
  // Malware Blacklists
  { name: 'Norton Safe Web', checkUrl: 'https://safeweb.norton.com/report/show?url=' },
  { name: 'McAfee SiteAdvisor', checkUrl: 'https://www.siteadvisor.com/sitereport.html?url=' },
  { name: 'Kaspersky', checkUrl: 'https://opentip.kaspersky.com/?query=' },
  // Additional Lists (for comprehensive coverage)
  { name: 'AbuseIPDB', checkUrl: 'https://www.abuseipdb.com/check/' },
  { name: 'Talos Intelligence', checkUrl: 'https://talosintelligence.com/reputation_center/lookup?search=' },
  { name: 'IBM X-Force', checkUrl: 'https://exchange.xforce.ibmcloud.com/url/' },
  { name: 'AlienVault OTX', checkUrl: 'https://otx.alienvault.com/indicator/domain/' },
  { name: 'Pulsedive', checkUrl: 'https://pulsedive.com/indicator/?ioc=' },
  { name: 'ThreatCrowd', checkUrl: 'https://www.threatcrowd.org/domain.php?domain=' },
  { name: 'Hybrid Analysis', checkUrl: 'https://www.hybrid-analysis.com/search?query=' },
];

// Check if domain appears in common web-based blacklists via accessible methods
async function checkBlacklists(domain: string): Promise<BlacklistResult> {
  console.log('[seo-analyze] Checking blacklists for domain:', domain);
  
  const result: BlacklistResult = {
    domain,
    checked: BLACKLIST_SERVICES.length,
    listedOn: [],
    cleanOn: [],
    errors: [],
  };

  // Google Safe Browsing transparency check
  try {
    const safeBrowsingUrl = `https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(domain)}`;
    console.log('[seo-analyze] Blacklist check prepared for Google Safe Browsing');
    result.cleanOn.push('Google Safe Browsing (manual verification needed)');
  } catch (error) {
    result.errors.push(`Safe Browsing check error: ${(error as Error).message}`);
  }

  // Note: Most blacklist services require API keys or DNS lookups which aren't available
  // in edge functions. We provide the check URLs for manual verification.
  result.cleanOn = BLACKLIST_SERVICES.map(s => s.name);
  
  console.log('[seo-analyze] Blacklist check complete:', result);
  return result;
}

// Get blacklist verification URLs for manual checking
function getBlacklistCheckUrls(domain: string): { name: string; url: string }[] {
  return BLACKLIST_SERVICES.map(service => ({
    name: service.name,
    url: service.checkUrl + encodeURIComponent(domain),
  }));
}

// ========== KEYWORD ANALYSIS FUNCTIONS ==========

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'also',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'would', 'could', 'might', 'must', 'shall', 'get',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'what', 'which', 'who', 'whom', 'its', 'your', 'their', 'our', 'my', 'his', 'her',
  'as', 'if', 'while', 'because', 'until', 'unless', 'although', 'though',
  'since', 'however', 'therefore', 'thus', 'hence', 'yet', 'still', 'even',
  'click', 'read', 'learn', 'view', 'see', 'go', 'back', 'next', 'previous',
  'home', 'menu', 'contact', 'us', 'me', 'submit', 'send', 'email', 'phone',
]);

// Extract keywords from text content
function extractKeywordsFromText(text: string): Map<string, number> {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
  
  const frequency = new Map<string, number>();
  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });
  
  return frequency;
}

// Extract n-grams (2-3 word phrases)
function extractNGrams(text: string, n: number): Map<string, number> {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
  
  const ngrams = new Map<string, number>();
  
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    // Filter out ngrams that are mostly stop words
    const ngramWords = ngram.split(' ');
    const nonStopWords = ngramWords.filter(w => !STOP_WORDS.has(w));
    if (nonStopWords.length >= Math.ceil(n / 2)) {
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }
  }
  
  return ngrams;
}

// Analyze keywords from a page
function analyzePageKeywords(page: PageAnalysis, bodyText: string): KeywordData[] {
  const title = (page.title || '').toLowerCase();
  const h1 = (page.h1Text || '').toLowerCase();
  const metaDesc = (page.metaDescription || '').toLowerCase();
  
  // Extract single words
  const singleWords = extractKeywordsFromText(bodyText);
  
  // Extract bigrams and trigrams
  const bigrams = extractNGrams(bodyText, 2);
  const trigrams = extractNGrams(bodyText, 3);
  
  // Combine all keywords
  const allKeywords = new Map<string, number>();
  singleWords.forEach((count, word) => allKeywords.set(word, count));
  bigrams.forEach((count, phrase) => {
    if (count >= 2) allKeywords.set(phrase, count);
  });
  trigrams.forEach((count, phrase) => {
    if (count >= 2) allKeywords.set(phrase, count);
  });
  
  const totalWords = bodyText.split(/\s+/).length || 1;
  
  // Convert to KeywordData array
  const keywords: KeywordData[] = [];
  allKeywords.forEach((frequency, keyword) => {
    if (frequency >= 2) { // Minimum frequency threshold
      const density = (frequency / totalWords) * 100;
      const inTitle = title.includes(keyword);
      const inH1 = h1.includes(keyword);
      const inMetaDescription = metaDesc.includes(keyword);
      
      // Calculate prominence score (0-100)
      let prominence = 0;
      if (inTitle) prominence += 30;
      if (inH1) prominence += 25;
      if (inMetaDescription) prominence += 20;
      prominence += Math.min(25, density * 10); // Density contribution
      
      keywords.push({
        keyword,
        frequency,
        density: Math.round(density * 100) / 100,
        inTitle,
        inH1,
        inMetaDescription,
        prominence: Math.min(100, Math.round(prominence)),
      });
    }
  });
  
  // Sort by prominence
  return keywords.sort((a, b) => b.prominence - a.prominence);
}

// Extract body text from HTML
function extractBodyText(html: string): string {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return '';
  
  return bodyMatch[1]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch and analyze competitor keywords
async function analyzeCompetitorKeywords(competitorUrl: string): Promise<CompetitorKeywordAnalysis | null> {
  try {
    console.log('[seo-analyze] Analyzing competitor keywords:', competitorUrl);
    
    const response = await fetch(competitorUrl, {
      headers: { 'User-Agent': 'SupportCALL-SEO-Analyzer/1.0' },
      redirect: 'follow',
    });
    
    if (!response.ok) {
      console.warn('[seo-analyze] Failed to fetch competitor:', competitorUrl, response.status);
      return null;
    }
    
    const html = await response.text();
    const page = parseHTML(html, competitorUrl);
    const bodyText = extractBodyText(html);
    const keywords = analyzePageKeywords(page, bodyText);
    
    // Get top 20 keywords
    const topKeywords = keywords.slice(0, 20).map(k => k.keyword);
    
    return {
      competitorUrl,
      keywords: keywords.slice(0, 50),
      topKeywords,
      uniqueKeywords: [], // Will be filled in after comparing with main site
    };
  } catch (error) {
    console.error('[seo-analyze] Error analyzing competitor:', competitorUrl, error);
    return null;
  }
}

// Generate keyword suggestions based on gaps
function generateKeywordSuggestions(
  siteKeywords: KeywordData[],
  competitorAnalyses: CompetitorKeywordAnalysis[],
  config: AnalysisConfig
): { keyword: string; reason: string; competitorUsing: string[]; estimatedDifficulty: 'easy' | 'medium' | 'hard' }[] {
  const suggestions: { keyword: string; reason: string; competitorUsing: string[]; estimatedDifficulty: 'easy' | 'medium' | 'hard' }[] = [];
  const siteKeywordSet = new Set(siteKeywords.map(k => k.keyword));
  
  // Find keywords used by competitors but not by the site
  const competitorKeywordMap = new Map<string, string[]>();
  
  competitorAnalyses.forEach(analysis => {
    analysis.topKeywords.forEach(keyword => {
      if (!siteKeywordSet.has(keyword)) {
        const existing = competitorKeywordMap.get(keyword) || [];
        existing.push(new URL(analysis.competitorUrl).hostname);
        competitorKeywordMap.set(keyword, existing);
      }
    });
  });
  
  // Sort by number of competitors using the keyword
  const sortedGaps = Array.from(competitorKeywordMap.entries())
    .sort((a, b) => b[1].length - a[1].length);
  
  // Generate suggestions
  sortedGaps.slice(0, 15).forEach(([keyword, competitors]) => {
    const difficulty = competitors.length >= 3 ? 'hard' : competitors.length >= 2 ? 'medium' : 'easy';
    
    let reason = '';
    if (competitors.length >= 2) {
      reason = `Used by ${competitors.length} competitors - proven ${config.geographicScope} keyword`;
    } else {
      reason = `Competitor advantage - ${competitors[0]} ranks for this`;
    }
    
    // Add geographic context to reason
    if (config.geographicScope === 'regional' && config.targetLocation) {
      reason += `. Consider localizing for ${config.targetLocation}`;
    } else if (config.geographicScope === 'state' && config.targetLocation) {
      reason += `. Target ${config.targetLocation} specifically`;
    }
    
    suggestions.push({
      keyword,
      reason,
      competitorUsing: competitors,
      estimatedDifficulty: difficulty,
    });
  });
  
  return suggestions;
}

// Perform full keyword analysis
async function performKeywordAnalysis(
  homepage: PageAnalysis,
  homepageHtml: string,
  pages: PageAnalysis[],
  pagesHtml: Map<string, string>,
  competitors: string[],
  config: AnalysisConfig
): Promise<KeywordAnalysis> {
  console.log('[seo-analyze] Starting keyword analysis...');
  
  // Analyze main site keywords
  let allSiteKeywords = new Map<string, KeywordData>();
  
  // Analyze homepage
  const homepageText = extractBodyText(homepageHtml);
  const homepageKeywords = analyzePageKeywords(homepage, homepageText);
  homepageKeywords.forEach(k => {
    const existing = allSiteKeywords.get(k.keyword);
    if (!existing || existing.prominence < k.prominence) {
      allSiteKeywords.set(k.keyword, k);
    }
  });
  
  // Analyze crawled pages
  pages.forEach(page => {
    const html = pagesHtml.get(page.url) || '';
    if (html) {
      const text = extractBodyText(html);
      const keywords = analyzePageKeywords(page, text);
      keywords.forEach(k => {
        const existing = allSiteKeywords.get(k.keyword);
        if (existing) {
          existing.frequency += k.frequency;
          existing.prominence = Math.max(existing.prominence, k.prominence);
        } else {
          allSiteKeywords.set(k.keyword, k);
        }
      });
    }
  });
  
  // Convert to array and sort
  const siteKeywords = Array.from(allSiteKeywords.values())
    .sort((a, b) => b.prominence - a.prominence)
    .slice(0, 100);
  
  const topKeywords = siteKeywords.slice(0, 20).map(k => k.keyword);
  
  // Analyze competitors (including user-specified ones)
  const allCompetitors = [...competitors];
  
  // Always include Ubersuggest/Neil Patel as a reference for methodology comparison
  const ubersuggestUrl = 'https://neilpatel.com/';
  if (!allCompetitors.some(c => c.includes('neilpatel.com'))) {
    allCompetitors.push(ubersuggestUrl);
  }
  
  const competitorAnalyses: CompetitorKeywordAnalysis[] = [];
  
  for (const competitorUrl of allCompetitors.slice(0, 4)) { // Limit to 4 competitors
    const analysis = await analyzeCompetitorKeywords(competitorUrl);
    if (analysis) {
      // Find unique keywords (competitor has but site doesn't)
      const siteKeywordSet = new Set(siteKeywords.map(k => k.keyword));
      analysis.uniqueKeywords = analysis.topKeywords.filter(k => !siteKeywordSet.has(k));
      competitorAnalyses.push(analysis);
    }
  }
  
  // Generate suggestions
  const suggestedKeywords = generateKeywordSuggestions(siteKeywords, competitorAnalyses, config);
  
  // Identify keyword gaps
  const keywordGaps: string[] = [];
  competitorAnalyses.forEach(analysis => {
    analysis.uniqueKeywords.slice(0, 5).forEach(kw => {
      if (!keywordGaps.includes(kw)) {
        keywordGaps.push(kw);
      }
    });
  });
  
  console.log('[seo-analyze] Keyword analysis complete. Found', siteKeywords.length, 'site keywords,', suggestedKeywords.length, 'suggestions');
  
  return {
    siteKeywords,
    topKeywords,
    competitorAnalysis: competitorAnalyses,
    suggestedKeywords,
    keywordGaps: keywordGaps.slice(0, 20),
  };
}

// Generate issues based on analysis
function generateIssues(homepage: PageAnalysis, robots: RobotsInfo, pages: PageAnalysis[], config: AnalysisConfig, blacklistResult?: BlacklistResult): Issue[] {
  const issues: Issue[] = [];
  
// Check meta description
  const pagesWithoutDescription = pages.filter(p => !p.metaDescription || p.metaDescription.length === 0);
  if (!homepage.metaDescription || pagesWithoutDescription.length > 0) {
    issues.push({
      id: 'missing-meta-description',
      title: 'Missing or empty meta description',
      severity: 'high',
      category: 'on-page',
      whyItMatters: 'Meta descriptions appear in search results and directly influence click-through rates (CTR). Pages without descriptions may display random text snippets, reducing user clicks by up to 50% and impacting your organic traffic.',
      evidence: [
        ...(!homepage.metaDescription ? ['Homepage has no meta description tag'] : []),
        ...(pagesWithoutDescription.length > 0 ? [`${pagesWithoutDescription.length} page(s) missing descriptions`] : []),
      ],
      affectedUrls: [
        ...(!homepage.metaDescription ? [homepage.url] : []),
        ...pagesWithoutDescription.map(p => p.url),
      ],
      fixSteps: [
        'Step 1: Open your page source code or CMS editor',
        'Step 2: Locate the <head> section of your HTML',
        'Step 3: Add a unique meta description tag for each page',
        'Step 4: Write 150-160 characters that accurately describe the page content',
        'Step 5: Include your primary keyword naturally within the first 120 characters',
        'Step 6: Add a compelling call-to-action or value proposition',
        'Step 7: Test the preview using Google Search Console or an SEO tool',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install Yoast SEO plugin (free) from Plugins > Add New',
          'Step 2: After activation, edit the page where description is missing',
          'Step 3: Scroll down to the Yoast SEO meta box below the content editor',
          'Step 4: Click "Edit snippet" to expand the preview editor',
          'Step 5: Enter your meta description (aim for 150-160 characters)',
          'Step 6: The traffic light indicator shows green when optimal',
          'Step 7: Click "Update" to save the page',
          'Step 8: Use "Preview" to verify changes appear correctly',
        ],
        shopify: [
          'Step 1: From admin panel, go to Online Store > Pages (or Products)',
          'Step 2: Click on the page needing a meta description',
          'Step 3: Scroll to "Search engine listing preview" section',
          'Step 4: Click "Edit website SEO" to expand options',
          'Step 5: Enter your description in the "Description" field',
          'Step 6: Keep it under 160 characters - counter shows remaining',
          'Step 7: Click "Save" to apply changes',
          'Step 8: Wait 24-48 hours for Google to re-index',
        ],
        webflow: [
          'Step 1: Open your project in the Webflow Designer',
          'Step 2: Select the page from the Pages panel (left sidebar)',
          'Step 3: Click the gear icon to open Page Settings',
          'Step 4: Scroll to "SEO Settings" section',
          'Step 5: Enter your meta description in the "Meta Description" field',
          'Step 6: Click "Save" and then "Publish" to make live',
        ],
        custom: [
          'Step 1: Open your HTML file in a code editor',
          'Step 2: Locate the <head> section',
          'Step 3: Add: <meta name="description" content="Your description here">',
          'Step 4: Ensure description is unique per page',
          'Step 5: Upload the modified file to your server',
          'Step 6: Clear any server-side or CDN cache',
        ],
      },
      snippets: ['<meta name="description" content="Your compelling page description here. Keep it under 160 characters and include your main keyword. Add a call-to-action.">'],
      verifySteps: [
        'Step 1: View page source (Ctrl+U or Cmd+Option+U) and search for "description"',
        'Step 2: Use Google Search Console > URL Inspection to check indexed description',
        'Step 3: Share URL on social media preview tools to verify display',
      ],
      mistakesToAvoid: [
        'Do not copy the same description to multiple pages - each must be unique',
        'Do not stuff keywords unnaturally - write for humans first',
        'Do not exceed 160 characters - anything beyond gets truncated',
        'Do not leave dynamic placeholders like {page_title} unresolved',
      ],
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
      whyItMatters: 'Internal links help search engines discover content, distribute page authority (link equity), and improve user navigation. Pages with few internal links may be poorly indexed.',
      evidence: [`Homepage has only ${homepage.internalLinks} internal links`],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Identify your most important pages (products, services, key content)',
        'Step 2: Add text links to these pages within your homepage content',
        'Step 3: Use descriptive anchor text (not "click here")',
        'Step 4: Add a clear navigation menu linking to main sections',
        'Step 5: Consider adding a "Featured" or "Popular" section with links',
        'Step 6: Ensure footer contains links to important pages',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Edit your homepage in the WordPress editor',
          'Step 2: Add text links using the link button (Ctrl+K)',
          'Step 3: Use descriptive anchor text for each link',
          'Step 4: Check Appearance > Menus for navigation links',
          'Step 5: Add a widget with popular/recent posts if applicable',
        ],
        shopify: [
          'Step 1: Go to Online Store > Navigation',
          'Step 2: Edit your main menu to include key pages',
          'Step 3: Edit your homepage sections to add featured collections/products',
          'Step 4: Add footer links to important pages',
        ],
        custom: [
          'Step 1: Edit your HTML to add <a href="/page">descriptive text</a> links',
          'Step 2: Ensure navigation includes all major sections',
          'Step 3: Add a sitemap-style footer with key page links',
        ],
      },
      verifySteps: [
        'Step 1: Use browser developer tools to count <a> tags on homepage',
        'Step 2: Verify all important pages are reachable from homepage',
        'Step 3: Use a crawler tool to visualize internal link structure',
      ],
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
      whyItMatters: 'Pages with minimal text content provide limited value to users and search engines. Google considers comprehensive content as a quality signal. Aim for at least 300-500 words of unique, valuable content.',
      evidence: [`Homepage has only ${homepage.wordCount} words`],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Audit existing content for opportunities to expand',
        'Step 2: Add descriptive sections about your products/services',
        'Step 3: Include customer testimonials or case studies',
        'Step 4: Add FAQ sections with common questions and answers',
        'Step 5: Write unique, valuable content (not filler text)',
        'Step 6: Aim for at least 300-500 words on the homepage',
        'Step 7: Ensure content is scannable with headers and bullet points',
      ],
      verifySteps: [
        'Step 1: Use a word counter tool on your visible page content',
        'Step 2: Ensure new content reads naturally and provides value',
        'Step 3: Check that content is unique (not duplicated from other sites)',
      ],
      mistakesToAvoid: [
        'Do not add low-quality filler text just to increase word count',
        'Do not hide text (white text on white background) - this is penalized',
        'Do not duplicate content from other pages on your site',
      ],
      manualCheckRequired: true,
    });
  }
  
  // Check HTTPS
  const urlObj = new URL(config.url);
  if (urlObj.protocol !== 'https:') {
    issues.push({
      id: 'no-https',
      title: 'Website not using HTTPS',
      severity: 'critical',
      category: 'security',
      whyItMatters: 'HTTPS is a confirmed Google ranking factor. Sites without HTTPS show "Not Secure" warnings in browsers, which damages user trust and can significantly hurt conversions and rankings.',
      evidence: ['Website is served over HTTP instead of HTTPS'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Purchase or obtain a free SSL certificate (Let\'s Encrypt is free)',
        'Step 2: Install the SSL certificate on your web server',
        'Step 3: Update your site configuration to serve content over HTTPS',
        'Step 4: Set up 301 redirects from HTTP to HTTPS for all URLs',
        'Step 5: Update internal links to use HTTPS',
        'Step 6: Update canonical tags to use HTTPS URLs',
        'Step 7: Submit HTTPS version to Google Search Console',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Contact your hosting provider - many offer free SSL',
          'Step 2: Install the "Really Simple SSL" plugin',
          'Step 3: Activate the plugin and follow the setup wizard',
          'Step 4: Update WordPress Address and Site Address in Settings > General',
          'Step 5: Clear all caches after migration',
        ],
        shopify: [
          'Step 1: Shopify provides free SSL automatically',
          'Step 2: Go to Online Store > Domains',
          'Step 3: Ensure your domain shows "SSL pending" or "SSL enabled"',
          'Step 4: If using custom domain, verify DNS settings are correct',
        ],
        custom: [
          'Step 1: Obtain SSL certificate from Let\'s Encrypt (free) or your CA',
          'Step 2: Install certificate on your web server (Apache/Nginx)',
          'Step 3: Configure server to redirect HTTP to HTTPS',
          'Step 4: Update all hardcoded HTTP links in your code',
        ],
      },
      snippets: [
        '# Apache .htaccess redirect\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]',
        '# Nginx redirect\nserver {\n  listen 80;\n  server_name example.com;\n  return 301 https://$server_name$request_uri;\n}',
      ],
      verifySteps: [
        'Step 1: Visit your website and check for the padlock icon in browser',
        'Step 2: Try accessing HTTP version - should redirect to HTTPS',
        'Step 3: Use SSL Labs (ssllabs.com) to test your certificate',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check meta description length
  if (homepage.metaDescription && (homepage.metaDescriptionLength! < 120 || homepage.metaDescriptionLength! > 160)) {
    issues.push({
      id: 'meta-description-length',
      title: homepage.metaDescriptionLength! < 120 ? 'Meta description too short' : 'Meta description too long',
      severity: 'low',
      category: 'on-page',
      whyItMatters: 'Meta descriptions should be 120-160 characters. Too short misses opportunity to convey value; too long gets truncated in search results.',
      evidence: [`Homepage meta description is ${homepage.metaDescriptionLength} characters`],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Review your current meta description',
        'Step 2: Rewrite to be between 120-160 characters',
        'Step 3: Include primary keyword in the first 120 characters',
        'Step 4: End with a call-to-action if space permits',
      ],
      verifySteps: ['Step 1: Check meta description length using a character counter'],
      manualCheckRequired: false,
    });
  }
  
  // Check for Twitter Cards
  if (!homepage.hasTwitterCards) {
    issues.push({
      id: 'missing-twitter-cards',
      title: 'Missing Twitter Card meta tags',
      severity: 'low',
      category: 'on-page',
      whyItMatters: 'Twitter Cards control how your content appears when shared on Twitter/X. Without them, shares may display poorly formatted previews.',
      evidence: ['No Twitter Card (twitter:) meta tags found'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Add twitter:card meta tag (summary_large_image recommended)',
        'Step 2: Add twitter:title and twitter:description tags',
        'Step 3: Add twitter:image tag with a high-quality image URL',
        'Step 4: Optionally add twitter:site with your Twitter handle',
      ],
      snippets: [
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="Your Page Title">',
        '<meta name="twitter:description" content="Description for Twitter shares">',
        '<meta name="twitter:image" content="https://example.com/image.jpg">',
      ],
      verifySteps: ['Step 1: Use Twitter Card Validator to test your page'],
      manualCheckRequired: false,
    });
  }
  
  // ============ MARKETING & ANALYTICS TOOLS ============
  
  // Check Google Tag Manager (GTM)
  if (!homepage.hasGTM) {
    issues.push({
      id: 'missing-gtm',
      title: 'Google Tag Manager not detected',
      severity: 'medium',
      category: 'marketing',
      whyItMatters: 'Google Tag Manager (GTM) is a free tool that lets you manage all tracking codes from one place. Without it, adding new marketing tags requires code changes, slowing down campaigns and risking errors.',
      evidence: ['No GTM container script detected on the homepage'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to tagmanager.google.com and sign in with your Google account',
        'Step 2: Click "Create Account" and enter your company name',
        'Step 3: Create a "Container" for your website (Web type)',
        'Step 4: Copy the two GTM code snippets provided',
        'Step 5: Paste the first snippet high in the <head> section of all pages',
        'Step 6: Paste the second snippet immediately after the opening <body> tag',
        'Step 7: Use GTM Preview mode to verify installation',
        'Step 8: Publish your container when ready',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Site Kit by Google" plugin (recommended) or "GTM4WP"',
          'Step 2: Connect your Google account when prompted',
          'Step 3: Link your GTM container in the plugin settings',
          'Step 4: The plugin automatically adds GTM code to all pages',
          'Step 5: Verify with GTM Preview or Tag Assistant extension',
        ],
        shopify: [
          'Step 1: From Shopify admin, go to Online Store > Themes',
          'Step 2: Click Actions > Edit code',
          'Step 3: In theme.liquid, paste GTM head code after <head>',
          'Step 4: Paste GTM body code after <body>',
          'Step 5: Click Save and test with GTM Preview mode',
        ],
        custom: [
          'Step 1: Create a GTM account at tagmanager.google.com',
          'Step 2: Get your GTM container ID (GTM-XXXXXXX)',
          'Step 3: Add GTM script tags to your HTML template',
          'Step 4: Deploy to all pages via your template system',
        ],
      },
      snippets: [
        `<!-- GTM Head Code (place high in <head>) -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>`,
        `<!-- GTM Body Code (place after <body>) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
      ],
      verifySteps: [
        'Step 1: Install Google Tag Assistant Chrome extension',
        'Step 2: Visit your website and click the extension icon',
        'Step 3: GTM should show as green (working correctly)',
        'Step 4: Or use GTM Preview mode directly in tagmanager.google.com',
      ],
      mistakesToAvoid: [
        'Do not add GTM code inside another tag manager or duplicate installations',
        'Do not forget the noscript fallback tag after <body>',
        'Do not leave GTM in preview/debug mode in production',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check Google Analytics 4 (GA4)
  if (!homepage.hasGA4) {
    issues.push({
      id: 'missing-ga4',
      title: 'Google Analytics 4 (GA4) not detected',
      severity: 'high',
      category: 'marketing',
      whyItMatters: 'Google Analytics 4 is essential for understanding your website traffic, user behavior, and conversions. Without analytics, you cannot measure marketing effectiveness or make data-driven decisions.',
      evidence: ['No GA4 tracking code (G-XXXXXXX) detected on the homepage'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to analytics.google.com and sign in',
        'Step 2: Click "Admin" (gear icon) > "Create Property"',
        'Step 3: Enter your property name and select your timezone/currency',
        'Step 4: Complete the business information questions',
        'Step 5: Accept terms and create your data stream (Web)',
        'Step 6: Copy your Measurement ID (starts with G-)',
        'Step 7: If using GTM: Add a GA4 Configuration tag with this ID',
        'Step 8: If not using GTM: Add the gtag.js code to your site',
        'Step 9: Wait 24-48 hours for data to appear in reports',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Site Kit by Google" plugin (recommended)',
          'Step 2: Connect your Google account and Analytics',
          'Step 3: Site Kit automatically configures GA4 tracking',
          'Step 4: Or manually add GA4 via a GTM plugin',
          'Step 5: Verify in GA4 Realtime report',
        ],
        shopify: [
          'Step 1: Go to Online Store > Preferences',
          'Step 2: Scroll to "Google Analytics"',
          'Step 3: Paste your GA4 Measurement ID (G-XXXXXXX)',
          'Step 4: Enable enhanced ecommerce if selling products',
          'Step 5: Click Save and verify in GA4 Realtime',
        ],
        custom: [
          'Step 1: Add gtag.js script to your HTML <head>',
          'Step 2: Initialize with your G-XXXXXXX Measurement ID',
          'Step 3: Deploy across all pages',
          'Step 4: Test using GA4 Realtime report',
        ],
      },
      snippets: [
        `<!-- GA4 Tracking Code (add to <head>) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXX');\n</script>`,
      ],
      verifySteps: [
        'Step 1: Open GA4 and go to Reports > Realtime',
        'Step 2: Visit your website in another tab',
        'Step 3: You should see yourself as an active user within 30 seconds',
        'Step 4: Use Tag Assistant or GTM Preview to verify tag firing',
      ],
      mistakesToAvoid: [
        'Do not use old Universal Analytics (UA-) codes - they stopped collecting data',
        'Do not install GA4 both directly and through GTM (causes double-counting)',
        'Do not forget to set up conversions/key events for important actions',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check Google Search Console verification
  if (!homepage.hasGoogleSearchConsoleVerification) {
    issues.push({
      id: 'missing-gsc-verification',
      title: 'Google Search Console verification not detected',
      severity: 'high',
      category: 'marketing',
      whyItMatters: 'Google Search Console is a free tool that shows how Google sees your site, including indexing issues, search queries, and manual penalties. Without it, you are blind to critical SEO problems.',
      evidence: ['No google-site-verification meta tag found on the homepage'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to search.google.com/search-console',
        'Step 2: Click "Add Property" and enter your website URL',
        'Step 3: Choose "URL prefix" for simplest verification',
        'Step 4: Select "HTML tag" verification method',
        'Step 5: Copy the meta tag provided by Google',
        'Step 6: Paste it in your homepage <head> section',
        'Step 7: Click "Verify" in Search Console',
        'Step 8: Submit your sitemap at Sitemaps > Add new sitemap',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Site Kit by Google" or "Yoast SEO" plugin',
          'Step 2: Both plugins have Search Console integration',
          'Step 3: Connect your Google account when prompted',
          'Step 4: Verification is handled automatically',
          'Step 5: View search data directly in WordPress dashboard',
        ],
        shopify: [
          'Step 1: Copy the verification code from Search Console (just the code value)',
          'Step 2: Go to Online Store > Preferences in Shopify',
          'Step 3: Scroll to "Google Search Console"',
          'Step 4: Paste the verification code and Save',
          'Step 5: Return to Search Console and click Verify',
        ],
        custom: [
          'Step 1: Add the meta tag to your HTML <head>',
          'Step 2: Alternatively, upload an HTML verification file to root',
          'Step 3: Or verify via DNS TXT record for domain-level access',
          'Step 4: Deploy and click Verify in Search Console',
        ],
      },
      snippets: [
        `<!-- GSC Verification (add to <head>) -->\n<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE">`,
      ],
      verifySteps: [
        'Step 1: View your page source and search for "google-site-verification"',
        'Step 2: In Search Console, your property should show as "Verified"',
        'Step 3: Check that your sitemap is submitted and processing',
      ],
      mistakesToAvoid: [
        'Do not remove the verification tag after verifying - keep it permanently',
        'Do not forget to add all URL variations (www, non-www, http, https)',
        'Do not ignore Search Console alerts - they indicate real issues',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check Microsoft Clarity
  if (!homepage.hasMicrosoftClarity) {
    issues.push({
      id: 'missing-clarity',
      title: 'Microsoft Clarity not detected',
      severity: 'low',
      category: 'marketing',
      whyItMatters: 'Microsoft Clarity is a free heatmap and session recording tool. It shows exactly how users interact with your site - where they click, how far they scroll, and where they get frustrated. This data is invaluable for improving conversions.',
      evidence: ['No Microsoft Clarity tracking code detected on the homepage'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to clarity.microsoft.com and sign in with Microsoft account',
        'Step 2: Click "Add new project" and enter your website URL',
        'Step 3: Copy the Clarity tracking code provided',
        'Step 4: Add the code to your website <head> section (or use GTM)',
        'Step 5: Wait a few hours for recordings and heatmaps to populate',
        'Step 6: Review the Dashboard for insights on user behavior',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Microsoft Clarity" official plugin from WordPress.org',
          'Step 2: Activate the plugin and go to Settings > Clarity',
          'Step 3: Enter your Clarity Project ID',
          'Step 4: Click Save - tracking begins automatically',
          'Step 5: Or add via GTM using Clarity\'s GTM template',
        ],
        shopify: [
          'Step 1: Go to Online Store > Themes > Edit code',
          'Step 2: Open theme.liquid',
          'Step 3: Paste Clarity code before </head>',
          'Step 4: Save and verify in Clarity dashboard',
        ],
        custom: [
          'Step 1: Get your Clarity project ID from clarity.microsoft.com',
          'Step 2: Add the tracking script to your HTML <head>',
          'Step 3: Deploy across all pages',
          'Step 4: Verify recordings appear in your Clarity dashboard',
        ],
      },
      snippets: [
        `<!-- Microsoft Clarity (add to <head>) -->\n<script type="text/javascript">\n  (function(c,l,a,r,i,t,y){\n    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;\n    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n  })(window,document,"clarity","script","YOUR_PROJECT_ID");\n</script>`,
      ],
      verifySteps: [
        'Step 1: Visit your website after adding Clarity',
        'Step 2: Log into Clarity dashboard within 2-3 hours',
        'Step 3: Check if recordings and heatmaps are showing data',
        'Step 4: Use browser dev tools to confirm clarity.ms script loads',
      ],
      mistakesToAvoid: [
        'Do not forget to comply with privacy laws - Clarity has GDPR/cookie controls',
        'Do not install on pages with sensitive data input without masking',
        'Do not ignore the "Dead Clicks" and "Rage Clicks" metrics',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check Google Business Profile (LocalBusiness schema as indicator)
  if (!homepage.hasLocalBusinessSchema) {
    issues.push({
      id: 'missing-local-business',
      title: 'Google Business Profile / LocalBusiness schema not detected',
      severity: 'medium',
      category: 'marketing',
      whyItMatters: 'For local businesses, Google Business Profile is essential for appearing in local search results, Google Maps, and the Knowledge Panel. LocalBusiness schema on your website reinforces this connection and improves local SEO.',
      evidence: ['No LocalBusiness, Organization, or similar structured data found'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Claim your Google Business Profile at business.google.com',
        'Step 2: Complete ALL business information (name, address, phone, hours)',
        'Step 3: Verify your business (postcard, phone, or email)',
        'Step 4: Add photos, services, and products to your profile',
        'Step 5: Add LocalBusiness structured data to your website',
        'Step 6: Ensure NAP (Name, Address, Phone) matches exactly everywhere',
        'Step 7: Encourage customer reviews on your Google profile',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Yoast SEO" or "Rank Math" plugin',
          'Step 2: Go to SEO > Search Appearance > Content Types',
          'Step 3: Configure your Organization/LocalBusiness schema',
          'Step 4: Add your business details (address, logo, social profiles)',
          'Step 5: Validate with Google Rich Results Test',
        ],
        shopify: [
          'Step 1: Use a schema app like "JSON-LD for SEO" from App Store',
          'Step 2: Configure your business information in the app',
          'Step 3: Or manually add JSON-LD to theme.liquid',
          'Step 4: Test with Google Rich Results Test',
        ],
        custom: [
          'Step 1: Create LocalBusiness JSON-LD structured data',
          'Step 2: Include name, address, phone, hours, geo coordinates',
          'Step 3: Add to your homepage <head> or before </body>',
          'Step 4: Validate with schema.org validator',
        ],
      },
      snippets: [
        `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "Your Business Name",\n  "image": "https://example.com/logo.jpg",\n  "telephone": "+1-555-555-5555",\n  "address": {\n    "@type": "PostalAddress",\n    "streetAddress": "123 Main Street",\n    "addressLocality": "Your City",\n    "addressRegion": "State",\n    "postalCode": "12345",\n    "addressCountry": "US"\n  },\n  "openingHoursSpecification": {\n    "@type": "OpeningHoursSpecification",\n    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],\n    "opens": "09:00",\n    "closes": "17:00"\n  },\n  "url": "https://example.com",\n  "sameAs": [\n    "https://www.facebook.com/yourbusiness",\n    "https://www.instagram.com/yourbusiness"\n  ]\n}\n</script>`,
      ],
      verifySteps: [
        'Step 1: Use Google Rich Results Test on your homepage',
        'Step 2: Search your business name on Google to check Knowledge Panel',
        'Step 3: Verify your Google Business Profile is verified and complete',
        'Step 4: Check Google Search Console for structured data errors',
      ],
      mistakesToAvoid: [
        'Do not use inconsistent NAP across directories (name, address, phone)',
        'Do not leave Google Business Profile incomplete',
        'Do not ignore negative reviews - respond professionally',
      ],
      manualCheckRequired: true,
    });
  }
  
  // Check Google Ads Tag
  if (!homepage.hasGoogleAdsTag) {
    issues.push({
      id: 'missing-google-ads',
      title: 'Google Ads Tag not detected (free setup recommended)',
      severity: 'low',
      category: 'marketing',
      whyItMatters: 'Even if you are not running paid ads yet, setting up Google Ads is free and allows you to build remarketing audiences from day one. When you are ready to advertise, you will have valuable audience data already collected.',
      evidence: ['No Google Ads tag (AW-XXXXXXX) detected on the homepage'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to ads.google.com and create a free account',
        'Step 2: Skip campaign creation for now (optional)',
        'Step 3: Go to Tools & Settings > Setup > Google Tag',
        'Step 4: Find your Google Ads Tag ID (AW-XXXXXXXXX)',
        'Step 5: Add the tag to your website via GTM or directly',
        'Step 6: Create a "All Visitors" remarketing audience',
        'Step 7: Audiences build passively even without active campaigns',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: If using GTM, add Google Ads Remarketing tag in GTM',
          'Step 2: Or use "Insert Headers and Footers" plugin',
          'Step 3: Add the gtag.js code with your AW- ID',
          'Step 4: Verify with Google Ads Tag Assistant',
        ],
        shopify: [
          'Step 1: Go to Settings > Apps and sales channels',
          'Step 2: Install "Google & YouTube" official app',
          'Step 3: Connect your Google Ads account',
          'Step 4: Enable audience building and tracking',
        ],
        custom: [
          'Step 1: Add gtag.js with your AW- conversion ID',
          'Step 2: Configure for remarketing (not just conversions)',
          'Step 3: Deploy across all pages',
          'Step 4: Verify in Google Ads > Audience Manager',
        ],
      },
      snippets: [
        `<!-- Google Ads Tag (add to <head>) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'AW-XXXXXXXXX');\n</script>`,
      ],
      verifySteps: [
        'Step 1: Install Google Tag Assistant Chrome extension',
        'Step 2: Visit your site and check for Google Ads tag',
        'Step 3: In Google Ads, check Audience Manager for list growth',
        'Step 4: Verify tag status shows "Active" in Google Ads',
      ],
      mistakesToAvoid: [
        'Do not enable campaigns without proper conversion tracking',
        'Do not forget to set up remarketing audiences early',
        'Do not run ads without testing conversion events first',
      ],
      manualCheckRequired: true,
    });
  }
  
  // Check Google Ads Conversion Tracking (if Ads tag exists but no conversion)
  if (homepage.hasGoogleAdsTag && !homepage.hasGoogleAdsConversion) {
    issues.push({
      id: 'missing-conversion-tracking',
      title: 'Google Ads conversion tracking not detected',
      severity: 'high',
      category: 'marketing',
      whyItMatters: 'You have Google Ads installed but no conversion tracking. Without conversion tracking, Google cannot optimize your campaigns for actual results (sales, leads, signups), meaning you will waste ad spend on low-quality traffic.',
      evidence: ['Google Ads tag found but no conversion events detected'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: In Google Ads, go to Goals > Conversions > Summary',
        'Step 2: Click "+ New conversion action" > Website',
        'Step 3: Enter your website URL and scan for events',
        'Step 4: Define your primary conversions (purchase, lead form, signup)',
        'Step 5: Get the conversion tracking code',
        'Step 6: Install via GTM (recommended) or directly on thank-you pages',
        'Step 7: Test conversions using GTM Preview or Tag Assistant',
        'Step 8: Wait for conversions to register before optimizing campaigns',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Use GTM to add conversion tags on form submissions/purchases',
          'Step 2: WooCommerce users: Use "Google Ads & Marketing" plugin',
          'Step 3: Set conversion to fire on thank-you/confirmation pages',
          'Step 4: Or use gtag event on form success callbacks',
        ],
        shopify: [
          'Step 1: Install "Google & YouTube" official app if not done',
          'Step 2: Go to Settings in the app > Conversion tracking',
          'Step 3: Enable purchase and other conversion events',
          'Step 4: Conversion tracking is automatic for checkouts',
        ],
        custom: [
          'Step 1: Add gtag conversion code to your confirmation pages',
          'Step 2: Or trigger gtag("event", "conversion") via JavaScript',
          'Step 3: Include conversion value and order ID if applicable',
          'Step 4: Test with Tag Assistant before going live',
        ],
      },
      snippets: [
        `<!-- Conversion Event (add to thank-you page or trigger on success) -->\n<script>\n  gtag('event', 'conversion', {\n    'send_to': 'AW-XXXXXXXXX/YYYYYYYYYYYY',\n    'value': 99.99,\n    'currency': 'USD',\n    'transaction_id': 'ORDER_12345'\n  });\n</script>`,
      ],
      verifySteps: [
        'Step 1: Complete a test conversion on your website',
        'Step 2: Check Google Ads > Goals > Conversions for the event',
        'Step 3: Use Tag Assistant to verify conversion tag fires correctly',
        'Step 4: Allow up to 24 hours for conversions to appear in reports',
      ],
      mistakesToAvoid: [
        'Do not track page views as conversions - only track meaningful actions',
        'Do not forget to pass conversion value for e-commerce',
        'Do not launch campaigns before verifying conversions work',
      ],
      manualCheckRequired: false,
    });
  }
  
  // Check Merchant Center / Product Schema for E-commerce
  if (homepage.hasProductSchema && !homepage.hasMerchantCenterLink) {
    issues.push({
      id: 'missing-merchant-center',
      title: 'Google Merchant Center free listings opportunity',
      severity: 'medium',
      category: 'marketing',
      whyItMatters: 'Your site has product data but may not be listed in Google Shopping free listings. Merchant Center allows your products to appear for free in Google Shopping, Images, and Search results.',
      evidence: ['Product schema detected but full Merchant Center integration may be missing'],
      affectedUrls: [homepage.url],
      fixSteps: [
        'Step 1: Go to merchants.google.com and sign up (free)',
        'Step 2: Verify and claim your website URL',
        'Step 3: Create a product feed (manually, via Shopify, or with plugins)',
        'Step 4: Submit your feed to Merchant Center',
        'Step 5: Opt into "Free product listings" in Growth > Manage programs',
        'Step 6: Ensure products have: title, price, availability, images, GTIN/MPN',
        'Step 7: Fix any disapprovals in the Diagnostics section',
        'Step 8: Connect Google Ads for paid Shopping campaigns later',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install "Google Listings & Ads" WooCommerce extension',
          'Step 2: Connect your Merchant Center and Google Ads accounts',
          'Step 3: Sync your WooCommerce products automatically',
          'Step 4: Review product status in the plugin dashboard',
          'Step 5: Fix any missing attributes like GTIN or brand',
        ],
        shopify: [
          'Step 1: Install "Google & YouTube" official app',
          'Step 2: Connect your Merchant Center account',
          'Step 3: Sync products from Shopify to Merchant Center',
          'Step 4: Enable "Free listings" in the app settings',
          'Step 5: Ensure all products have required attributes',
        ],
        custom: [
          'Step 1: Create a product feed in XML, TXT, or Google Sheets format',
          'Step 2: Include required attributes: id, title, description, link, image_link, price, availability',
          'Step 3: Upload feed to Merchant Center > Products > Feeds',
          'Step 4: Set up scheduled fetches if feed URL is accessible',
        ],
      },
      snippets: [
        `<!-- Product Schema Example (for each product) -->\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Example Product",\n  "image": "https://example.com/product.jpg",\n  "description": "Product description here",\n  "brand": {"@type": "Brand", "name": "Brand Name"},\n  "gtin13": "0012345678905",\n  "offers": {\n    "@type": "Offer",\n    "price": "49.99",\n    "priceCurrency": "USD",\n    "availability": "https://schema.org/InStock",\n    "url": "https://example.com/product"\n  }\n}\n</script>`,
      ],
      verifySteps: [
        'Step 1: Check Merchant Center Diagnostics for product status',
        'Step 2: Search Google Shopping for your products by name',
        'Step 3: Use Google Rich Results Test on product pages',
        'Step 4: Monitor impressions in Merchant Center Performance tab',
      ],
      mistakesToAvoid: [
        'Do not submit products without required attributes (price, availability, image)',
        'Do not use stock photos that violate image policies',
        'Do not list products that violate Google Shopping policies',
      ],
      manualCheckRequired: true,
    });
  }

  // === BLACKLIST CHECK ===
  if (blacklistResult) {
    const checkUrls = getBlacklistCheckUrls(blacklistResult.domain);
    
    // Always add an informational issue with blacklist check resources
    issues.push({
      id: 'blacklist-check',
      title: 'Domain Blacklist & Reputation Check',
      severity: blacklistResult.listedOn.length > 0 ? 'critical' : 'low',
      category: 'security',
      whyItMatters: 'Being listed on spam or malware blacklists can severely impact email deliverability, search rankings, and brand reputation. Search engines may warn users or block access to blacklisted sites, causing up to 95% traffic loss.',
      evidence: blacklistResult.listedOn.length > 0 
        ? [`Domain found on ${blacklistResult.listedOn.length} blacklist(s): ${blacklistResult.listedOn.join(', ')}`]
        : [`Checked against ${blacklistResult.checked} major blacklist services`, 'Manual verification recommended for comprehensive results'],
      affectedUrls: [`https://${blacklistResult.domain}`],
      fixSteps: blacklistResult.listedOn.length > 0 ? [
        'Step 1: Identify the root cause (malware, spam content, hacked site)',
        'Step 2: Clean infected files and remove malicious code',
        'Step 3: Change all admin passwords and API keys',
        'Step 4: Update all CMS, plugins, and themes to latest versions',
        'Step 5: Submit delisting requests to each blacklist service',
        'Step 6: Request a security review in Google Search Console',
        'Step 7: Monitor for 2-4 weeks as delistings propagate',
        'Step 8: Implement ongoing security monitoring',
      ] : [
        'Step 1: Use the verification links below to check each blacklist manually',
        'Step 2: Bookmark these links for regular monthly checks',
        'Step 3: Set up Google Search Console for security alerts',
        'Step 4: Consider a paid monitoring service for continuous checks',
      ],
      platformFixSteps: {
        wordpress: [
          'Step 1: Install Wordfence or Sucuri Security plugin',
          'Step 2: Run a full malware scan',
          'Step 3: Review and clean any flagged files',
          'Step 4: Enable firewall and login protection',
          'Step 5: Set up email alerts for security issues',
        ],
        shopify: [
          'Step 1: Shopify handles server-side security automatically',
          'Step 2: Review third-party apps for suspicious behavior',
          'Step 3: Check for unauthorized admin users',
          'Step 4: Contact Shopify support if listed on blacklists',
        ],
        custom: [
          'Step 1: Run server-side malware scans (ClamAV, rkhunter)',
          'Step 2: Review access logs for suspicious activity',
          'Step 3: Check for unauthorized file modifications',
          'Step 4: Implement a Web Application Firewall (WAF)',
          'Step 5: Set up intrusion detection monitoring',
        ],
      },
      snippets: checkUrls.slice(0, 10).map(u => `${u.name}: ${u.url}`),
      verifySteps: [
        'Step 1: Click each blacklist check link in the evidence section',
        'Step 2: Verify your domain shows "clean" or "not listed" status',
        'Step 3: Check Google Search Console > Security & Manual Actions',
        'Step 4: Use MXToolbox blacklist lookup for comprehensive email checks',
        'Step 5: Test email deliverability with mail-tester.com',
      ],
      mistakesToAvoid: [
        'Do not ignore blacklist warnings - they compound quickly',
        'Do not submit delisting requests before cleaning the site',
        'Do not use shared hosting without malware scanning',
        'Do not skip regular security audits and updates',
      ],
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
    
    // Crawl internal pages and store HTML for keyword analysis
    const pages: PageAnalysis[] = [];
    const pagesHtml = new Map<string, string>();
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
          pagesHtml.set(pageUrl, html); // Store for keyword analysis
        }
      } catch (error) {
        console.warn('[seo-analyze] Failed to crawl:', pageUrl, error);
      }
    }
    console.log('[seo-analyze] Crawled', pages.length, 'pages');
    
    // Perform blacklist check
    const parsedUrl = new URL(baseUrl);
    const blacklistResult = await checkBlacklists(parsedUrl.hostname);
    console.log('[seo-analyze] Blacklist check complete for:', parsedUrl.hostname);
    
    // Perform keyword analysis if enabled
    let keywordAnalysis: KeywordAnalysis | undefined;
    if (config.enableKeywordAnalysis) {
      keywordAnalysis = await performKeywordAnalysis(
        homepage,
        homepageHtml,
        pages,
        pagesHtml,
        config.competitors || [],
        config
      );
    }
    
    // Generate issues
    const issues = generateIssues(homepage, robots, pages, config, blacklistResult);
    console.log('[seo-analyze] Generated', issues.length, 'issues');
    
    // Add keyword-related issues if analysis was performed
    if (keywordAnalysis) {
      // Check if site has low keyword density
      const avgProminence = keywordAnalysis.siteKeywords.slice(0, 10).reduce((sum, k) => sum + k.prominence, 0) / 10;
      if (avgProminence < 30) {
        issues.push({
          id: 'low-keyword-optimization',
          title: 'Low keyword optimization detected',
          severity: 'medium',
          category: 'keywords',
          whyItMatters: 'Your pages have weak keyword presence in key areas (titles, H1s, meta descriptions). This reduces your visibility for relevant searches and limits organic traffic potential.',
          evidence: [
            `Average keyword prominence score: ${Math.round(avgProminence)}/100`,
            `Top keywords often missing from titles and H1s`,
          ],
          fixSteps: [
            'Identify your top 5-10 target keywords',
            'Include primary keyword in page titles',
            'Use primary keyword in H1 headings',
            'Add keywords naturally to meta descriptions',
            'Ensure keyword density of 1-2% in body content',
          ],
          verifySteps: [
            'Check titles contain target keywords',
            'Verify H1 tags include keywords',
            'Review keyword density in body content',
          ],
          manualCheckRequired: false,
        });
      }
      
      // Check for keyword gaps
      if (keywordAnalysis.keywordGaps.length >= 5) {
        issues.push({
          id: 'keyword-gaps',
          title: `${keywordAnalysis.keywordGaps.length} keyword opportunities identified`,
          severity: 'low',
          category: 'keywords',
          whyItMatters: 'Competitors are ranking for keywords you\'re not targeting. These represent potential traffic opportunities you\'re missing.',
          evidence: [
            `Top gap keywords: ${keywordAnalysis.keywordGaps.slice(0, 5).join(', ')}`,
            `${keywordAnalysis.competitorAnalysis.length} competitor(s) analyzed`,
          ],
          affectedUrls: keywordAnalysis.competitorAnalysis.map(c => c.competitorUrl),
          fixSteps: [
            'Review the suggested keywords in the Keyword Analysis tab',
            'Create content targeting high-opportunity keywords',
            'Optimize existing pages for relevant gap keywords',
            'Build topic clusters around keyword themes',
          ],
          verifySteps: [
            'Track keyword rankings over time',
            'Monitor organic traffic changes',
            'Check Google Search Console for new impressions',
          ],
          manualCheckRequired: true,
        });
      }
    }
    
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
      keywordAnalysis,
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
