"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface EvaluationData {
  evaluation: {
    empathy: number;
    culturalResponse: number;
    ethicsAwareness: number;
    activeListening: number;
    summary: string;
    caseTitle: string;
    competencyName: string;
  };
}

export default function ReflectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

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

        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (err) {
        console.error('Error loading results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [caseId, sid]);

  const handleSaveReflection = async () => {
    if (!reflection.trim()) {
      alert('Please write a reflection before saving.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          caseId,
          simSessionId: sid,
          response: reflection.trim(),
        }),
      });

      if (response.ok) {
        alert('Reflection saved successfully!');
        router.push('/student'); // Navigate back to student dashboard
      } else {
        const errorData = await response.json();
        alert(`Failed to save reflection: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('Failed to save reflection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No results found</p>
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
    { name: 'Empathy', score: evaluation.empathy },
    { name: 'Cultural Response', score: evaluation.culturalResponse },
    { name: 'Ethics Awareness', score: evaluation.ethicsAwareness },
    { name: 'Active Listening', score: evaluation.activeListening },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reflection
          </h1>
          <p className="text-lg text-gray-600 mb-1">{evaluation.caseTitle}</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {evaluation.competencyName}
            </span>
          </div>
        </div>

        {/* Learning Objective */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Objective</h2>
          <p className="text-gray-700">
            Practice your social work skills and reflect on your performance in this simulation.
          </p>
        </div>

        {/* Scores Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {scores.map((item) => (
              <div key={item.name} className="text-center">
                <div className="mb-2">
                  <div className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{getScoreText(item.score)}</p>
              </div>
            ))}
          </div>
          
          {/* AI Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Evaluator Summary</h3>
            <p className="text-gray-800">{evaluation.summary}</p>
          </div>
        </div>

        {/* Reflection Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Reflection</h2>
          <p className="text-gray-600 mb-4">
            Take a moment to reflect on your performance. What went well? What would you do differently? 
            How does this connect to your learning goals?
          </p>
          
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Write your reflection here..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Results
            </button>
            
            <button
              onClick={handleSaveReflection}
              disabled={saving || !reflection.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${
                saving || !reflection.trim()
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
