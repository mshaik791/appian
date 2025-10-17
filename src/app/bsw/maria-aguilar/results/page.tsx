'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ResultsData {
  case: {
    id: string;
    title: string;
    competencyCodes: string[];
    competencyTitles: Record<string, string>;
  };
  evaluation: {
    scores: {
      empathyEngagement: number;
      culturalResponsiveness: number;
      ethicsProfessionalism: number;
      assessmentPlanning: number;
      overall: number;
    };
    competencyScores: Record<string, number>;
    evidenceQuotes: string[];
    summary: string;
    suggestions: string[];
    createdAt: string;
  };
}

export default function BswResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || 'bsw-maria-aguilar-s1';
  const simSessionId = searchParams.get('sid') || '';

  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!simSessionId) {
      setError('Missing session ID');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/results?caseId=${encodeURIComponent(caseId)}&simSessionId=${encodeURIComponent(simSessionId)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Results not found. The evaluation may still be processing.');
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to load results');
          }
          return;
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Results fetch error:', err);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [caseId, simSessionId]);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 4) return 'default';
    if (score >= 3) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span>Loading results...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Results Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-red-600">{error}</div>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => router.push('/bsw/maria-aguilar')}>
                Back to Case
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{results.case.title}</h1>
          <p className="text-muted-foreground">Evaluation Results</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/bsw/maria-aguilar')}>
            Back to Case
          </Button>
          <Button>Download PDF</Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(results.evaluation.scores.overall)}>
                {results.evaluation.scores.overall.toFixed(1)}
              </span>
              <span className="text-muted-foreground">/5.0</span>
            </div>
            <Badge variant={getScoreBadgeVariant(results.evaluation.scores.overall)}>
              {results.evaluation.scores.overall >= 4 ? 'Excellent' : 
               results.evaluation.scores.overall >= 3 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Core Competencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Empathy & Engagement</span>
              <Badge variant={getScoreBadgeVariant(results.evaluation.scores.empathyEngagement)}>
                {results.evaluation.scores.empathyEngagement.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Cultural Responsiveness</span>
              <Badge variant={getScoreBadgeVariant(results.evaluation.scores.culturalResponsiveness)}>
                {results.evaluation.scores.culturalResponsiveness.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Ethics & Professionalism</span>
              <Badge variant={getScoreBadgeVariant(results.evaluation.scores.ethicsProfessionalism)}>
                {results.evaluation.scores.ethicsProfessionalism.toFixed(1)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Assessment & Planning</span>
              <Badge variant={getScoreBadgeVariant(results.evaluation.scores.assessmentPlanning)}>
                {results.evaluation.scores.assessmentPlanning.toFixed(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSWE Competencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.case.competencyCodes.map(code => (
              <div key={code} className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium">{code}</div>
                  <div className="text-xs text-muted-foreground">
                    {results.case.competencyTitles[code]}
                  </div>
                </div>
                <Badge variant={getScoreBadgeVariant(results.evaluation.competencyScores[code])}>
                  {results.evaluation.competencyScores[code].toFixed(1)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{results.evaluation.summary}</p>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggestions for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {results.evaluation.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-muted-foreground">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Evidence Quotes */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence from Your Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.evaluation.evidenceQuotes.map((quote, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Quote {index + 1}</div>
                <p className="text-muted-foreground italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
