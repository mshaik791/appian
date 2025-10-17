'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BswResultsLoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || 'bsw-maria-aguilar-s1';
  const simSessionId = searchParams.get('sid') || '';
  
  const [status, setStatus] = useState<'grading' | 'complete' | 'error'>('grading');
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!simSessionId) {
      setError('Missing session ID');
      setStatus('error');
      return;
    }

    const gradeSession = async () => {
      try {
        setStatus('grading');
        
        const response = await fetch('/api/bsw/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId, simSessionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Grading failed');
        }

        const result = await response.json();
        
        if (result.already) {
          // Evaluation already exists, go straight to results
          router.replace(`/bsw/maria-aguilar/results?caseId=${encodeURIComponent(caseId)}&sid=${encodeURIComponent(simSessionId)}`);
        } else {
          // Grading completed, go to results
          router.replace(`/bsw/maria-aguilar/results?caseId=${encodeURIComponent(caseId)}&sid=${encodeURIComponent(simSessionId)}`);
        }
      } catch (err) {
        console.error('Grading error:', err);
        setError(err instanceof Error ? err.message : 'Grading failed');
        setStatus('error');
      }
    };

    gradeSession();
  }, [caseId, simSessionId, router]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError('');
    setStatus('grading');
    
    // Retry the grading process
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (status === 'grading') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Evaluating Your Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-muted-foreground">Analyzing your responses...</span>
            </div>
            <div className="text-sm text-muted-foreground">
              This may take a few moments. Please don't close this page.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-red-600">
              {error}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} disabled={retryCount >= 3}>
                {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/bsw/maria-aguilar')}>
                Back to Case
              </Button>
            </div>
            {retryCount >= 3 && (
              <div className="text-sm text-muted-foreground">
                If this problem persists, please contact your instructor.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
