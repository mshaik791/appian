"use client";

import InteractiveAvatar from "@/components/demo/InteractiveAvatar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function App() {
  const searchParams = useSearchParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [personaData, setPersonaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimulationData = async () => {
      const simulationId = searchParams.get('sid');
      const caseId = searchParams.get('caseId');
      const personaId = searchParams.get('personaId');
      
      console.log('Demo page - simulationId:', simulationId, 'caseId:', caseId, 'personaId:', personaId);
      
      if (simulationId) {
        try {
          const response = await fetch(`/api/simulations/${simulationId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          console.log('Simulation API response status:', response.status);
          if (response.ok) {
            const simulationData = await response.json();
            console.log('Simulation data:', simulationData);
            
            // Extract case and persona data from simulation
            if (simulationData.case) {
              setCaseData({
                ...simulationData.case,
                competency: { name: 'Social Work Practice' }, // We'll need to fetch this separately
                learningObjectivesJson: simulationData.case.objectivesJson || []
              });
            }
            
            if (simulationData.persona) {
              setPersonaData(simulationData.persona);
            }
          } else {
            console.error('Simulation API call failed:', response.status, response.statusText);
            setFallbackData();
          }
        } catch (error) {
          console.error('Error fetching simulation data:', error);
          setFallbackData();
        }
      } else {
        // No simulationId provided, show fallback data
        setFallbackData();
      }
      setLoading(false);
    };

    const setFallbackData = () => {
      setCaseData({
        competency: { name: 'Social Work Practice' },
        description: 'Practice your social work skills with this interactive scenario.',
        learningObjectivesJson: ['Develop communication skills', 'Practice active listening', 'Build rapport with clients']
      });
    };

    fetchSimulationData();
  }, [searchParams]);

  return (
    <div className="w-screen h-screen flex">
      {/* Main Content - Original Layout */}
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        <div className="w-full">
          <InteractiveAvatar />
        </div>
      </div>
      
      {/* Side Panel */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-gray-300 rounded mb-4"></div>
          </div>
        ) : caseData ? (
          <div className="space-y-6">
            {/* Competency */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Competency
              </h3>
              <p className="text-lg font-medium text-gray-900">
                {caseData.competency?.name || 'General Practice'}
              </p>
            </div>

            {/* Persona Info */}
            {personaData && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Character
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{personaData.name}</p>
                    {personaData.backgroundJson && typeof personaData.backgroundJson === 'object' && 'age' in personaData.backgroundJson && (
                      <p className="text-sm text-gray-600">Age: {personaData.backgroundJson.age}</p>
                    )}
                  </div>
                  {personaData.backgroundJson && typeof personaData.backgroundJson === 'object' && 'description' in personaData.backgroundJson && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Background</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {personaData.backgroundJson.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Case Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Scenario
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {caseData.description || 'Practice your social work skills with this interactive scenario.'}
              </p>
            </div>

            {/* Learning Objectives */}
            {caseData.learningObjectivesJson && caseData.learningObjectivesJson.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {caseData.learningObjectivesJson.map((objective: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-sm">No case information available</p>
            <p className="text-xs mt-2">Start a simulation from the main app to see details here.</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Debug info:</p>
              <p>simulationId: {searchParams.get('sid') || 'none'}</p>
              <p>caseId: {searchParams.get('caseId') || 'none'}</p>
              <p>personaId: {searchParams.get('personaId') || 'none'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
