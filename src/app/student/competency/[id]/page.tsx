'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MessageCircle, Loader2, BookOpen } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  avatarId: string;
  voiceId: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  personas: Persona[];
  rubric: {
    name: string;
  };
  learningObjectivesJson: string[];
}

interface Competency {
  id: string;
  name: string;
  desc: string;
}

export default function CompetencyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch competency details
        const competencyResponse = await fetch(`/api/competencies`);
        if (!competencyResponse.ok) {
          throw new Error('Failed to fetch competencies');
        }
        const competencies = await competencyResponse.json();
        const currentCompetency = competencies.find((c: Competency) => c.id === resolvedParams.id);
        
        if (!currentCompetency) {
          setError('Competency not found');
          return;
        }
        setCompetency(currentCompetency);

        // Fetch cases for this competency
        const casesResponse = await fetch(`/api/cases?competencyId=${resolvedParams.id}`);
        if (!casesResponse.ok) {
          throw new Error('Failed to fetch cases');
        }
        const casesData = await casesResponse.json();
        setCases(casesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load competency data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleStartSimulation = async (caseId: string, personaId: string) => {
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId, personaId, mode: 'chat' }),
      });

      if (response.ok) {
        const { simulationId } = await response.json();
        router.push(`/student/simulations/${simulationId}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to start simulation:', errorData);
        setError(errorData.error || 'Failed to start simulation.');
      }
    } catch (err) {
      console.error('Error starting simulation:', err);
      setError('An unexpected error occurred while starting the simulation.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500" />
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading scenarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center text-red-500">
        <p>{error}</p>
        <Link href="/student">
          <Button className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Competencies
          </Button>
        </Link>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Competency not found</h1>
        <Link href="/student">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Competencies
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/student">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Competencies
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{competency.name}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {competency.desc}
          </p>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No scenarios available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No practice scenarios are available for this competency yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <Card key={caseItem.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {caseItem.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary">{caseItem.rubric.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                {caseItem.learningObjectivesJson && caseItem.learningObjectivesJson.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">Learning Objectives:</h4>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                      {caseItem.learningObjectivesJson.slice(0, 2).map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="line-clamp-2">{objective}</span>
                        </li>
                      ))}
                      {caseItem.learningObjectivesJson.length > 2 && (
                        <li className="text-gray-500 italic">
                          +{caseItem.learningObjectivesJson.length - 2} more...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="mt-auto">
                  <h4 className="font-medium mb-2 text-sm">Available Personas:</h4>
                  {caseItem.personas.length === 0 ? (
                    <p className="text-sm text-gray-500">No personas available for this scenario.</p>
                  ) : (
                    <div className="space-y-2">
                      {caseItem.personas.map((persona) => (
                        <div key={persona.id} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{persona.name}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleStartSimulation(caseItem.id, persona.id)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
