'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, ArrowRight } from 'lucide-react';

interface Competency {
  id: string;
  name: string;
  desc: string;
  _count: {
    cases: number;
  };
}

export default function StudentDashboard() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const response = await fetch('/api/competencies');
        if (response.ok) {
          const data = await response.json();
          setCompetencies(data);
        } else {
          console.error('Failed to fetch competencies');
        }
      } catch (error) {
        console.error('Error fetching competencies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencies();
  }, []);

  const handleCompetencyClick = (competencyId: string) => {
    router.push(`/student/competency/${competencyId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-lg">Loading competencies...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Choose a Competency</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Select a competency area to practice your social work skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competencies.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No competencies available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Contact your instructor to set up competency areas.
            </p>
          </div>
        ) : (
          competencies.map((competency) => (
            <Card 
              key={competency.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-blue-300 dark:hover:border-blue-600"
              onClick={() => handleCompetencyClick(competency.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl mb-2">{competency.name}</CardTitle>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {competency.desc}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {competency._count.cases} scenario{competency._count.cases !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}