import { useEffect, useState } from 'react';

interface ReadyCheck {
  name: string;
  status: 'ok' | 'error';
}

const Readyz = () => {
  const [checks, setChecks] = useState<ReadyCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Perform basic self-checks (no external calls)
    const runChecks = async () => {
      const results: ReadyCheck[] = [];

      // Check if React is rendering
      results.push({ name: 'react_render', status: 'ok' });

      // Check if window is available
      results.push({ 
        name: 'browser_env', 
        status: typeof window !== 'undefined' ? 'ok' : 'error' 
      });

      // Check localStorage availability
      try {
        localStorage.setItem('_readyz_test', '1');
        localStorage.removeItem('_readyz_test');
        results.push({ name: 'local_storage', status: 'ok' });
      } catch {
        results.push({ name: 'local_storage', status: 'error' });
      }

      setChecks(results);
      setLoading(false);
    };

    runChecks();
  }, []);

  const allOk = checks.every((c) => c.status === 'ok');
  const overallStatus = loading ? 'checking' : allOk ? 'ready' : 'degraded';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <span className={`text-lg font-mono ${
            overallStatus === 'ready' ? 'text-green-600' : 
            overallStatus === 'degraded' ? 'text-yellow-600' : 
            'text-muted-foreground'
          }`}>
            {overallStatus}
          </span>
        </div>
        
        {!loading && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-2 font-medium">Check</th>
                  <th className="text-right p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((check) => (
                  <tr key={check.name} className="border-t border-border">
                    <td className="p-2 font-mono text-muted-foreground">{check.name}</td>
                    <td className={`p-2 text-right font-mono ${
                      check.status === 'ok' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {check.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Readyz;
