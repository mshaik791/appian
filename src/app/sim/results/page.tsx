"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface EvaluationData {
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

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const caseId = searchParams.get('caseId');
  const sid = searchParams.get('sid');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const params = new URLSearchParams();
        if (caseId) params.set('caseId', caseId);
        if (sid) params.set('simSessionId', sid);

        const response = await fetch(`/api/results?${params.toString()}`, {
          credentials: 'include',
        });

        if (response.status === 200) {
          const result = await response.json();
          setData(result);
        } else if (response.status === 202) {
          // Not ready yet, return to loader
          const qp = new URLSearchParams();
          if (caseId) qp.set('caseId', caseId);
          if (sid) qp.set('sid', sid);
          router.replace(`/sim/results-loading?${qp.toString()}`);
        } else {
          setError('Failed to load results');
        }
      } catch (err) {
        setError('Error loading results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [caseId, sid]);

  const handleContinueToReflection = () => {
    const params = new URLSearchParams();
    if (caseId) params.set('caseId', caseId);
    if (sid) params.set('sid', sid);
    
    router.push(`/sim/reflection?${params.toString()}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreText = (score: number) => {
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading || !data || !data.evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No results found'}</p>
          <button
            onClick={() => router.push('/demo')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Demo
          </button>
        </div>
      </div>
    );
  }

  const { evaluation } = data;
  const scores = [
    { name: 'Empathy & Engagement', score: evaluation.scores.empathyEngagement, evidence: evaluation.evidenceQuotes[0] || '' },
    { name: 'Cultural Responsiveness', score: evaluation.scores.culturalResponsiveness, evidence: evaluation.evidenceQuotes[1] || '' },
    { name: 'Ethics & Professionalism', score: evaluation.scores.ethicsProfessionalism, evidence: evaluation.evidenceQuotes[2] || '' },
    { name: 'Assessment & Planning', score: evaluation.scores.assessmentPlanning, evidence: evaluation.evidenceQuotes[3] || '' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Simulation Results
              </h1>
              <p className="text-lg text-gray-600 mb-1">{data.case.title}</p>
              <p className="text-sm text-blue-600 font-medium">MSW Clinical Assessment</p>
            </div>
            <button
              onClick={handleContinueToReflection}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Reflection
            </button>
          </div>
        </div>

        {/* Scores Heatmap */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scores.map((item) => (
              <div key={item.name} className="text-center">
                <div className="mb-2">
                  <div className={`w-16 h-16 rounded-full ${getScoreColor(item.score)} mx-auto flex items-center justify-center text-white font-bold text-lg`}>
                    {item.score}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{getScoreText(item.score)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluator Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evaluator Summary</h2>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">{evaluation.summary}</p>
          </div>
        </div>

        {/* Evidence */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence</h2>
          <div className="space-y-4">
            {evaluation.evidenceQuotes.map((quote, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-gray-700 italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggestions for Improvement</h2>
          <div className="space-y-3">
            {evaluation.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">{index + 1}</span>
                </div>
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
