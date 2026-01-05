import { AnalysisResult, Issue } from '@/types/seo';

/**
 * Self-contained PDF generator using browser print API
 * Creates a styled HTML document and triggers print-to-PDF
 */
export function generatePDFReport(result: AnalysisResult): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow popups.');
  }

  const htmlContent = buildPDFHtml(result);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

function buildPDFHtml(result: AnalysisResult): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const severityColors: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
    high: { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
    medium: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    low: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  };

  const sortedIssues = [...result.issues].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  const issuesByCategory = sortedIssues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  const scoreColor = result.score >= 80 ? '#166534' : result.score >= 50 ? '#854d0e' : '#991b1b';
  const scoreBackground = result.score >= 80 ? '#f0fdf4' : result.score >= 50 ? '#fefce8' : '#fef2f2';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Analysis Report - ${escapeHtml(result.config.url)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    @media print {
      body {
        padding: 20px;
        font-size: 11pt;
      }
      .page-break {
        page-break-before: always;
      }
      .no-break {
        page-break-inside: avoid;
      }
    }
    
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 2px solid #e5e7eb;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }
    
    .header .url {
      font-size: 14px;
      color: #6b7280;
      word-break: break-all;
    }
    
    .header .date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    
    .score-section {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      padding: 30px;
      background: ${scoreBackground};
      border-radius: 12px;
      margin-bottom: 30px;
    }
    
    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .score-value {
      font-size: 42px;
      font-weight: 800;
      color: ${scoreColor};
    }
    
    .score-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    
    .stat-box {
      text-align: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
    }
    
    .stat-critical .stat-value { color: #991b1b; }
    .stat-high .stat-value { color: #9a3412; }
    .stat-medium .stat-value { color: #854d0e; }
    .stat-low .stat-value { color: #166534; }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .category-section {
      margin-bottom: 24px;
    }
    
    .category-title {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 12px;
      background: #f3f4f6;
      padding: 8px 12px;
      border-radius: 6px;
    }
    
    .issue-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    
    .issue-header {
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .severity-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    
    .issue-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      flex: 1;
    }
    
    .issue-body {
      padding: 0 16px 16px 16px;
    }
    
    .issue-description {
      font-size: 13px;
      color: #4b5563;
      margin-bottom: 12px;
    }
    
    .steps-section {
      margin-top: 12px;
    }
    
    .steps-title {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .steps-list {
      margin: 0;
      padding-left: 20px;
    }
    
    .steps-list li {
      font-size: 12px;
      color: #4b5563;
      margin-bottom: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
    }
    
    .privacy-note {
      background: #f3f4f6;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 11px;
      color: #6b7280;
      text-align: center;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SEO Analysis Report</h1>
    <div class="url">${escapeHtml(result.config.url)}</div>
    <div class="date">Generated on ${date}</div>
  </div>
  
  <div class="privacy-note">
    🔒 This report was generated in your browser. No data was stored or transmitted to external servers.
  </div>
  
  <div class="score-section">
    <div class="score-circle">
      <div class="score-value">${result.score}</div>
      <div class="score-label">Score</div>
    </div>
    <div class="summary-stats">
      <div class="stat-box stat-critical">
        <div class="stat-value">${result.summary.criticalIssues}</div>
        <div class="stat-label">Critical</div>
      </div>
      <div class="stat-box stat-high">
        <div class="stat-value">${result.summary.highIssues}</div>
        <div class="stat-label">High</div>
      </div>
      <div class="stat-box stat-medium">
        <div class="stat-value">${result.summary.mediumIssues}</div>
        <div class="stat-label">Medium</div>
      </div>
      <div class="stat-box stat-low">
        <div class="stat-value">${result.summary.lowIssues}</div>
        <div class="stat-label">Low</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <h2 class="section-title">Issues Found (${result.issues.length} total)</h2>
    
    ${Object.entries(issuesByCategory).map(([category, issues]) => `
      <div class="category-section no-break">
        <div class="category-title">${formatCategoryName(category)} (${issues.length})</div>
        ${issues.map(issue => renderIssueCard(issue, severityColors)).join('')}
      </div>
    `).join('')}
  </div>
  
  ${result.pages.length > 0 ? `
  <div class="section page-break">
    <h2 class="section-title">Pages Analyzed (${result.pages.length})</h2>
    <ul style="padding-left: 20px; font-size: 12px; color: #4b5563;">
      ${result.pages.slice(0, 50).map(page => `<li style="margin-bottom: 4px;">${escapeHtml(page.url)}</li>`).join('')}
      ${result.pages.length > 50 ? `<li style="color: #9ca3af;">...and ${result.pages.length - 50} more pages</li>` : ''}
    </ul>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Generated by SEO Analysis Portal • Privacy-First • No Data Stored</p>
    <p style="margin-top: 4px;">This is a one-time analysis. Run a new analysis to check for updates.</p>
  </div>
</body>
</html>`;
}

function renderIssueCard(issue: Issue, colors: Record<string, { bg: string; text: string; border: string }>): string {
  const color = colors[issue.severity] || colors.medium;
  
  return `
    <div class="issue-card no-break">
      <div class="issue-header" style="background: ${color.bg}; border-bottom: 1px solid ${color.border};">
        <span class="severity-badge" style="background: ${color.border}; color: ${color.text};">
          ${issue.severity}
        </span>
        <span class="issue-title">${escapeHtml(issue.title)}</span>
      </div>
      <div class="issue-body">
        ${issue.whyItMatters ? `<div class="issue-description">${escapeHtml(issue.whyItMatters)}</div>` : ''}
        
        ${issue.fixSteps && issue.fixSteps.length > 0 ? `
          <div class="steps-section">
            <div class="steps-title">How to Fix</div>
            <ol class="steps-list">
              ${issue.fixSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        ${issue.verifySteps && issue.verifySteps.length > 0 ? `
          <div class="steps-section">
            <div class="steps-title">Verification</div>
            <ol class="steps-list">
              ${issue.verifySteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    'indexing': 'Crawl & Indexing',
    'on-page': 'On-Page SEO',
    'technical': 'Technical SEO',
    'performance': 'Performance',
    'structured-data': 'Structured Data',
    'images': 'Images',
    'internal-linking': 'Internal Linking',
    'content': 'Content',
    'security': 'Security',
    'marketing': 'Marketing & Analytics',
    'blacklist': 'Blacklist & Reputation',
  };
  return names[category] || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
