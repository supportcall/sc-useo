import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Lock, 
  Server, 
  RefreshCw, 
  Key, 
  FileWarning,
  Globe,
  Zap,
  Eye,
  AlertTriangle
} from 'lucide-react';

const ProductionChecklist = () => {
  const sections = [
    {
      title: 'TLS / SSL Configuration',
      icon: Lock,
      items: [
        'SSL certificate installed and valid (use Let\'s Encrypt / AutoSSL)',
        'Certificate auto-renewal configured',
        'HTTPS enforced (redirect HTTP → HTTPS)',
        'HSTS header enabled with appropriate max-age',
        'Modern TLS versions only (TLS 1.2+, disable SSLv3/TLS 1.0/1.1)',
        'Strong cipher suites configured',
        'Run SSL Labs test (ssllabs.com/ssltest) - aim for A or A+',
      ],
    },
    {
      title: 'Firewall & Network Security',
      icon: Shield,
      items: [
        'Firewall enabled (CSF, iptables, or cPanel Firewall)',
        'Only ports 80 and 443 open publicly',
        'SSH on non-standard port or restricted by IP',
        'Fail2ban or similar brute-force protection installed',
        'DDoS protection enabled (if available)',
        'Private network for database connections (if applicable)',
      ],
    },
    {
      title: 'SSH & Access Control',
      icon: Key,
      items: [
        'SSH key authentication enabled',
        'Password authentication disabled',
        'Root login disabled',
        'sudo configured for admin user',
        'Two-factor authentication enabled (if supported)',
        'Idle timeout configured',
      ],
    },
    {
      title: 'Server Hardening',
      icon: Server,
      items: [
        'Operating system fully patched',
        'Automatic security updates enabled',
        'Unnecessary services disabled',
        'File permissions correctly set (no world-writable files)',
        'Web user isolated (PHP runs as site user)',
        'open_basedir or similar restrictions enabled',
        'Disable dangerous PHP functions (exec, shell_exec, etc.)',
      ],
    },
    {
      title: 'Web Application Firewall',
      icon: FileWarning,
      items: [
        'ModSecurity installed and enabled',
        'OWASP Core Rule Set (CRS) configured',
        'Rules updated regularly',
        'False positives reviewed and whitelisted appropriately',
        'Attack logging enabled',
      ],
    },
    {
      title: 'Logging & Monitoring',
      icon: Eye,
      items: [
        'Access logs enabled and rotated',
        'Error logs enabled and monitored',
        'Log retention policy defined',
        'Sensitive data redacted from logs',
        'Uptime monitoring configured',
        'Alerts for security events',
      ],
    },
    {
      title: 'Application Updates',
      icon: RefreshCw,
      items: [
        'Node.js on current LTS version',
        'All npm dependencies up to date',
        'npm audit shows no critical vulnerabilities',
        'Regular dependency update schedule',
        'Lockfile committed and used',
      ],
    },
    {
      title: 'Reverse Proxy Configuration',
      icon: Globe,
      items: [
        'Apache/Nginx configured as reverse proxy to Node.js',
        'Proxy headers set correctly (X-Forwarded-For, etc.)',
        'Trust proxy configured appropriately in app',
        'Static assets served directly by web server',
        'Gzip/Brotli compression enabled',
        'Cache headers configured for static files',
      ],
    },
    {
      title: 'Security Headers',
      icon: Zap,
      items: [
        'Content-Security-Policy header configured',
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: DENY',
        'Referrer-Policy: no-referrer',
        'Permissions-Policy configured',
        'Cross-Origin-Opener-Policy: same-origin',
        'Cross-Origin-Resource-Policy: same-origin',
        'Cache-Control: no-store for sensitive pages',
      ],
    },
    {
      title: 'Rate Limiting & Abuse Prevention',
      icon: AlertTriangle,
      items: [
        'Rate limiting configured per IP',
        'Request size limits enforced',
        'Timeout values set appropriately',
        'Concurrent connection limits',
        'Slow request timeout (slowloris protection)',
      ],
    },
  ];

  return (
    <Layout>
      <div className="container-narrow py-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Production Checklist</h1>
        <p className="text-muted-foreground mb-4">
          Security hardening checklist for cPanel VPS deployment
        </p>
        <div className="bg-muted/50 border rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> This checklist is for your convenience as you work through your deployment. 
            You can tick off items as you complete them to track your progress. However, your selections are 
            <strong className="text-foreground"> not saved</strong> — if you refresh the page or navigate away, 
            the checklist will reset. Consider keeping this page open while you work, or use it as a reference guide.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
                <CardDescription>
                  Complete all items before going live
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Checkbox id={`${section.title}-${index}`} className="mt-0.5" />
                      <label 
                        htmlFor={`${section.title}-${index}`}
                        className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                      >
                        {item}
                      </label>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Server hardening can be complex. If you need professional assistance with 
                securing your production environment, our team can help.
              </p>
              <a 
                href="https://supportcall.com.au" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline font-medium"
              >
                Contact SupportCALL for professional support →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProductionChecklist;
