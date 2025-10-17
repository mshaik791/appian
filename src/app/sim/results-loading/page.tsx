"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResultsLoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  const caseId = searchParams.get('caseId');
  const sid = searchParams.get('sid');

  const steps = [
    "Collecting transcript...",
    "Generating scores...",
    "Saving results..."
  ];

  useEffect(() => {
    if (!caseId) {
      router.replace('/demo');
      return;
    }

    const pollResults = async () => {
      try {
        const params = new URLSearchParams();
        if (caseId) params.set('caseId', caseId);
        if (sid) params.set('simSessionId', sid);

        const response = await fetch(`/api/results?${params.toString()}`, {
          credentials: 'include',
        });

        if (response.status === 200) {
          // Results are ready, navigate to results page
          const resultParams = new URLSearchParams();
          if (caseId) resultParams.set('caseId', caseId);
          if (sid) resultParams.set('sid', sid);
          
          router.replace(`/sim/results?${resultParams.toString()}`);
        } else if (response.status === 202 || response.status === 404) {
          // 202: pending, 404: not created yet — keep polling silently
          setTimeout(pollResults, 1200);
        } else {
          // Log once, then continue polling
          console.warn('Results not ready yet, status:', response.status);
          setTimeout(pollResults, 2000);
        }
      } catch (error) {
        console.error('Error polling results:', error);
        setTimeout(pollResults, 2000); // Retry after 2 seconds
      }
    };

    // Start polling after a short delay
    const timeoutId = setTimeout(pollResults, 1000);

    return () => clearTimeout(timeoutId);
  }, [caseId, sid, router]);

  // Cycle through steps for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Your Results
          </h1>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center justify-center p-3 rounded-lg transition-colors duration-300 ${
                  index === currentStep
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentStep ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm font-medium">{step}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-6">
            This usually takes 10-30 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
