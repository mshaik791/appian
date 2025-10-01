'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Users, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CaseWithPersonas {
  id: string;
  title: string;
  description: string;
  culturalContextJson: Record<string, unknown>;
  objectivesJson: unknown[];
  rubric: { name: string };
  personas: Array<{
    id: string;
    name: string;
    avatarId: string;
    voiceId: string;
  }>;
  updatedAt: string;
}

export default function StudentDashboard() {
  const [cases, setCases] = useState<CaseWithPersonas[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch('/api/cases');
        if (response.ok) {
          const data = await response.json();
          setCases(data);
        } else {
          console.error('Failed to fetch cases');
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleStartSimulation = async (caseId: string, personaId: string) => {
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          personaId,
          mode: 'chat',
        }),
      });

      if (response.ok) {
        const { simulationId } = await response.json();
        router.push(`/student/simulations/${simulationId}`);
      } else {
        const error = await response.json();
        console.error('Error starting simulation:', error);
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-lg">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Select a case and persona to start a conversation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No cases available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Contact your instructor to assign cases for practice.
            </p>
          </div>
        ) : (
          cases.map((caseItem) => (
            <Card key={caseItem.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl mb-2">{caseItem.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {caseItem.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary">{caseItem.rubric.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Available Personas ({caseItem.personas.length})
                  </h4>
                  {caseItem.personas.length === 0 ? (
                    <p className="text-sm text-gray-500">No personas available</p>
                  ) : (
                    <div className="space-y-2">
                      {caseItem.personas.map((persona) => (
                        <div
                          key={persona.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                        >
                          <div>
                            <p className="font-medium text-sm">{persona.name}</p>
                            <p className="text-xs text-gray-500">
                              {persona.avatarId} • {persona.voiceId}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleStartSimulation(caseItem.id, persona.id)}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Updated {formatDate(new Date(caseItem.updatedAt))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}