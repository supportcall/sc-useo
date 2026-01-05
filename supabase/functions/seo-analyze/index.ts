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
